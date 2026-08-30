import { describe, expect, it } from "vitest";
import { EXERCISES, WORKOUTS } from "../src/data";
import { getProgrammeState, nextBandLevel, progressForExercises } from "../src/programme";
import type { SessionLog, SetLog } from "../src/types";

function session(id: string, templateId: "A" | "B" | "C", date: string): SessionLog {
  return { id, templateId, date, week: 1, phaseId: "foundation", durationMin: 40, completed: true, notes: "" };
}

describe("programme queue", () => {
  it("starts at workout A", () => {
    expect(getProgrammeState([], new Date("2026-08-30T08:00:00Z")).nextType).toBe("A");
  });

  it("cycles A to B to C", () => {
    expect(getProgrammeState([session("s1", "A", "2026-08-24T08:00:00Z")]).nextType).toBe("B");
    expect(getProgrammeState([session("s1", "A", "2026-08-24T08:00:00Z"), session("s2", "B", "2026-08-26T08:00:00Z")]).nextType).toBe("C");
  });

  it("moves into build after six completed sessions", () => {
    const logs = Array.from({ length: 6 }, (_, i) => session(`s${i}`, ["A", "B", "C"][i % 3] as "A" | "B" | "C", `2026-08-${20 + i}T08:00:00Z`));
    const state = getProgrammeState(logs);
    expect(state.currentWeek).toBe(3);
    expect(state.phaseId).toBe("build");
  });
});

describe("band progression", () => {
  it("recommends the next band after repeated clean top-range hits", () => {
    const sessionLogs = [session("s1", "A", "2026-08-24T08:00:00Z")];
    const setLogs: SetLog[] = Array.from({ length: 4 }, (_, i) => ({
      id: `set-${i}`,
      sessionLogId: "s1",
      prescriptionId: "a-band-row",
      exerciseId: "band-row",
      setNo: i + 1,
      value: 15,
      bandLevel: "Medium",
      rpe: 8
    }));
    const row = progressForExercises(sessionLogs, setLogs).find((p) => p.exercise.id === "band-row");
    expect(row?.recommendation).toContain("Heavy");
  });

  it("knows the ordered band levels", () => {
    expect(nextBandLevel("Light")).toBe("Medium");
    expect(nextBandLevel("X-heavy")).toBeNull();
  });
});

describe("programme content", () => {
  it("provides all five app-depth content fields for every exercise", () => {
    for (const exercise of EXERCISES) {
      expect(exercise.description.length).toBeGreaterThan(20);
      expect(exercise.cues.length).toBeGreaterThan(10);
      expect(exercise.setup.length).toBeGreaterThan(3);
      expect(exercise.safety.length).toBeGreaterThan(10);
      expect(exercise.substitution.length).toBeGreaterThan(10);
      expect(exercise.videoUrl).toContain("youtube.com/results");
    }
  });

  it("has all three phases for all three weekly workouts", () => {
    expect(WORKOUTS.map((w) => w.id)).toEqual(["A", "B", "C"]);
    for (const workout of WORKOUTS) {
      expect(workout.prescriptions.foundation.length).toBeGreaterThan(0);
      expect(workout.prescriptions.build.length).toBeGreaterThan(0);
      expect(workout.prescriptions.performance.length).toBeGreaterThan(0);
    }
  });
});
