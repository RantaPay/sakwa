"use client";

import { PageHeading } from "@/components/page-heading";
import { ReturnList } from "@/features/returns";
import { useAuthUser } from "@/hooks/use-auth-user";

export default function InvestorReturnsPage() {
  const { data: user } = useAuthUser();
  return (
    <div>
      <PageHeading title="Returns" body="Profit credited to you, week by week." />
      {user ? <ReturnList investorId={user.id} /> : null}
    </div>
  );
}
