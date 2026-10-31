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
  payoutBankName: z.string().trim().min(2, "Enter the bank.").max(80),
  payoutAccountName: z.string().trim().min(2, "Enter the account name.").max(80),
  payoutAccountNumber: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Enter the 10-digit account number."),
});

export const withdrawalDecisionSchema = z.object({
  withdrawalId: z.uuid(),
  status: z.enum(["accepted", "rejected"]),
  rejectionReason: z.string().max(500).optional().or(z.literal("")),
});

export const receiptUploadSchema = z.object({
  filename: z.string().trim().min(1, "Choose a receipt.").max(200),
  url: z.string().trim().min(8, "Choose a receipt."),
});

export const investmentRequestSchema = z.object({
  amountNaira: z.number().positive("Enter the capital you want to put in."),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const weeklyInterestSchema = z.object({
  percent: z
    .number()
    .min(0, "Enter a percent from 0 to 100.")
    .max(100, "Enter a percent from 0 to 100."),
});

export const marketPriceSchema = z.object({
  buyingNaira: z.number().positive("Enter the buying price per kg."),
  sellingNaira: z.number().positive("Enter the selling price per kg."),
  effectiveOn: z.string().min(1, "Enter the date."),
  notes: z.string().max(1000).optional().or(z.literal("")),
});
