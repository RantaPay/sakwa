"use client";

import { Button, Field, Input, PasswordInput } from "@sakwa/ui";
import { signupSchema } from "@sakwa/validators";
import { useState, type FormEvent } from "react";
import { isDemoMode } from "@/lib/demo/accounts";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export default function SignupPage() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const demo = isDemoMode();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (demo) {
      setError("Creating an account is off right now. Sign in instead.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const parsed = signupSchema.safeParse({
      fullName: String(form.get("fullName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your details.");
      return;
    }
    setPending(true);
    const supabase = createBrowserSupabase();
    const { data, error: authError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    if (authError || !data.user) {
      setPending(false);
      setError(authError?.message ?? "Could not create the account.");
      return;
    }
    await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      email: parsed.data.email,
      primary_role: "customer",
    });
    await supabase.from("user_roles").insert({
      user_id: data.user.id,
      role: "customer",
    });
    setPending(false);
    window.location.href = "/customer";
  }

  return (
    <main className="flex flex-1 flex-col justify-center py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Create a customer account</h1>
      <p className="mt-2 text-sm text-muted">
        For buying rice only. Staff and investors are added by admin.
      </p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4" noValidate>
        <Field label="Name" htmlFor="fullName">
          <Input id="fullName" name="fullName" autoComplete="name" required />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input id="phone" name="phone" type="tel" autoComplete="tel" required />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Password" htmlFor="password">
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            required
          />
        </Field>
        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Creating" : "Create account"}
        </Button>
      </form>
    </main>
  );
}
