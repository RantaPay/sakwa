"use client";

import { ROLES, ROLE_LABEL, type Role } from "@sakwa/types";
import { Button, Field, Input, PasswordInput } from "@sakwa/ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { queryKeys } from "@/lib/query-keys";
import { createUserAction } from "./create-user";
import { createPersonLocal, listUsers, setUserActive } from "./users";

export function PersonForm() {
  const client = useQueryClient();
  const people = useQuery({ queryKey: queryKeys.users, queryFn: listUsers });
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setError("");
    const roles = ROLES.filter((role) => formData.getAll("roles").includes(role));
    const primaryRole = String(formData.get("primaryRole") ?? "") as Role;
    try {
      const payload = {
        fullName: String(formData.get("fullName") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        password: String(formData.get("password") ?? ""),
        roles: roles.length > 0 ? roles : [primaryRole],
        primaryRole,
      };
      if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
        await createPersonLocal(payload);
      } else {
        await createUserAction(payload);
      }
      await client.invalidateQueries({ queryKey: queryKeys.users });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the person.");
    }
  }

  return (
    <div className="space-y-8">
      <form action={onSubmit} className="grid gap-4 rounded-lg border border-border p-5 md:grid-cols-2">
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
          <PasswordInput id="password" name="password" autoComplete="new-password" required />
        </Field>
        <Field label="Primary role" htmlFor="primaryRole">
          <select
            id="primaryRole"
            name="primaryRole"
            className="min-h-11 rounded-md border border-border px-3"
          >
            {ROLES.filter((role) => role !== "customer").map((role) => (
              <option key={role} value={role}>
                {ROLE_LABEL[role]}
              </option>
            ))}
          </select>
        </Field>
        <fieldset className="md:col-span-2">
          <legend className="mb-2 text-sm font-medium">Roles</legend>
          <div className="flex flex-wrap gap-3">
            {ROLES.filter((role) => role !== "customer").map((role) => (
              <label key={role} className="flex min-h-11 items-center gap-2 text-sm">
                <input type="checkbox" name="roles" value={role} />
                {ROLE_LABEL[role]}
              </label>
            ))}
          </div>
        </fieldset>
        {error ? <p className="text-sm text-danger md:col-span-2">{error}</p> : null}
        <Button type="submit">Create person</Button>
      </form>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {(people.data ?? []).map((person) => (
          <li key={person.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
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
