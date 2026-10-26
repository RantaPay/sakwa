import { PageHeading } from "@/components/page-heading";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function DirectorStoresPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("warehouse_stock").select("*");
  const { data: stores } = await supabase.from("warehouses").select("id, name");
  const names = new Map((stores ?? []).map((row) => [row.id, row.name]));

  return (
    <div>
      <PageHeading title="Stores" body="Confirmed bags in, minus bags released." />
      <ul className="divide-y divide-border rounded-lg border border-border">
        {(data ?? []).map((row) => (
          <li key={row.warehouse_id} className="p-4">
            <p className="text-sm text-muted">{names.get(row.warehouse_id) ?? "Store"}</p>
            <p className="font-mono text-2xl">{row.bags_on_hand} bags</p>
            <p className="text-sm text-muted">{row.kg_on_hand} kg on hand</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
