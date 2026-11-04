"use server";

import type { Role } from "@sakwa/types";
import { createAccount } from "@/features/accounts/accounts";

export async function createUserAction(input: {
  fullName: string;
  email: string;
  phone: string;
  roles: Role[];
  primaryRole: Role;
  password: string;
}) {
  if (input.password.length < 8)
    throw new Error("Use at least 8 characters for the password.");
  await createAccount({
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    password: input.password,
    role: input.primaryRole,
    roles: input.roles,
  });
}
