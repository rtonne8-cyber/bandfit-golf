export type SessionType = "A" | "B" | "C";
export type PhaseId = "foundation" | "build" | "performance";
export type TrackingMode = "reps" | "seconds" | "quality";
export type MetricType = "swing_speed" | "rom_thoracic" | "rom_hip" | "rom_reach" | "bodyweight";
export type Side = "L" | "R";

export interface Exercise {
  id: string;
  name: string;
  pattern: string;
  equipment: string;
  setup: string;
  focus: string;
  cues: string;
  description: string;
  safety: string;
  substitution: string;
  videoUrl: string | null;
}

export interface Prescription {
  id: string;
  exerciseId: string;
  section: "Warm-up" | "Strength" | "HIIT" | "Stability" | "Power" | "Mobility" | "Finisher";
  sets: number;
  target: string;
  targetMax?: number;
  tracking: TrackingMode;
  rpe?: string;
  restSec: number;
  note?: string;
}

export interface WorkoutTemplate {
  id: SessionType;
  title: string;
  emphasis: string;
  duration: string;
  intensity: "Moderate" | "High";
  prescriptions: Record<PhaseId, Prescription[]>;
}

export interface SessionLog {
  id: string;
  templateId: SessionType;
  date: string;
  week: number;
  phaseId: PhaseId;
  durationMin: number | null;
  completed: boolean;
  notes: string;
}

export interface SetLog {
  id: string;
  sessionLogId: string;
  prescriptionId: string;
  exerciseId: string;
  setNo: number;
  value: number | null;
  bandLevel: string | null;
  rpe: number | null;
}

export interface MetricLog {
  id: string;
  date: string;
  type: MetricType;
  value: number;
  unit: string;
  side?: Side;
  device?: string;
}

export interface ExerciseVideo {
  exerciseId: string;
  videoUrl: string | null;
}
