"use client";

import { ROLES, ROLE_LABEL, type Role } from "@sakwa/types";
import { Button, Field, Input, PasswordInput } from "@sakwa/ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { createUserAction } from "./create-user";
import { createPersonLocal, listUsers, setUserActive } from "./users";

export function PersonForm() {
  const client = useQueryClient();
  const people = useQuery({ queryKey: queryKeys.users, queryFn: listUsers });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(formData: FormData) {
    setError("");
    const roles = ROLES.filter((role) => formData.getAll("roles").includes(role));
    const primaryRole = String(formData.get("primaryRole") ?? "") as Role;
    const payload = {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      password: String(formData.get("password") ?? ""),
      roles: roles.length > 0 ? roles : [primaryRole],
      primaryRole,
    };
    setPending(true);
    try {
      if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
        await createPersonLocal(payload);
      } else {
        const result = await createUserAction(payload);
        if (!result.ok) {
          setError(result.error);
          toast.error(result.error);
          return;
        }
      }
      formRef.current?.reset();
      toast.success(`${payload.fullName.trim()} was created`, {
        description: `They can now sign in with ${payload.email.trim().toLowerCase()} and the temporary password.`,
      });
      await client.invalidateQueries({ queryKey: queryKeys.users });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create the person.";
      setError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-8">
      <form
        ref={formRef}
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit(new FormData(event.currentTarget));
        }}
        className="grid gap-4 rounded-lg border border-border p-5 md:grid-cols-2"
      >
        <Field label="Name" htmlFor="fullName">
          <Input id="fullName" name="fullName" required />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" required />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input id="phone" name="phone" required />
        </Field>
        <Field label="Temporary password" htmlFor="password">
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </Field>
        <Field label="Primary role" htmlFor="primaryRole">
          <select
            id="primaryRole"
            name="primaryRole"
            className="min-h-11 rounded-md border border-border px-3"
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABEL[role]}
              </option>
            ))}
          </select>
        </Field>
        <fieldset className="md:col-span-2">
          <legend className="mb-2 text-sm font-medium">Roles</legend>
          <div className="flex flex-wrap gap-3">
            {ROLES.map((role) => (
              <label key={role} className="flex min-h-11 items-center gap-2 text-sm">
                <input type="checkbox" name="roles" value={role} />
                {ROLE_LABEL[role]}
              </label>
            ))}
          </div>
        </fieldset>
        {error ? <p className="text-sm text-danger md:col-span-2">{error}</p> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create person"}
        </Button>
      </form>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {(people.data ?? []).map((person) => (
          <li
            key={person.id}
            className="flex flex-wrap items-center justify-between gap-3 p-4"
          >
            <div>
              <p className="font-semibold">{person.full_name}</p>
              <p className="text-sm text-muted">{person.email}</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant={person.is_active ? "secondary" : "primary"}
              onClick={() =>
                void setUserActive(person.id, !person.is_active).then(() =>
                  client.invalidateQueries({ queryKey: queryKeys.users }),
                )
              }
            >
              {person.is_active ? "Deactivate" : "Activate"}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
