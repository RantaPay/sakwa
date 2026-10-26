"use client";

import { Button, Field, Input, Select } from "@sakwa/ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeading } from "@/components/page-heading";
import { listUsersByRole } from "@/features/users";
import {
  assignStaff,
  createWarehouse,
  listWarehouseStaff,
  listWarehouses,
} from "@/features/warehouses";
import { queryKeys } from "@/lib/query-keys";

export default function AdminWarehousesPage() {
  const client = useQueryClient();
  const stores = useQuery({ queryKey: queryKeys.warehouses, queryFn: listWarehouses });
  const staff = useQuery({ queryKey: queryKeys.warehouseStaff, queryFn: listWarehouseStaff });
  const people = useQuery({
    queryKey: ["users", "warehouse"],
    queryFn: () => listUsersByRole("warehouse"),
  });

  async function onCreate(formData: FormData) {
    await createWarehouse({
      name: String(formData.get("name") ?? ""),
      location: String(formData.get("location") ?? ""),
    });
    await client.invalidateQueries({ queryKey: queryKeys.warehouses });
  }

  async function onAssign(formData: FormData) {
    await assignStaff(String(formData.get("warehouseId")), String(formData.get("userId")));
    await client.invalidateQueries({ queryKey: queryKeys.warehouseStaff });
  }

  return (
    <div>
      <PageHeading
        title="Stores"
        body="Each store holds bags. Staff can be assigned to more than one store."
      />
      <form action={onCreate} className="mb-8 grid gap-4 md:grid-cols-3">
        <Field label="Name" htmlFor="name">
          <Input id="name" name="name" required />
        </Field>
        <Field label="Location" htmlFor="location">
          <Input id="location" name="location" />
        </Field>
        <div className="flex items-end">
          <Button type="submit">Add store</Button>
        </div>
      </form>
      <form action={onAssign} className="mb-10 grid gap-4 rounded-lg border border-border p-4 md:grid-cols-3">
        <Field label="Store" htmlFor="warehouseId">
          <Select id="warehouseId" name="warehouseId" required>
            <option value="">Choose a store</option>
            {(stores.data ?? []).map((row) => (
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
                {person.full_name}
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
        {(stores.data ?? []).map((row) => {
          const assigned = (staff.data ?? []).filter((item) => item.warehouse_id === row.id);
          return (
            <li key={row.id} className="p-4">
              <p className="font-semibold">{row.name}</p>
              <p className="text-sm text-muted">{row.location ?? "No location written"}</p>
              <p className="mt-1 text-xs text-muted">{assigned.length} staff assigned</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
