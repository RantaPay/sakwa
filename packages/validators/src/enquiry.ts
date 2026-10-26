import { z } from "zod";

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a phone number.")
    .max(20)
    .regex(/^[0-9+\s-]+$/, "Use digits only."),
  email: z.email("Enter a valid email."),
  intendedAmountNaira: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Write a short message.").max(2000),
  website: z.string().max(0).optional().or(z.literal("")),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
