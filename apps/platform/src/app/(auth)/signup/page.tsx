"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { Field, Input, PasswordInput } from "@sakwa/ui";
import { signupSchema } from "@sakwa/validators";
import { useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth-shell";
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
    <AuthShell
      image="/images/grains.jpg"
      imageAlt="Milled rice grains in an open palm"
      eyebrow="For buyers"
      title="Create an account to order rice."
      body="Staff and investors are added from inside the house. This page is for customers only."
      footer={
        <p>
          Already have an account?{" "}
          <a className="font-semibold text-primary" href="/login">
            Sign in
          </a>
          .
        </p>
      }
    >
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">New customer</p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Create an account</h2>
      <p className="mt-2 text-base text-muted">For buying rice only.</p>
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
        <button
          type="submit"
          disabled={pending}
          className="group mt-2 inline-flex min-h-14 items-center justify-between gap-3 rounded-full bg-primary pl-6 pr-1.5 text-base font-semibold text-primary-foreground transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50"
        >
          <span>{pending ? "Creating" : "Create account"}</span>
          <span className="flex size-11 items-center justify-center rounded-full bg-black/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
            <ArrowRight size={20} weight="bold" />
          </span>
        </button>
      </form>
    </AuthShell>
  );
}
