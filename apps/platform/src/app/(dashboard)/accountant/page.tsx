import { formatNaira, profitKobo } from "@sakwa/utils";
import { PageHeading } from "@/components/page-heading";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function AccountantHomePage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("transactions").select("direction, amount_kobo");
  const incoming = (data ?? [])
    .filter((row) => row.direction === "incoming")
    .reduce((sum, row) => sum + BigInt(row.amount_kobo), 0n);
  const outgoing = (data ?? [])
    .filter((row) => row.direction === "outgoing")
    .reduce((sum, row) => sum + BigInt(row.amount_kobo), 0n);

  return (
    <div>
      <PageHeading title="Accountant" body="Write in cash given, customer payments, and other money." />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border p-5">
          <p className="text-sm text-muted">Money in</p>
          <p className="mt-2 font-mono text-2xl">{formatNaira(incoming)}</p>
        </div>
        <div className="rounded-lg border border-border p-5">
          <p className="text-sm text-muted">Money out</p>
          <p className="mt-2 font-mono text-2xl">{formatNaira(outgoing)}</p>
        </div>
        <div className="rounded-lg border border-border bg-accent-soft p-5">
          <p className="text-sm text-muted">Result</p>
          <p className="mt-2 font-mono text-2xl">
            {formatNaira(profitKobo({ incomingKobo: incoming, outgoingKobo: outgoing }))}
          </p>
        </div>
      </div>
    </div>
  );
}
