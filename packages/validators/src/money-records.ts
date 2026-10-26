import { z } from "zod";

export const paymentSchema = z.object({
  id: z.uuid(),
  orderId: z.uuid(),
  amountNaira: z.number().positive("Enter the amount paid."),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const transactionSchema = z.object({
  id: z.uuid(),
  direction: z.enum(["incoming", "outgoing"]),
  amountNaira: z.number().positive("Enter the amount."),
  occurredOn: z.string().min(1, "Enter the date."),
  category: z.string().trim().min(2).max(80),
  description: z.string().trim().min(4).max(500),
});

export const investmentSchema = z.object({
  id: z.uuid(),
  investorId: z.uuid(),
  amountNaira: z.number().positive("Enter the capital."),
  investedOn: z.string().min(1, "Enter the date."),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const withdrawalSchema = z.object({
  id: z.uuid(),
  amountNaira: z.number().positive("Enter the profit to take out."),
});

export const withdrawalDecisionSchema = z.object({
  withdrawalId: z.uuid(),
  status: z.enum(["approved", "rejected"]),
  rejectionReason: z.string().max(500).optional().or(z.literal("")),
});
