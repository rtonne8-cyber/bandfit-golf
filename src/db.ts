import Dexie, { type Table } from "dexie";
import type { SessionLog, SetLog } from "./types";

export class BandFitDB extends Dexie {
  sessionLogs!: Table<SessionLog, string>;
  setLogs!: Table<SetLog, string>;

  constructor() {
    super("bandfit-golf-v1");
    this.version(1).stores({
      sessionLogs: "id, templateId, date, completed, week",
      setLogs: "id, sessionLogId, exerciseId, prescriptionId"
    });
  }
}

export const db = new BandFitDB();
