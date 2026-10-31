import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your name.").max(120),
  phone: z.string().trim().min(7, "Enter a phone number.").max(20),
  email: z.email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const optionalLine = (max: number) => z.string().trim().max(max);

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your name.").max(120),
  phone: z.string().trim().min(7, "Enter a phone number.").max(20),
  area: optionalLine(120),
  bankName: optionalLine(80),
  accountName: optionalLine(120),
  accountNumber: z
    .string()
    .trim()
    .max(20)
    .regex(/^\d*$/, "Account number should be digits only."),
  shopName: optionalLine(120),
  address: optionalLine(200),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
