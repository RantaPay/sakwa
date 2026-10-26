"use client";

import { createBrowserSupabase } from "@/lib/supabase/browser";
import { sakwaDb, type OutboxRow } from "./db";

export async function enqueueWrite(row: Omit<OutboxRow, "status" | "error" | "createdAt">) {
  await sakwaDb.outbox.put({
    ...row,
    status: "pending",
    error: null,
    createdAt: new Date().toISOString(),
  });
}

export async function flushOutbox() {
  const pending = await sakwaDb.outbox
    .where("status")
    .anyOf(["pending", "failed"])
    .toArray();
  const supabase = createBrowserSupabase();

  for (const row of pending) {
    await sakwaDb.outbox.update(row.id, { status: "syncing", error: null });
    const { error } = await supabase.from(row.tableName).upsert(row.payload as never);
    if (error) {
      await sakwaDb.outbox.update(row.id, { status: "failed", error: error.message });
    } else {
      await sakwaDb.outbox.delete(row.id);
    }
  }
}

export async function pendingCount() {
  return sakwaDb.outbox.where("status").anyOf(["pending", "failed", "syncing"]).count();
}

export function isOfflineError(error: unknown) {
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;
  return error instanceof TypeError;
}
