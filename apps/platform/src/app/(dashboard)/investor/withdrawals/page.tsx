"use client";

import { PageHeading } from "@/components/page-heading";
import { WithdrawalForm, WithdrawalList } from "@/features/withdrawals";
import { useAuthUser } from "@/hooks/use-auth-user";

export default function InvestorWithdrawalsPage() {
  const { data: user } = useAuthUser();
  return (
    <div>
      <PageHeading
        title="Profit out"
        body="One request per week. Capital cannot be taken out here."
      />
      <WithdrawalForm />
      {user ? <WithdrawalList investorId={user.id} mode="own" /> : null}
    </div>
  );
}
