import { EXERCISES, phaseForWeek, WORKOUTS } from "./data";
import type { Exercise, PhaseId, Prescription, SessionLog, SessionType, SetLog, WorkoutTemplate } from "./types";

export interface ProgrammeState {
  completedSessions: SessionLog[];
  currentWeek: number;
  phaseId: PhaseId;
  nextType: SessionType;
  weeklyCounts: Record<SessionType, number>;
  totalCompleted: number;
}

export interface ExerciseProgress {
  exercise: Exercise;
  latestBand: string | null;
  latestRpe: number | null;
  completedSets: number;
  targetHits: number;
  recommendation: string;
}

const SESSION_ORDER: SessionType[] = ["A", "B", "C"];
const BAND_ORDER = ["Light", "Medium", "Heavy", "X-heavy"];

export function getWorkout(type: SessionType): WorkoutTemplate {
  const workout = WORKOUTS.find((w) => w.id === type);
  if (!workout) throw new Error(`Unknown workout type: ${type}`);
  return workout;
}

export function getExercise(exerciseId: string): Exercise {
  const exercise = EXERCISES.find((e) => e.id === exerciseId);
  if (!exercise) throw new Error(`Unknown exercise: ${exerciseId}`);
  return exercise;
}

export function getProgrammeState(sessionLogs: SessionLog[], now = new Date()): ProgrammeState {
  const completedSessions = [...sessionLogs].filter((s) => s.completed).sort((a, b) => a.date.localeCompare(b.date));
  const totalCompleted = completedSessions.length;
  const currentWeek = Math.min(8, Math.max(1, Math.floor(totalCompleted / 3) + 1));
  const phaseId = phaseForWeek(currentWeek);
  const lastType = completedSessions.length > 0 ? completedSessions[completedSessions.length - 1].templateId : undefined;
  const nextType = lastType ? SESSION_ORDER[(SESSION_ORDER.indexOf(lastType) + 1) % SESSION_ORDER.length] : "A";
  const weekStart = startOfTrainingWeek(now);
  const weeklyLogs = completedSessions.filter((s) => new Date(s.date) >= weekStart);

  return {
    completedSessions,
    currentWeek,
    phaseId,
    nextType,
    weeklyCounts: {
      A: weeklyLogs.filter((s) => s.templateId === "A").length,
      B: weeklyLogs.filter((s) => s.templateId === "B").length,
      C: weeklyLogs.filter((s) => s.templateId === "C").length
    },
    totalCompleted
  };
}

export function prescriptionsFor(type: SessionType, phaseId: PhaseId): Prescription[] {
  return getWorkout(type).prescriptions[phaseId];
}

export function progressForExercises(sessionLogs: SessionLog[], setLogs: SetLog[]): ExerciseProgress[] {
  const completedIds = new Set(sessionLogs.filter((s) => s.completed).map((s) => s.id));
  const completedSetLogs = setLogs.filter((s) => completedIds.has(s.sessionLogId));
  const prescriptionById = new Map(WORKOUTS.flatMap((w) => Object.values(w.prescriptions).flat()).map((p) => [p.id, p]));

  return EXERCISES.map((exercise) => {
    const rows = completedSetLogs.filter((s) => s.exerciseId === exercise.id);
    const latest = rows.length > 0 ? rows[rows.length - 1] : undefined;
    const latestPrescription = latest ? prescriptionById.get(latest.prescriptionId) : undefined;
    const targetMax = latestPrescription?.targetMax ?? 0;
    const targetHits = targetMax === 0 ? 0 : rows.filter((s) => (s.value ?? 0) >= targetMax && (s.rpe ?? 10) <= 8).length;
    return {
      exercise,
      latestBand: latest?.bandLevel ?? null,
      latestRpe: latest?.rpe ?? null,
      completedSets: rows.length,
      targetHits,
      recommendation: recommendationFor(rows, targetMax)
    };
  }).filter((p) => p.completedSets > 0 || p.exercise.equipment.includes("Band"));
}

export function nextBandLevel(current: string | null): string | null {
  if (!current) return "Light";
  const idx = BAND_ORDER.indexOf(current);
  if (idx === -1 || idx === BAND_ORDER.length - 1) return null;
  return BAND_ORDER[idx + 1];
}

function recommendationFor(rows: SetLog[], targetMax: number): string {
  if (rows.length === 0) return "Start light and make the final 2-3 reps challenging.";
  const lastSix = rows.slice(-6);
  const latest = lastSix.length > 0 ? lastSix[lastSix.length - 1] : undefined;
  const misses = lastSix.filter((s) => targetMax > 0 && (s.value ?? 0) < targetMax).length;
  const highRpe = lastSix.some((s) => (s.rpe ?? 0) >= 9);
  const cleanHits = lastSix.length >= 4 && lastSix.every((s) => targetMax > 0 && (s.value ?? 0) >= targetMax && (s.rpe ?? 10) <= 8);
  if (cleanHits) {
    const next = nextBandLevel(latest?.bandLevel ?? null);
    return next ? `Progress next time: try ${next} band or step farther from the anchor.` : "Progress next time: slow the lowering phase or use a harder variation.";
  }
  if (highRpe || misses >= 3) return "Hold the same band and clean up the reps before progressing.";
  return "Build toward the top of the range at RPE 8 or lower.";
}

function startOfTrainingWeek(now: Date): Date {
  const start = new Date(now);
  const day = start.getDay();
  const diff = (day + 6) % 7;
  start.setDate(start.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start;
}
