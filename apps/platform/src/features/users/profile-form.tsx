"use client";

import { isRole, ROLE_LABEL, type Role } from "@sakwa/types";
import { Button, Field, Input } from "@sakwa/ui";
import { profileSchema } from "@sakwa/validators";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listAssignedWarehouseIds, listWarehouses } from "@/features/stock";
import { useAuthUser } from "@/lib/use-auth-user";
import { queryKeys } from "@/lib/query-keys";
import { getProfile, updateProfile } from "./users";

const MAX_AVATAR = 1_200_000;

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function ProfileForm() {
  const { data: user } = useAuthUser();
  const client = useQueryClient();
  const profile = useQuery({
    queryKey: queryKeys.profile(user?.id ?? "none"),
    enabled: Boolean(user?.id),
    queryFn: () => getProfile(user?.id as string),
  });
  const [error, setError] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.profile(user?.id ?? "") });
      void client.invalidateQueries({ queryKey: queryKeys.users });
      toast.success("Profile saved.");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (!profile.data) {
    if (profile.isError) return <p className="text-base text-danger">Could not read your profile.</p>;
    return <p className="text-base text-muted">Reading your profile.</p>;
  }
  const role: Role = isRole(profile.data.primary_role) ? profile.data.primary_role : "customer";
  const photo = avatar ?? profile.data.avatar_url;

  function onAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    setError("");
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Use a photo.");
      return;
    }
    if (file.size > MAX_AVATAR) {
      setError("Use a photo under 1.2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result ?? ""));
    reader.onerror = () => setError("Could not read that photo.");
    reader.readAsDataURL(file);
  }

  async function onSubmit(formData: FormData) {
    setError("");
    if (!user) return;
    const parsed = profileSchema.safeParse({
      fullName: text(formData, "fullName"),
      phone: text(formData, "phone"),
      area: text(formData, "area"),
      bankName: text(formData, "bankName"),
      accountName: text(formData, "accountName"),
      accountNumber: text(formData, "accountNumber"),
      shopName: text(formData, "shopName"),
      address: text(formData, "address"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }
    if ((role === "agent" || role === "investor") && !parsed.data.accountNumber) {
      setError("Enter the account number.");
      return;
    }
    await save.mutateAsync({
      id: user.id,
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      area: parsed.data.area,
      bankName: parsed.data.bankName,
      accountName: parsed.data.accountName,
      accountNumber: parsed.data.accountNumber,
      shopName: parsed.data.shopName,
      address: parsed.data.address,
      avatarUrl: avatar ?? profile.data?.avatar_url ?? null,
    });
  }

  return (
    <form action={onSubmit} className="grid max-w-lg gap-4">
      <div className="flex items-center gap-4">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="size-16 rounded-full object-cover" />
        ) : (
          <span className="flex size-16 items-center justify-center rounded-full bg-primary-soft text-lg font-semibold text-primary">
            {profile.data.full_name.slice(0, 1)}
          </span>
        )}
        <label className="text-base font-medium">
          Profile photo
          <input
            className="mt-2 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
            type="file"
            accept="image/*"
            onChange={onAvatar}
          />
        </label>
      </div>
      <p className="text-sm text-muted">Role: {ROLE_LABEL[role]}</p>
      <Field label="Name" htmlFor="fullName">
        <Input id="fullName" name="fullName" defaultValue={profile.data.full_name} required />
      </Field>
      <Field label="Phone" htmlFor="phone">
        <Input id="phone" name="phone" defaultValue={profile.data.phone ?? ""} required />
      </Field>
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" defaultValue={profile.data.email} disabled />
      </Field>
      {role === "agent" ? (
        <Field label="Buying area" htmlFor="area">
          <Input id="area" name="area" defaultValue={profile.data.area ?? ""} required />
        </Field>
      ) : null}
      {role === "customer" ? (
        <>
          <Field label="Shop name" htmlFor="shopName">
            <Input id="shopName" name="shopName" defaultValue={profile.data.shop_name ?? ""} required />
          </Field>
          <Field label="Address" htmlFor="address">
            <Input id="address" name="address" defaultValue={profile.data.address ?? ""} required />
          </Field>
        </>
      ) : null}
      {role === "agent" || role === "investor" ? (
        <>
          <Field label="Bank" htmlFor="bankName">
            <Input id="bankName" name="bankName" defaultValue={profile.data.bank_name ?? ""} required />
          </Field>
          <Field label="Account name" htmlFor="accountName">
            <Input
              id="accountName"
              name="accountName"
              defaultValue={profile.data.account_name ?? ""}
              required
            />
          </Field>
          <Field label="Account number" htmlFor="accountNumber">
            <Input
              id="accountNumber"
              name="accountNumber"
              inputMode="numeric"
              defaultValue={profile.data.account_number ?? ""}
              required
            />
          </Field>
        </>
      ) : null}
      {role === "warehouse" ? <StoreLine userId={profile.data.id} /> : null}
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

function StoreLine({ userId }: { userId: string }) {
  const stores = useQuery({ queryKey: queryKeys.warehouses, queryFn: listWarehouses });
  const assigned = useQuery({
    queryKey: queryKeys.warehouseStaff,
    queryFn: () => listAssignedWarehouseIds(userId),
  });
  const names = new Map((stores.data ?? []).map((row) => [row.id, row.name]));
  const label = (assigned.data ?? []).map((id) => names.get(id) ?? "Store").join(", ");
  return (
    <p className="text-base text-muted">
      Store: {assigned.data ? label || "No store assigned yet" : "Reading your store"}
    </p>
  );
}
