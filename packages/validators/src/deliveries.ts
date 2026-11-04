import { z } from "zod";

export const deliverySchema = z.object({
  id: z.uuid(),
  warehouseId: z.uuid("Choose a store."),
  bagCount: z.number().int().positive("Enter the number of bags."),
  kgPerBag: z.number().positive("Enter kg per bag."),
  amountSpentNaira: z.number().positive("Enter the amount spent."),
  deliveredOn: z.string().min(1, "Enter the date."),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const deliveryDecisionSchema = z.object({
  deliveryId: z.uuid(),
  status: z.enum(["confirmed", "rejected"]),
  rejectionReason: z.string().max(500).optional().or(z.literal("")),
});

export const cashAdvanceSchema = z.object({
  id: z.uuid(),
  agentId: z.uuid(),
  amountNaira: z.number().positive("Enter the amount given."),
  advancedOn: z.string().min(1, "Enter the date."),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const payRequestSchema = z.object({
  id: z.uuid(),
  agentId: z.uuid("Choose an agent."),
  warehouseId: z.uuid("Choose a store."),
  amountNaira: z.number().positive("Enter the amount to pay."),
  purpose: z.string().trim().min(3, "Say what the money is for."),
  expectedBagCount: z.number().int().positive("Enter the bags you expect."),
  expectedKg: z.number().positive("Enter the kg you expect."),
  advancedOn: z.string().min(1, "Enter the date."),
});

export type PayRequestInput = z.infer<typeof payRequestSchema>;

export type DeliveryInput = z.infer<typeof deliverySchema>;
export type CashAdvanceInput = z.infer<typeof cashAdvanceSchema>;
