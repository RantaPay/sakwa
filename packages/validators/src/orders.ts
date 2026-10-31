import { z } from "zod";

export const orderSchema = z.object({
  id: z.uuid(),
  bagCount: z.number().int().positive("Enter the number of bags."),
  kgPerBag: z.number().positive("Enter kg per bag."),
  deliveryDetails: z.string().trim().min(8, "Enter where the rice should go."),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const orderPriceSchema = z.object({
  orderId: z.uuid(),
  pricePerKgNaira: z.number().positive("Enter the price per kg."),
  warehouseId: z.uuid().optional(),
});

export const stockReleaseSchema = z.object({
  id: z.uuid(),
  orderId: z.uuid(),
  warehouseId: z.uuid(),
  bagCount: z.number().int().positive(),
  kgPerBag: z.number().positive(),
});

export type OrderInput = z.infer<typeof orderSchema>;
