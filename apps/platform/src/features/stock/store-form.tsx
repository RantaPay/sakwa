"use client";

import { Button, ConfirmDialog, Field, Input, Select } from "@sakwa/ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listUsersByRole } from "@/features/users";
import { queryKeys } from "@/lib/query-keys";
import {
  assignStaff,
  closeWarehouse,
  createWarehouse,
  listWarehouseStaff,
  listWarehouses,
} from "./warehouses";

export function StoreForm() {
  const client = useQueryClient();
  const stores = useQuery({ queryKey: queryKeys.warehouses, queryFn: listWarehouses });
  const staff = useQuery({
    queryKey: queryKeys.warehouseStaff,
    queryFn: listWarehouseStaff,
  });
  const people = useQuery({
    queryKey: ["users", "warehouse"],
    queryFn: () => listUsersByRole("warehouse"),
  });

  const openStores = (stores.data ?? []).filter((row) => row.is_active !== false);

  function failed(error: unknown) {
    toast.error(
      error instanceof Error ? error.message : "Something went wrong. Try again.",
    );
  }

  async function onCreate(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    try {
      await createWarehouse({ name, location: String(formData.get("location") ?? "") });
      await client.invalidateQueries({ queryKey: queryKeys.warehouses });
      toast.success(`${name} was added.`);
    } catch (error) {
      failed(error);
    }
  }

  async function onAssign(formData: FormData) {
    try {
      await assignStaff(
        String(formData.get("warehouseId")),
        String(formData.get("userId")),
      );
      await client.invalidateQueries({ queryKey: queryKeys.warehouseStaff });
      toast.success("Staff assigned to the store.");
    } catch (error) {
      failed(error);
    }
  }

  async function onClose(id: string, name: string) {
    try {
      await closeWarehouse(id);
      await client.invalidateQueries({ queryKey: queryKeys.warehouses });
      toast.success(`${name} was deleted.`);
    } catch (error) {
      failed(error);
    }
  }

  return (
    <div className="space-y-8">
      <form
        action={onCreate}
        className="grid gap-4 rounded-lg border border-border p-5 md:grid-cols-3"
      >
        <Field label="Store name" htmlFor="name">
          <Input id="name" name="name" required />
        </Field>
        <Field label="Location" htmlFor="location">
          <Input id="location" name="location" />
        </Field>
        <div className="flex items-end">
          <Button type="submit">Add store</Button>
        </div>
      </form>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {openStores.map((row) => (
          <li key={row.id} className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">{row.name}</p>
              <p className="text-sm text-muted">{row.location || "No location"}</p>
            </div>
            <ConfirmDialog
              title={`Delete ${row.name}`}
              body="The store leaves the lists. Past rice and orders stay on the books."
              confirmLabel="Delete store"
              tone="danger"
              onConfirm={() => void onClose(row.id, row.name)}
            >
              <Button type="button" size="sm" variant="danger">
                Delete
              </Button>
            </ConfirmDialog>
          </li>
        ))}
      </ul>
      <form
        action={onAssign}
        className="grid gap-4 rounded-lg border border-border p-5 md:grid-cols-3"
      >
        <Field label="Store" htmlFor="warehouseId">
          <Select id="warehouseId" name="warehouseId" required>
            <option value="">Choose a store</option>
            {openStores.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Store staff" htmlFor="userId">
          <Select id="userId" name="userId" required>
            <option value="">Choose a person</option>
            {(people.data ?? []).map((person) => (
              <option key={person.id} value={person.id}>
                {person.full_name} ({person.email})
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex items-end">
          <Button type="submit" variant="secondary">
            Assign
          </Button>
        </div>
      </form>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {openStores.map((row) => {
          const assigned = (staff.data ?? []).filter(
            (item) => item.warehouse_id === row.id,
          );
          return (
            <li key={row.id} className="p-4">
              <p className="font-semibold">{row.name}</p>
              <p className="text-sm text-muted">
                {row.location ?? "No location written"}
              </p>
              <p className="mt-1 text-xs text-muted">{assigned.length} staff assigned</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
