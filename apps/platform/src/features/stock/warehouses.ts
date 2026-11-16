import { createBrowserSupabase } from "@/lib/supabase/browser";

export async function listWarehouses() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.from("warehouses").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function closeWarehouse(id: string) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase
    .from("warehouses")
    .update({ is_active: false })
    .eq("id", id);
  if (error) throw error;
}

export async function createWarehouse(input: { name: string; location?: string }) {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("warehouses")
    .insert({
      name: input.name,
      location: input.location || null,
    })
    .select("id, name")
    .single();
  if (error) throw error;
  return data;
}

export async function ensureWarehouse(name: string) {
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (trimmed.length < 2) throw new Error("Enter the store name.");
  if (trimmed.length > 80) throw new Error("Use a shorter store name.");
  const key = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const all = (await listWarehouses()) ?? [];
  const found = all.find(
    (store) => store.name.toLowerCase().replace(/[^a-z0-9]+/g, "") === key,
  );
  if (found) {
    if (!found.is_active) {
      const supabase = createBrowserSupabase();
      const { error } = await supabase
        .from("warehouses")
        .update({ is_active: true })
        .eq("id", found.id);
      if (error) throw error;
    }
    return { id: found.id, name: found.name };
  }
  return createWarehouse({ name: trimmed });
}

export async function assignStaff(warehouseId: string, userId: string) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("warehouse_staff").insert({
    warehouse_id: warehouseId,
    user_id: userId,
  });
  if (error) throw error;
}

export async function listWarehouseStaff() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.from("warehouse_staff").select("*");
  if (error) throw error;
  return data;
}

export async function listAssignedWarehouseIds(userId: string) {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("warehouse_staff")
    .select("warehouse_id")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((row) => row.warehouse_id);
}
