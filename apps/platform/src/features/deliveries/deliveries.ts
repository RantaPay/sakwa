import { createId, deliveryTotalKg } from "@sakwa/utils";
import { notifyUser } from "@/features/notifications/notify";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { enqueueWrite, isOfflineError } from "@/lib/offline/sync";
import { toDeliveryRow } from "./map-delivery";

export async function listAgentDeliveries(agentId: string) {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("agent_deliveries")
    .select("*")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function listWarehouseDeliveries() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("agent_deliveries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function recordDelivery(input: {
  agentId: string;
  warehouseId: string;
  bagCount: number;
  kgPerBag: number;
  amountSpentNaira: number;
  deliveredOn: string;
  notes?: string;
}) {
  const row = toDeliveryRow({ ...input, id: createId() });
  try {
    const supabase = createBrowserSupabase();
    const { error } = await supabase.from("agent_deliveries").insert(row);
    if (error) throw error;
  } catch (error) {
    if (isOfflineError(error)) {
      await enqueueWrite({
        id: row.id,
        tableName: "agent_deliveries",
        payload: row,
      });
      return;
    }
    throw error;
  }
}

export async function decideDelivery(input: {
  id: string;
  warehouseId: string;
  bagCount: number;
  kgPerBag: number;
  bagsReceived?: number;
  bagsDamaged?: number;
  agentId?: string;
  status: "confirmed" | "rejected";
  userId: string;
  reason?: string;
}) {
  const supabase = createBrowserSupabase();
  const damaged = input.status === "confirmed" ? Math.max(0, input.bagsDamaged ?? 0) : 0;
  const received =
    input.status === "confirmed"
      ? (input.bagsReceived ?? input.bagCount)
      : input.bagCount;
  const good = Math.max(0, received - damaged);
  const patch = {
    status: input.status,
    rejection_reason: input.reason || null,
    confirmed_by: input.userId,
    confirmed_at: new Date().toISOString(),
    bags_received: input.status === "confirmed" ? received : null,
    bags_damaged: input.status === "confirmed" ? damaged : 0,
  };
  const stockRow =
    input.status === "confirmed" && good > 0
      ? {
          id: createId(),
          warehouse_id: input.warehouseId,
          direction: "in" as const,
          bag_count: good,
          total_kg: deliveryTotalKg(good, input.kgPerBag).toString(),
          delivery_id: input.id,
          recorded_by: input.userId,
        }
      : null;

  try {
    const { error } = await supabase
      .from("agent_deliveries")
      .update(patch)
      .eq("id", input.id);
    if (error) throw error;
    if (stockRow) {
      const { error: stockError } = await supabase
        .from("stock_movements")
        .insert(stockRow);
      if (stockError) throw stockError;
    }
    if (input.status === "confirmed" && damaged > 0 && input.agentId) {
      try {
        await notifyUser({
          userId: input.agentId,
          title: "Damaged bags",
          body: `${damaged} bags were rejected. They are now owing to the store.`,
          kind: "delivery_damage",
          entityTable: "agent_deliveries",
          entityId: input.id,
        });
      } catch {
        /* The owing list still shows the bags. */
      }
    }
  } catch (error) {
    if (isOfflineError(error)) {
      await enqueueWrite({
        id: input.id,
        tableName: "agent_deliveries",
        payload: { id: input.id, ...patch },
      });
      if (stockRow) {
        await enqueueWrite({
          id: stockRow.id,
          tableName: "stock_movements",
          payload: stockRow,
        });
      }
      return;
    }
    throw error;
  }
}
