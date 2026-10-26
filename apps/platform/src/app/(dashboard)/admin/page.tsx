import { PageHeading } from "@/components/page-heading";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function AdminHomePage() {
  const supabase = await createServerSupabase();
  const { count: people } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });
  const { count: stores } = await supabase
    .from("warehouses")
    .select("id", { count: "exact", head: true });

  return (
    <div>
      <PageHeading
        title="Admin"
        body="Create people, assign roles, and open stores. You do not handle rice or money here."
      />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <a href="/admin/users" className="rounded-lg border border-border p-5">
          <p className="text-sm text-muted">People</p>
          <p className="mt-2 font-mono text-3xl">{people ?? 0}</p>
        </a>
        <a href="/admin/warehouses" className="rounded-lg border border-border p-5">
          <p className="text-sm text-muted">Stores</p>
          <p className="mt-2 font-mono text-3xl">{stores ?? 0}</p>
        </a>
      </div>
    </div>
  );
}
