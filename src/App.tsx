import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useMemo, useState } from "react";
import { BAND_LEVELS, PHASES, WORKOUTS } from "./data";
import { db } from "./db";
import { getExercise, getProgrammeState, getWorkout, prescriptionsFor, progressForExercises } from "./programme";
import type { PhaseId, Prescription, SessionLog, SessionType, SetLog } from "./types";

type Screen = "next" | "programme" | "progress" | "settings";
type Route = { screen: Screen } | { screen: "session"; type: SessionType };

export default function App() {
  const [route, setRoute] = useState<Route>({ screen: "next" });
  const sessionLogs = useLiveQuery(() => db.sessionLogs.toArray(), []) ?? [];
  const state = useMemo(() => getProgrammeState(sessionLogs), [sessionLogs]);

  if (route.screen === "session") {
    return <SessionRunner type={route.type} phaseId={state.phaseId} week={state.currentWeek} onDone={() => setRoute({ screen: "next" })} />;
  }

  return (
    <div className="appShell">
      <main>
        {route.screen === "next" && <NextUp state={state} onStart={(type) => setRoute({ screen: "session", type })} />}
        {route.screen === "programme" && <Programme phaseId={state.phaseId} />}
        {route.screen === "progress" && <Progress />}
        {route.screen === "settings" && <Settings />}
      </main>
      <nav className="bottomNav" aria-label="Primary">
        {[
          ["next", "Next"],
          ["programme", "Plan"],
          ["progress", "Progress"],
          ["settings", "Data"]
        ].map(([id, label]) => (
          <button key={id} className={route.screen === id ? "active" : ""} onClick={() => setRoute({ screen: id as Screen })}>
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function NextUp({ state, onStart }: { state: ReturnType<typeof getProgrammeState>; onStart: (type: SessionType) => void }) {
  const phase = PHASES.find((p) => p.id === state.phaseId)!;
  const nextWorkout = getWorkout(state.nextType);
  const progressPct = Math.round((state.totalCompleted / 24) * 100);

  return (
    <section className="screen">
      <header className="hero">
        <div>
          <p className="eyebrow">Week {state.currentWeek} of 8 - {phase.name}</p>
          <h1>BandFit Golf</h1>
          <p>{phase.intent}</p>
        </div>
        <div className="scoreTile">
          <strong>{progressPct}%</strong>
          <span>programme</span>
        </div>
      </header>

      <section className="panel nextPanel">
        <p className="eyebrow">Next session</p>
        <h2>{nextWorkout.title}</h2>
        <p>{nextWorkout.emphasis} - {nextWorkout.duration}</p>
        <button className="primary" onClick={() => onStart(nextWorkout.id)}>Start {nextWorkout.id}</button>
      </section>

      <section className="weekGrid">
        {WORKOUTS.map((workout) => (
          <article key={workout.id} className={workout.id === state.nextType ? "workoutCard current" : "workoutCard"}>
            <div className="cardTop">
              <span>{workout.id}</span>
              <small>{state.weeklyCounts[workout.id] > 0 ? "Done this week" : workout.intensity}</small>
            </div>
            <h3>{workout.title}</h3>
            <p>{workout.emphasis}</p>
            <button className="secondary" onClick={() => onStart(workout.id)}>Open</button>
          </article>
        ))}
      </section>

      <section className="notice">
        <strong>Door anchor check</strong>
        <span>Use a sturdy closed door and set the pull so the band draws the door into the frame where possible.</span>
      </section>
    </section>
  );
}

function Programme({ phaseId }: { phaseId: PhaseId }) {
  const phase = PHASES.find((p) => p.id === phaseId)!;

  return (
    <section className="screen">
      <h1>Programme</h1>
      <div className="phaseRow">
        {PHASES.map((p) => (
          <div key={p.id} className={p.id === phaseId ? "phase active" : "phase"}>
            <strong>{p.name}</strong>
            <span>Weeks {p.weeks}</span>
          </div>
        ))}
      </div>
      <p className="muted">{phase.intent}</p>
      {WORKOUTS.map((workout) => (
        <section className="panel" key={workout.id}>
          <div className="sectionHead">
            <div>
              <p className="eyebrow">{workout.id} - {workout.duration}</p>
              <h2>{workout.title}</h2>
            </div>
            <strong>{workout.intensity}</strong>
          </div>
          <ExerciseList prescriptions={workout.prescriptions[phaseId]} />
        </section>
      ))}
    </section>
  );
}

function Progress() {
  const sessionLogs = useLiveQuery(() => db.sessionLogs.toArray(), []) ?? [];
  const setLogs = useLiveQuery(() => db.setLogs.toArray(), []) ?? [];
  const state = getProgrammeState(sessionLogs);
  const progress = progressForExercises(sessionLogs, setLogs).slice(0, 12);

  return (
    <section className="screen">
      <h1>Progress</h1>
      <div className="statsGrid">
        <Stat label="Sessions" value={`${state.totalCompleted}/24`} />
        <Stat label="Week" value={`${state.currentWeek}/8`} />
        <Stat label="This week" value={`${state.weeklyCounts.A + state.weeklyCounts.B + state.weeklyCounts.C}/3`} />
      </div>
      <section className="panel">
        <h2>Progression signals</h2>
        {progress.length === 0 ? (
          <p className="muted">No sets logged yet. Complete Workout A to start building recommendations.</p>
        ) : (
          progress.map((item) => (
            <article className="progressRow" key={item.exercise.id}>
              <div>
                <strong>{item.exercise.name}</strong>
                <span>{item.completedSets} sets logged{item.latestBand ? ` - latest ${item.latestBand}` : ""}</span>
              </div>
              <p>{item.recommendation}</p>
            </article>
          ))
        )}
      </section>
    </section>
  );
}

function Settings() {
  const sessionLogs = useLiveQuery(() => db.sessionLogs.toArray(), []) ?? [];
  const setLogs = useLiveQuery(() => db.setLogs.toArray(), []) ?? [];
  const [notice, setNotice] = useState<string | null>(null);

  async function exportData() {
    const blob = new Blob([JSON.stringify({ sessionLogs, setLogs }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bandfit-golf-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Export downloaded.");
  }

  return (
    <section className="screen">
      <h1>Data</h1>
      <section className="panel">
        <h2>Local records</h2>
        <p className="muted">Workout history is stored on this device. Export before clearing browser data.</p>
        <button className="secondary" onClick={exportData}>Export backup</button>
        {notice && <p className="saved">{notice}</p>}
      </section>
      <section className="panel">
        <h2>Known technical debt</h2>
        <ul className="plainList">
          <li>No cloud sync yet.</li>
          <li>No video library yet; exercise cues are text-only.</li>
          <li>Band tension is recorded as a simple level, not measured force.</li>
        </ul>
      </section>
    </section>
  );
}

function SessionRunner({ type, phaseId, week, onDone }: { type: SessionType; phaseId: PhaseId; week: number; onDone: () => void }) {
  const workout = getWorkout(type);
  const prescriptions = prescriptionsFor(type, phaseId);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [startedAt] = useState(() => Date.now());
  const [created, setCreated] = useState(false);
  const [complete, setComplete] = useState(false);
  const setLogs = useLiveQuery(() => db.setLogs.where("sessionLogId").equals(sessionId).toArray(), [sessionId]) ?? [];

  useEffect(() => {
    let cancelled = false;
    const log: SessionLog = {
      id: sessionId,
      templateId: type,
      date: new Date().toISOString(),
      week,
      phaseId,
      durationMin: null,
      completed: false,
      notes: ""
    };
    db.sessionLogs.add(log).then(() => {
      if (!cancelled) setCreated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [phaseId, sessionId, type, week]);

  async function finish() {
    await db.sessionLogs.update(sessionId, {
      completed: true,
      durationMin: Math.max(1, Math.round((Date.now() - startedAt) / 60000))
    });
    setComplete(true);
  }

  if (complete) {
    return (
      <section className="screen">
        <h1>Session complete</h1>
        <section className="panel">
          <p>{setLogs.length} sets logged for {workout.title}.</p>
          <p className="muted">Next time, progress only when reps are clean and RPE stays at 8 or below.</p>
          <button className="primary" onClick={onDone}>Back to next session</button>
        </section>
      </section>
    );
  }

  return (
    <section className="screen sessionScreen">
      <button className="textButton" onClick={onDone}>Cancel session</button>
      <header className="sessionHeader">
        <p className="eyebrow">Week {week} - {type}</p>
        <h1>{workout.title}</h1>
        <p>{workout.emphasis}</p>
      </header>
      <ExerciseList prescriptions={prescriptions} sessionId={created ? sessionId : undefined} setLogs={setLogs} />
      <button className="primary finish" onClick={finish} disabled={!created}>Finish session</button>
    </section>
  );
}

function ExerciseList({ prescriptions, sessionId, setLogs = [] }: { prescriptions: Prescription[]; sessionId?: string; setLogs?: SetLog[] }) {
  const sections = Array.from(new Set(prescriptions.map((p) => p.section)));
  return (
    <>
      {sections.map((section) => (
        <div className="exerciseSection" key={section}>
          <h3>{section}</h3>
          {prescriptions.filter((p) => p.section === section).map((p) => (
            <ExerciseCard key={p.id} prescription={p} sessionId={sessionId} setLogs={setLogs.filter((s) => s.prescriptionId === p.id)} />
          ))}
        </div>
      ))}
    </>
  );
}

function ExerciseCard({ prescription, sessionId, setLogs }: { prescription: Prescription; sessionId?: string; setLogs: SetLog[] }) {
  const exercise = getExercise(prescription.exerciseId);
  const [value, setValue] = useState("");
  const [band, setBand] = useState("");
  const [rpe, setRpe] = useState("");

  async function logSet() {
    if (!sessionId) return;
    await db.setLogs.add({
      id: crypto.randomUUID(),
      sessionLogId: sessionId,
      prescriptionId: prescription.id,
      exerciseId: exercise.id,
      setNo: setLogs.length + 1,
      value: value ? Number(value) : null,
      bandLevel: exercise.equipment.includes("Band") ? band || null : null,
      rpe: rpe ? Number(rpe) : null
    });
    setValue("");
  }

  return (
    <article className="exerciseCard">
      <div className="exerciseMain">
        <div>
          <strong>{exercise.name}</strong>
          <span>{prescription.sets} x {prescription.target}{prescription.rpe ? ` - RPE ${prescription.rpe}` : ""}</span>
        </div>
        <small>{exercise.setup}</small>
      </div>
      <p>{exercise.cues}</p>
      {prescription.note && <p className="note">{prescription.note}</p>}
      {sessionId && (
        <div className="logGrid">
          <input
            type="number"
            inputMode="decimal"
            placeholder={prescription.tracking === "seconds" ? "Secs" : prescription.tracking === "quality" ? "Score" : "Reps"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          {exercise.equipment.includes("Band") && (
            <select value={band} onChange={(e) => setBand(e.target.value)} aria-label="Band level">
              <option value="">Band</option>
              {BAND_LEVELS.map((level) => <option key={level}>{level}</option>)}
            </select>
          )}
          <select value={rpe} onChange={(e) => setRpe(e.target.value)} aria-label="RPE">
            <option value="">RPE</option>
            {[6, 7, 8, 9, 10].map((n) => <option key={n}>{n}</option>)}
          </select>
          <button className="secondary compact" onClick={logSet}>Log</button>
        </div>
      )}
      {setLogs.length > 0 && (
        <div className="setPills">
          {setLogs.map((set) => (
            <span key={set.id}>Set {set.setNo}: {set.value ?? "-"}{set.bandLevel ? `, ${set.bandLevel}` : ""}{set.rpe ? `, RPE ${set.rpe}` : ""}</span>
          ))}
        </div>
      )}
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
