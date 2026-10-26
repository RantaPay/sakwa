"use client";

import { Button, Field, Input } from "@sakwa/ui";
import { profileSchema } from "@sakwa/validators";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthUser } from "@/hooks/use-auth-user";
import { queryKeys } from "@/lib/query-keys";
import { getProfile, updateProfile } from "../services/users";

export function ProfileForm() {
  const { data: user } = useAuthUser();
  const client = useQueryClient();
  const profile = useQuery({
    queryKey: queryKeys.profile(user?.id ?? "none"),
    enabled: Boolean(user?.id),
    queryFn: () => getProfile(user?.id as string),
  });
  const [error, setError] = useState("");

  const save = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.profile(user?.id ?? "") });
      toast.success("Profile saved.");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (!profile.data) return null;

  async function onSubmit(formData: FormData) {
    setError("");
    if (!user) return;
    const parsed = profileSchema.safeParse({
      fullName: String(formData.get("fullName") ?? ""),
      phone: String(formData.get("phone") ?? ""),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }
    await save.mutateAsync({
      id: user.id,
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
    });
  }

  return (
    <form action={onSubmit} className="grid max-w-lg gap-4">
      <Field label="Name" htmlFor="fullName">
        <Input id="fullName" name="fullName" defaultValue={profile.data.full_name} required />
      </Field>
      <Field label="Phone" htmlFor="phone">
        <Input id="phone" name="phone" defaultValue={profile.data.phone ?? ""} required />
      </Field>
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" defaultValue={profile.data.email} disabled />
      </Field>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={save.isPending}>
        {save.isPending ? "Saving" : "Save"}
      </Button>
    </form>
  );
}
