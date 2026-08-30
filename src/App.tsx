import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { BAND_LEVELS, PHASES, WORKOUTS } from "./data";
import { db } from "./db";
import { getExercise, getProgrammeState, getWorkout, prescriptionsFor, progressForExercises } from "./programme";
import type { MetricLog, MetricType, PhaseId, Prescription, SessionLog, SessionType, SetLog, Side } from "./types";

type Screen = "next" | "programme" | "progress" | "metrics" | "settings";
type Route = { screen: Screen } | { screen: "session"; type: SessionType } | { screen: "exercise"; exerciseId: string };

const NAV: { id: Screen; label: string }[] = [
  { id: "next", label: "Next Up" },
  { id: "programme", label: "Programme" },
  { id: "progress", label: "Progress" },
  { id: "metrics", label: "Metrics" },
  { id: "settings", label: "Settings" }
];

export default function App() {
  const [route, setRoute] = useState<Route>({ screen: "next" });
  const sessionLogs = useLiveQuery(() => db.sessionLogs.toArray(), []) ?? [];
  const state = useMemo(() => getProgrammeState(sessionLogs), [sessionLogs]);

  if (route.screen === "session") {
    return <SessionRunner type={route.type} phaseId={state.phaseId} week={state.currentWeek} onDone={() => setRoute({ screen: "next" })} />;
  }

  if (route.screen === "exercise") {
    return <ExerciseDetail exerciseId={route.exerciseId} onBack={() => setRoute({ screen: "programme" })} />;
  }

  return (
    <div className="appShell">
      <main>
        {route.screen === "next" && <NextUp state={state} onStart={(type) => setRoute({ screen: "session", type })} />}
        {route.screen === "programme" && <Programme phaseId={state.phaseId} onSelectExercise={(exerciseId) => setRoute({ screen: "exercise", exerciseId })} />}
        {route.screen === "progress" && <Progress />}
        {route.screen === "metrics" && <Metrics />}
        {route.screen === "settings" && <Settings />}
      </main>
      <BottomNav active={route.screen} onNavigate={(screen) => setRoute({ screen })} />
    </div>
  );
}

function BottomNav({ active, onNavigate }: { active: Screen; onNavigate: (screen: Screen) => void }) {
  return (
    <nav className="bottomNav" aria-label="Primary">
      {NAV.map((item) => (
        <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => onNavigate(item.id)}>
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function NextUp({ state, onStart }: { state: ReturnType<typeof getProgrammeState>; onStart: (type: SessionType) => void }) {
  const phase = PHASES.find((p) => p.id === state.phaseId)!;
  const nextWorkout = getWorkout(state.nextType);
  const progressPct = Math.min(100, Math.round((state.totalCompleted / 24) * 100));

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
        <div>
          <p className="eyebrow">Next session</p>
          <h2>{nextWorkout.title}</h2>
          <p>{nextWorkout.emphasis} - {nextWorkout.duration}</p>
        </div>
        <button className="primary" onClick={() => onStart(nextWorkout.id)}>Start {nextWorkout.id}</button>
      </section>

      <section className="statsGrid">
        <Stat label="Sessions" value={`${state.totalCompleted}/24`} />
        <Stat label="This week" value={`${state.weeklyCounts.A + state.weeklyCounts.B + state.weeklyCounts.C}/3`} />
        <Stat label="Phase" value={phase.name} />
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

function Programme({ phaseId, onSelectExercise }: { phaseId: PhaseId; onSelectExercise: (exerciseId: string) => void }) {
  const phase = PHASES.find((p) => p.id === phaseId)!;

  return (
    <section className="screen">
      <PageTitle title="Programme" subtitle={`${phase.name}: ${phase.intent}`} />
      <div className="phaseRow">
        {PHASES.map((p) => (
          <div key={p.id} className={p.id === phaseId ? "phase active" : "phase"}>
            <strong>{p.name}</strong>
            <span>Weeks {p.weeks}</span>
          </div>
        ))}
      </div>
      {WORKOUTS.map((workout) => (
        <section className="panel" key={workout.id}>
          <div className="sectionHead">
            <div>
              <p className="eyebrow">{workout.id} - {workout.duration}</p>
              <h2>{workout.title}</h2>
            </div>
            <strong>{workout.intensity}</strong>
          </div>
          <ExerciseList prescriptions={workout.prescriptions[phaseId]} onSelectExercise={onSelectExercise} />
        </section>
      ))}
    </section>
  );
}

function Progress() {
  const sessionLogs = useLiveQuery(() => db.sessionLogs.toArray(), []) ?? [];
  const setLogs = useLiveQuery(() => db.setLogs.toArray(), []) ?? [];
  const metricLogs = useLiveQuery(() => db.metricLogs.toArray(), []) ?? [];
  const state = getProgrammeState(sessionLogs);
  const progress = progressForExercises(sessionLogs, setLogs).slice(0, 12);
  const frequency = weeklyFrequency(sessionLogs);
  const swingSpeed = metricLogs.filter((m) => m.type === "swing_speed").sort((a, b) => a.date.localeCompare(b.date));
  const rom = metricLogs.filter((m) => m.type.startsWith("rom_")).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <section className="screen">
      <PageTitle title="Progress" subtitle="Training consistency, band progression, swing speed and mobility signals." />
      <section className="statsGrid">
        <Stat label="Sessions" value={`${state.totalCompleted}/24`} />
        <Stat label="Week" value={`${state.currentWeek}/8`} />
        <Stat label="Latest speed" value={latestMetricValue(swingSpeed) ?? "-"} />
      </section>
      <section className="panel">
        <h2>Band progression</h2>
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
      <section className="panel">
        <h2>Session frequency</h2>
        <BarStrip values={frequency} />
      </section>
      <section className="panel twoCol">
        <div>
          <h2>Swing speed</h2>
          {swingSpeed.length === 0 ? <p className="muted">No speed logged yet.</p> : <Sparkline values={swingSpeed.map((m) => m.value)} />}
        </div>
        <div>
          <h2>ROM tests</h2>
          {rom.length === 0 ? <p className="muted">No ROM tests logged yet.</p> : <MetricHistory metrics={rom.slice(-5)} />}
        </div>
      </section>
    </section>
  );
}

function Metrics() {
  const metricLogs = useLiveQuery(() => db.metricLogs.toArray(), []) ?? [];

  return (
    <section className="screen">
      <PageTitle title="Metrics" subtitle="Quick-add swing speed, ROM self-tests and bodyweight." />
      <RomWizard />
      <SwingSpeedEntry />
      <BodyweightEntry />
      <section className="panel">
        <h2>Recent entries</h2>
        {metricLogs.length === 0 ? <p className="muted">No metrics logged yet.</p> : <MetricHistory metrics={[...metricLogs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8)} />}
      </section>
    </section>
  );
}

function Settings() {
  const sessionLogs = useLiveQuery(() => db.sessionLogs.toArray(), []) ?? [];
  const setLogs = useLiveQuery(() => db.setLogs.toArray(), []) ?? [];
  const metricLogs = useLiveQuery(() => db.metricLogs.toArray(), []) ?? [];
  const exerciseVideos = useLiveQuery(() => db.exerciseVideos.toArray(), []) ?? [];
  const [confirmation, setConfirmation] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function exportData() {
    const blob = new Blob([JSON.stringify({ sessionLogs, setLogs, metricLogs, exerciseVideos }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bandfit-golf-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Backup downloaded.");
  }

  async function importData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (confirmation !== "REPLACE ALL DATA") {
      setNotice("Type REPLACE ALL DATA before importing.");
      return;
    }
    const data = JSON.parse(await file.text()) as {
      sessionLogs?: SessionLog[];
      setLogs?: SetLog[];
      metricLogs?: MetricLog[];
      exerciseVideos?: { exerciseId: string; videoUrl: string | null }[];
    };
    await db.transaction("rw", [db.sessionLogs, db.setLogs, db.metricLogs, db.exerciseVideos], async () => {
      await db.sessionLogs.clear();
      await db.setLogs.clear();
      await db.metricLogs.clear();
      await db.exerciseVideos.clear();
      if (data.sessionLogs?.length) await db.sessionLogs.bulkAdd(data.sessionLogs);
      if (data.setLogs?.length) await db.setLogs.bulkAdd(data.setLogs);
      if (data.metricLogs?.length) await db.metricLogs.bulkAdd(data.metricLogs);
      if (data.exerciseVideos?.length) await db.exerciseVideos.bulkAdd(data.exerciseVideos);
    });
    setConfirmation("");
    setNotice("Import complete.");
  }

  return (
    <section className="screen">
      <PageTitle title="Settings / Data" subtitle="Backups, units, PWA install notes and safety boundary." />
      <section className="panel">
        <h2>Backup</h2>
        <p className="muted">Workout history, metrics and edited exercise video links are stored on this device.</p>
        <div className="buttonRow">
          <button className="secondary" onClick={exportData}>Export backup</button>
          <button className="secondary" onClick={() => inputRef.current?.click()}>Import backup</button>
        </div>
        <input className="hidden" ref={inputRef} type="file" accept="application/json" onChange={importData} />
        <input className="fullInput" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder="REPLACE ALL DATA" />
        {notice && <p className="saved">{notice}</p>}
      </section>
      <section className="panel">
        <h2>Units</h2>
        <p className="muted">Band level: Light to X-heavy. Swing speed: mph. Bodyweight: kg. ROM reach: cm.</p>
      </section>
      <section className="panel">
        <h2>Install on iPad</h2>
        <p className="muted">Open the deployed site in Safari, tap Share, then Add to Home Screen.</p>
      </section>
      <section className="panel">
        <h2>Safety</h2>
        <p>Pain at any point means stop the movement and seek professional assessment. This app does not include rehabilitation logic.</p>
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
    db.sessionLogs.put(log).then(() => {
      if (!cancelled) setCreated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [phaseId, sessionId, type, week]);

  async function cancel() {
    await db.transaction("rw", [db.sessionLogs, db.setLogs], async () => {
      await db.setLogs.where("sessionLogId").equals(sessionId).delete();
      await db.sessionLogs.delete(sessionId);
    });
    onDone();
  }

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
        <PageTitle title="Session complete" subtitle={`${setLogs.length} sets logged for ${workout.title}.`} />
        <section className="panel">
          <p>Progress only when reps are clean and RPE stays at 8 or below.</p>
          <button className="primary" onClick={onDone}>Back to Next Up</button>
        </section>
      </section>
    );
  }

  return (
    <section className="screen sessionScreen">
      <button className="textButton" onClick={cancel}>Cancel session</button>
      <header className="sessionHeader">
        <p className="eyebrow">Week {week} - Workout {type}</p>
        <h1>{workout.title}</h1>
        <p>{workout.emphasis} - {workout.duration}</p>
      </header>
      <ExerciseList prescriptions={prescriptions} sessionId={created ? sessionId : undefined} setLogs={setLogs} />
      <button className="primary finish" onClick={finish} disabled={!created}>Finish session</button>
    </section>
  );
}

function ExerciseDetail({ exerciseId, onBack }: { exerciseId: string; onBack: () => void }) {
  const exercise = getExercise(exerciseId);
  const override = useLiveQuery(() => db.exerciseVideos.get(exerciseId), [exerciseId]);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const activeVideoUrl = override?.videoUrl ?? exercise.videoUrl;

  useEffect(() => {
    setVideoUrlInput(activeVideoUrl ?? "");
  }, [activeVideoUrl]);

  async function saveVideoUrl() {
    await db.exerciseVideos.put({ exerciseId, videoUrl: videoUrlInput.trim() || null });
    setNotice("Video link saved.");
  }

  return (
    <section className="screen">
      <button className="textButton" onClick={onBack}>Back to Programme</button>
      <PageTitle title={exercise.name} subtitle={`${exercise.pattern} - ${exercise.focus}`} />
      <section className="detailGrid">
        <DetailPanel title="Description" text={exercise.description} />
        <DetailPanel title="Cues" text={exercise.cues} />
        <DetailPanel title="Setup" text={`${exercise.equipment}. ${exercise.setup}.`} />
        <DetailPanel title="Substitution" text={exercise.substitution} />
        <DetailPanel title="Safety" text={exercise.safety} />
      </section>
      <section className="panel">
        <h2>Video URL</h2>
        <p className="muted">Optional link-out. A missing video never blocks a workout because the text cues stay available offline.</p>
        <input className="fullInput" value={videoUrlInput} onChange={(e) => setVideoUrlInput(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
        <div className="buttonRow">
          <button className="secondary" onClick={saveVideoUrl}>Save link</button>
          {activeVideoUrl && <a className="linkButton" href={activeVideoUrl} target="_blank" rel="noreferrer">Open link</a>}
        </div>
        {notice && <p className="saved">{notice}</p>}
      </section>
    </section>
  );
}

function ExerciseList({
  prescriptions,
  sessionId,
  setLogs = [],
  onSelectExercise
}: {
  prescriptions: Prescription[];
  sessionId?: string;
  setLogs?: SetLog[];
  onSelectExercise?: (exerciseId: string) => void;
}) {
  const sections = Array.from(new Set(prescriptions.map((p) => p.section)));
  return (
    <>
      {sections.map((section) => (
        <div className="exerciseSection" key={section}>
          <h3>{section}</h3>
          {prescriptions.filter((p) => p.section === section).map((p) => (
            <ExerciseCard
              key={p.id}
              prescription={p}
              sessionId={sessionId}
              setLogs={setLogs.filter((s) => s.prescriptionId === p.id)}
              onSelectExercise={onSelectExercise}
            />
          ))}
        </div>
      ))}
    </>
  );
}

function ExerciseCard({
  prescription,
  sessionId,
  setLogs,
  onSelectExercise
}: {
  prescription: Prescription;
  sessionId?: string;
  setLogs: SetLog[];
  onSelectExercise?: (exerciseId: string) => void;
}) {
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
          <button className="exerciseTitle" onClick={() => onSelectExercise?.(exercise.id)} disabled={!onSelectExercise}>
            {exercise.name}
          </button>
          <span>{prescription.sets} x {prescription.target}{prescription.rpe ? ` - RPE ${prescription.rpe}` : ""}</span>
        </div>
        <small>{exercise.setup}</small>
      </div>
      <p>{exercise.cues}</p>
      {prescription.note && <p className="note">{prescription.note}</p>}
      {sessionId && (
        <>
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
          <RestTimer seconds={prescription.restSec} disabled={setLogs.length === 0} />
        </>
      )}
      {setLogs.length > 0 && <SetPills setLogs={setLogs} />}
    </article>
  );
}

function RestTimer({ seconds, disabled }: { seconds: number; disabled: boolean }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setRemaining(seconds);
    setRunning(false);
  }, [seconds]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      setRunning(false);
      if ("vibrate" in navigator) navigator.vibrate(160);
      return;
    }
    const id = window.setTimeout(() => setRemaining((value) => value - 1), 1000);
    return () => window.clearTimeout(id);
  }, [remaining, running]);

  return (
    <div className="timerRow">
      <span>Rest {formatTime(remaining)}</span>
      <button className="timerButton" disabled={disabled} onClick={() => setRunning((value) => !value)}>
        {running ? "Pause" : "Start"}
      </button>
      <button className="timerButton" disabled={disabled} onClick={() => { setRemaining(seconds); setRunning(false); }}>
        Reset
      </button>
    </div>
  );
}

function RomWizard() {
  const [thoracicL, setThoracicL] = useState("");
  const [thoracicR, setThoracicR] = useState("");
  const [hipL, setHipL] = useState<0 | 1 | 2 | "">("");
  const [hipR, setHipR] = useState<0 | 1 | 2 | "">("");
  const [reach, setReach] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  async function saveThoracic() {
    if (thoracicL) await logMetric("rom_thoracic", Number(thoracicL), "deg", "L");
    if (thoracicR) await logMetric("rom_thoracic", Number(thoracicR), "deg", "R");
    setSaved("Thoracic rotation saved.");
  }

  async function saveHip() {
    if (hipL !== "") await logMetric("rom_hip", Number(hipL), "grade", "L");
    if (hipR !== "") await logMetric("rom_hip", Number(hipR), "grade", "R");
    setSaved("Hip switch saved.");
  }

  async function saveReach() {
    if (reach) await logMetric("rom_reach", Number(reach), "cm");
    setSaved("Toe reach saved.");
  }

  return (
    <section className="panel">
      <h2>ROM self-tests</h2>
      {saved && <p className="saved">{saved}</p>}
      <Field label="Seated wall thoracic rotation">
        <div className="formRow">
          <input placeholder="Left deg" type="number" inputMode="numeric" value={thoracicL} onChange={(e) => setThoracicL(e.target.value)} />
          <input placeholder="Right deg" type="number" inputMode="numeric" value={thoracicR} onChange={(e) => setThoracicR(e.target.value)} />
          <button className="secondary compact" onClick={saveThoracic}>Save</button>
        </div>
      </Field>
      <Field label="90/90 hip switch hold">
        <div className="formRow">
          <GradeSelect label="Left" value={hipL} onChange={setHipL} />
          <GradeSelect label="Right" value={hipR} onChange={setHipR} />
          <button className="secondary compact" onClick={saveHip}>Save</button>
        </div>
      </Field>
      <Field label="Standing toe reach">
        <div className="formRow">
          <input placeholder="cm to floor" type="number" inputMode="decimal" value={reach} onChange={(e) => setReach(e.target.value)} />
          <button className="secondary compact" onClick={saveReach}>Save</button>
        </div>
      </Field>
    </section>
  );
}

function SwingSpeedEntry() {
  const [value, setValue] = useState("");
  const [device, setDevice] = useState("");
  const [saved, setSaved] = useState(false);

  async function save() {
    if (!value) return;
    await logMetric("swing_speed", Number(value), "mph", undefined, device || undefined);
    setValue("");
    setDevice("");
    setSaved(true);
  }

  return (
    <section className="panel">
      <h2>Swing speed quick-add</h2>
      <div className="formRow">
        <input placeholder="mph" type="number" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
        <input placeholder="Device, e.g. R10" value={device} onChange={(e) => setDevice(e.target.value)} />
        <button className="secondary compact" onClick={save}>Log</button>
      </div>
      {saved && <p className="saved">Logged.</p>}
    </section>
  );
}

function BodyweightEntry() {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);

  async function save() {
    if (!value) return;
    await logMetric("bodyweight", Number(value), "kg");
    setValue("");
    setSaved(true);
  }

  return (
    <section className="panel">
      <h2>Bodyweight</h2>
      <div className="formRow">
        <input placeholder="kg" type="number" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
        <button className="secondary compact" onClick={save}>Log</button>
      </div>
      {saved && <p className="saved">Logged.</p>}
    </section>
  );
}

async function logMetric(type: MetricType, value: number, unit: string, side?: Side, device?: string) {
  await db.metricLogs.add({ id: crypto.randomUUID(), date: new Date().toISOString(), type, value, unit, side, device });
}

function GradeSelect({ label, value, onChange }: { label: string; value: 0 | 1 | 2 | ""; onChange: (v: 0 | 1 | 2 | "") => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value) as 0 | 1 | 2)} aria-label={label}>
      <option value="">{label}</option>
      <option value={0}>Not yet</option>
      <option value={1}>With support</option>
      <option value={2}>Achievable</option>
    </select>
  );
}

function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="pageTitle">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  );
}

function DetailPanel({ title, text }: { title: string; text: string }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <p>{text}</p>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
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

function SetPills({ setLogs }: { setLogs: SetLog[] }) {
  return (
    <div className="setPills">
      {setLogs.map((set) => (
        <span key={set.id}>Set {set.setNo}: {set.value ?? "-"}{set.bandLevel ? `, ${set.bandLevel}` : ""}{set.rpe ? `, RPE ${set.rpe}` : ""}</span>
      ))}
    </div>
  );
}

function MetricHistory({ metrics }: { metrics: MetricLog[] }) {
  return (
    <div className="metricHistory">
      {metrics.map((metric) => (
        <div key={metric.id}>
          <strong>{metricLabel(metric)}</strong>
          <span>{metric.value}{metric.unit === "grade" ? "" : ` ${metric.unit}`}{metric.side ? ` ${metric.side}` : ""}{metric.device ? ` - ${metric.device}` : ""}</span>
        </div>
      ))}
    </div>
  );
}

function BarStrip({ values }: { values: number[] }) {
  return (
    <div className="barStrip">
      {values.map((value, index) => (
        <div key={index}>
          <span style={{ height: `${Math.max(8, value * 18)}px` }} />
          <small>{value}</small>
        </div>
      ))}
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return <p className="muted">Not enough data yet.</p>;
  const width = 360;
  const height = 52;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((v, i) => `${((i / (values.length - 1)) * width).toFixed(1)},${(height - ((v - min) / range) * height).toFixed(1)}`).join(" ");
  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Trend line">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function weeklyFrequency(sessionLogs: SessionLog[]): number[] {
  const values = Array.from({ length: 8 }, () => 0);
  for (const log of sessionLogs.filter((s) => s.completed)) {
    const index = Math.min(7, Math.max(0, log.week - 1));
    values[index] += 1;
  }
  return values;
}

function latestMetricValue(metrics: MetricLog[]): string | null {
  if (metrics.length === 0) return null;
  const metric = metrics[metrics.length - 1];
  return `${metric.value}${metric.unit}`;
}

function metricLabel(metric: MetricLog): string {
  const labels: Record<MetricType, string> = {
    swing_speed: "Swing speed",
    rom_thoracic: "Thoracic rotation",
    rom_hip: "90/90 hip switch",
    rom_reach: "Toe reach",
    bodyweight: "Bodyweight"
  };
  return labels[metric.type];
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}
