"use client";

import { ROLES, ROLE_LABEL, type Role } from "@sakwa/types";
import { Button, Field, Input, PasswordInput } from "@sakwa/ui";
import { useEffect, useState } from "react";
import { PageHeading } from "@/components/page-heading";
import { createUserAction, listUsers, setUserActive } from "@/features/users";

type Person = Awaited<ReturnType<typeof listUsers>>[number];

export default function AdminUsersPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [error, setError] = useState("");

  async function refresh() {
    setPeople(await listUsers());
  }

  useEffect(() => {
    void refresh().catch(() => setError("Could not load people."));
  }, []);

  async function onSubmit(formData: FormData) {
    const roles = ROLES.filter((role) => formData.getAll("roles").includes(role));
    const primaryRole = String(formData.get("primaryRole") ?? "") as Role;
    try {
      await createUserAction({
        fullName: String(formData.get("fullName") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        password: String(formData.get("password") ?? ""),
        roles,
        primaryRole,
      });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the person.");
    }
  }

  return (
    <div>
      <PageHeading title="People" body="Staff and investors are created here. Customers sign up themselves." />
      <form action={onSubmit} className="mb-10 grid gap-4 rounded-lg border border-border p-4 md:grid-cols-2">
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
          <select id="primaryRole" name="primaryRole" className="min-h-11 rounded-md border border-border px-3">
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
        {people.map((person) => (
          <li key={person.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">{person.full_name}</p>
              <p className="text-sm text-muted">{person.email}</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant={person.is_active ? "secondary" : "primary"}
              onClick={() => void setUserActive(person.id, !person.is_active).then(refresh)}
            >
              {person.is_active ? "Deactivate" : "Activate"}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
