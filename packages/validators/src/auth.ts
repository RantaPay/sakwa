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

export const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(20),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
