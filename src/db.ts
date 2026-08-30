import Dexie, { type Table } from "dexie";
import type { ExerciseVideo, MetricLog, SessionLog, SetLog } from "./types";

export class BandFitDB extends Dexie {
  sessionLogs!: Table<SessionLog, string>;
  setLogs!: Table<SetLog, string>;
  metricLogs!: Table<MetricLog, string>;
  exerciseVideos!: Table<ExerciseVideo, string>;

  constructor() {
    super("bandfit-golf-v1");
    this.version(1).stores({
      sessionLogs: "id, templateId, date, completed, week",
      setLogs: "id, sessionLogId, exerciseId, prescriptionId"
    });
    this.version(2).stores({
      sessionLogs: "id, templateId, date, completed, week",
      setLogs: "id, sessionLogId, exerciseId, prescriptionId",
      metricLogs: "id, date, type",
      exerciseVideos: "exerciseId"
    });
  }
}

export const db = new BandFitDB();
