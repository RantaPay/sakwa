"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { Field, Input, PasswordInput } from "@sakwa/ui";
import { loginSchema } from "@sakwa/validators";
import { useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth-shell";
import { isDemoMode, writeDemoSession, type DemoAccount } from "@/lib/demo/accounts";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const demo = isDemoMode();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const rawEmail = String(form.get("email") ?? "").trim();
    const rawPassword = String(form.get("password") ?? "");
    const email = demo && rawEmail && !rawEmail.includes("@") ? `${rawEmail}@gmail.com` : rawEmail;
    const parsed = loginSchema.safeParse({
      email,
      password: rawPassword,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your details.");
      return;
    }
    setPending(true);
    if (demo) {
      try {
        const response = await fetch("/api/demo/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        });
        setPending(false);
        if (!response.ok) {
          setError("Email or password is not right.");
          return;
        }
        const payload = (await response.json().catch(() => null)) as { account?: DemoAccount } | null;
        if (payload?.account) writeDemoSession(payload.account);
        window.location.href = "/";
      } catch {
        setPending(false);
        setError("Could not sign in. Try again in a moment.");
      }
      return;
    }
    const supabase = createBrowserSupabase();
    const { error: authError } = await supabase.auth.signInWithPassword(parsed.data);
    setPending(false);
    if (authError) {
      const unreachable =
        /fetch|network|failed to fetch|connection/i.test(authError.message) ||
        authError.status === 0;
      setError(
        unreachable
          ? "Cannot reach the records server right now. Try again in a moment."
          : "Email or password is not right.",
      );
      return;
    }
    window.location.href = "/";
  }

  return (
    <AuthShell
      image="/images/warehouse.jpg"
      imageAlt="Sacks of rice stacked in a store"
      eyebrow="How Sakwa works"
      title="Sign in to follow every kg."
      body="Rice is bought by an agent, kept in the store, then sold to a buyer. You can see the kg and the money at each step."
      footer={
        <p>
          Customers can{" "}
          <a className="font-semibold text-primary" href="/signup">
            create an account
          </a>
          .
        </p>
      }
    >
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">Welcome back</p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Sign in</h2>
      <p className="mt-2 text-base text-muted">Use the email given to you by Sakwa Agro Enterprise.</p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4" noValidate>
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Password" htmlFor="password">
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
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
          <span>{pending ? "Signing in" : "Sign in"}</span>
          <span className="flex size-11 items-center justify-center rounded-full bg-black/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
            <ArrowRight size={20} weight="bold" />
          </span>
        </button>
      </form>
    </AuthShell>
  );
}
