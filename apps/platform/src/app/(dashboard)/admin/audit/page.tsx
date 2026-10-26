import { PageHeading } from "@/components/page-heading";
import { createServerSupabase } from "@/lib/supabase/server";
import { toLagosDateTime } from "@sakwa/utils";

export default async function AuditPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <PageHeading title="History" body="Every change is kept. This list cannot be edited." />
      <ul className="divide-y divide-border rounded-lg border border-border">
        {(data ?? []).map((row) => (
          <li key={row.id} className="p-4 text-sm">
            <p className="font-semibold">
              {row.action} on {row.table_name}
            </p>
            <p className="text-muted">{toLagosDateTime(row.created_at)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
