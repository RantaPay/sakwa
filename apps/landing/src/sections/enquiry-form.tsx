"use client";

import { Button, Field, Input, Textarea } from "@sakwa/ui";
import { enquirySchema } from "@sakwa/validators";
import { useState, type FormEvent } from "react";
import { submitEnquiry } from "@/lib/enquiry";

type State = "idle" | "submitting" | "success" | "error";

export function EnquiryForm() {
  const [state, setState] = useState<State>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    const form = new FormData(event.currentTarget);
    const raw = {
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      intendedAmountNaira: String(form.get("intendedAmountNaira") ?? ""),
      message: String(form.get("message") ?? ""),
      website: String(form.get("website") ?? ""),
    };
    const parsed = enquirySchema.safeParse(raw);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "message");
        next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setState("submitting");
    try {
      await submitEnquiry(parsed.data);
      setState("success");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Try again.");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-[calc(2rem-0.375rem)] bg-primary-soft px-6 py-12">
        <h3 className="text-2xl font-semibold tracking-tight">Message received.</h3>
        <p className="mt-3 max-w-[42ch] text-muted">
          Thank you. A director will contact you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 px-6 py-8 md:px-8" noValidate>
      <Field label="Name" htmlFor="name" error={errors.name}>
        <Input id="name" name="name" autoComplete="name" required />
      </Field>
      <Field label="Phone" htmlFor="phone" error={errors.phone}>
        <Input id="phone" name="phone" type="tel" autoComplete="tel" required />
      </Field>
      <Field label="Email" htmlFor="email" error={errors.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field
        label="Intended amount in naira (optional)"
        htmlFor="intendedAmountNaira"
        error={errors.intendedAmountNaira}
      >
        <Input id="intendedAmountNaira" name="intendedAmountNaira" inputMode="numeric" />
      </Field>
      <Field label="Message" htmlFor="message" error={errors.message}>
        <Textarea id="message" name="message" required />
      </Field>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {state === "error" ? (
        <p className="text-sm text-danger" role="alert">
          {message}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={state === "submitting"}>
        {state === "submitting" ? "Sending" : "Send enquiry"}
      </Button>
    </form>
  );
}
