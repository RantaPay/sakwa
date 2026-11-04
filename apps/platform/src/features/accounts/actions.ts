"use server";

import { isRole, type Role } from "@sakwa/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAccount } from "./accounts";

function clean(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const roleValue = String(formData.get("role") ?? "admin");
  if (fullName.length < 2) throw new Error("Enter the name.");
  if (!email.includes("@")) throw new Error("Enter a real email.");
  if (phone.length < 7) throw new Error("Enter the phone number.");
  if (password.length < 8) throw new Error("Use at least 8 characters for the password.");
  if (!isRole(roleValue)) throw new Error("Choose a role.");
  return { fullName, email, phone, password, role: roleValue as Role };
}

export async function createAdminAccount(formData: FormData) {
  const input = clean(formData);
  await createAccount({ ...input, role: "admin" });
  revalidatePath("/desk");
  redirect(`/login?email=${encodeURIComponent(input.email)}`);
}
