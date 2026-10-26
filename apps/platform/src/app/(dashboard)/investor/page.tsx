"use client";

import { StatCard } from "@sakwa/ui";
import { formatNaira } from "@sakwa/utils";
import { PageHeading } from "@/components/page-heading";
import { GrowthChart, InvestmentList, usePosition } from "@/features/investments";
import { useReturns } from "@/features/returns";
import { useAuthUser } from "@/hooks/use-auth-user";

export default function InvestorHomePage() {
  const { data: user } = useAuthUser();
  const position = usePosition(user?.id);
  const returns = useReturns(user?.id);
  const row = position.data;

  return (
    <div className="space-y-8">
      <PageHeading
        title="Your position"
        body="Your capital stays in. You can request profit only."
      />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard label="Capital in" value={formatNaira(row?.capital_kobo ?? 0)} />
        <StatCard label="Returns to date" value={formatNaira(row?.returns_kobo ?? 0)} gold />
        <StatCard
          label="Profit you can take"
          value={formatNaira(row?.withdrawable_kobo ?? 0)}
        />
      </div>
      <GrowthChart rows={returns.data ?? []} />
      {user ? <InvestmentList investorId={user.id} /> : null}
    </div>
  );
}
