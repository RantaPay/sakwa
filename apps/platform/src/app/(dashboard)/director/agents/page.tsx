import { formatNaira } from "@sakwa/utils";
import { PageHeading } from "@/components/page-heading";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function DirectorAgentsPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("agent_balances").select("*");
  const { data: people } = await supabase.from("profiles").select("id, full_name");
  const names = new Map((people ?? []).map((row) => [row.id, row.full_name]));

  return (
    <div>
      <PageHeading
        title="Field buyers"
        body="Balance is cash given minus spend on confirmed deliveries. A minus means the buyer added their own money."
      />
      <ul className="divide-y divide-border rounded-lg border border-border">
        {(data ?? []).map((row) => (
          <li key={row.agent_id} className="flex items-center justify-between p-4">
            <p className="font-semibold">{names.get(row.agent_id) ?? "Field buyer"}</p>
            <p className="font-mono font-semibold">{formatNaira(row.balance_kobo)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
