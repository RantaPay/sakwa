import { createBrowserSupabase } from "@/lib/supabase/browser";

export async function listWarehouses() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.from("warehouses").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function createWarehouse(input: { name: string; location?: string }) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("warehouses").insert({
    name: input.name,
    location: input.location || null,
  });
  if (error) throw error;
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
