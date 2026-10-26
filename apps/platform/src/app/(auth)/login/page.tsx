"use client";

import { Button, Field, Input, PasswordInput } from "@sakwa/ui";
import { loginSchema } from "@sakwa/validators";
import { useState, type FormEvent } from "react";
import { isDemoMode } from "@/lib/demo/accounts";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const demo = isDemoMode();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
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
    <main className="flex flex-1 flex-col justify-center py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-muted">
        Use the email given to you by Sakwa Agro Enterprise.
      </p>
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
        <Button type="submit" disabled={pending}>
          {pending ? "Signing in" : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted">
        Customers can{" "}
        <a className="font-semibold text-primary" href="/signup">
          create an account
        </a>
        .
      </p>
    </main>
  );
}
