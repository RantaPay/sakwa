import { nairaToKobo } from "@sakwa/utils";

export function toDeliveryRow(input: {
  id: string;
  agentId: string;
  warehouseId: string;
  bagCount: number;
  kgPerBag: number;
  amountSpentNaira: number;
  deliveredOn: string;
  notes?: string;
}) {
  return {
    id: input.id,
    agent_id: input.agentId,
    warehouse_id: input.warehouseId,
    bag_count: input.bagCount,
    kg_per_bag: input.kgPerBag.toString(),
    amount_spent_kobo: Number(nairaToKobo(input.amountSpentNaira)),
    delivered_on: input.deliveredOn,
    notes: input.notes || null,
    status: "pending",
  };
}
