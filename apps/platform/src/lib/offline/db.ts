import Dexie, { type Table } from "dexie";

export type OutboxRow = {
  id: string;
  tableName: string;
  payload: unknown;
  status: "pending" | "syncing" | "failed";
  error: string | null;
  createdAt: string;
};

class SakwaDb extends Dexie {
  outbox!: Table<OutboxRow, string>;

  constructor() {
    super("sakwa-outbox");
    this.version(1).stores({
      outbox: "id, tableName, status, createdAt",
    });
  }
}

export const sakwaDb = new SakwaDb();
