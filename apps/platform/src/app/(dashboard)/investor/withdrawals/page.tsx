"use client";

import { PageHeading } from "@/components/page-heading";
import { WithdrawalForm, WithdrawalList } from "@/features/withdrawals";
import { useAuthUser } from "@/lib/use-auth-user";

export default function InvestorWithdrawalsPage() {
  const { data: user } = useAuthUser();
  return (
    <div>
      <PageHeading
        mark="investor_profit"
        title="Profit out"
        body="One request per week. Give the account we should pay. Confirm when the money lands."
      />
      <WithdrawalForm />
      {user ? <WithdrawalList investorId={user.id} mode="own" /> : null}
    </div>
  );
}
