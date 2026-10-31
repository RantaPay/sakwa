"use client";

import { PageHeading } from "@/components/page-heading";
import { AdvanceList } from "@/features/advances";
import { useAuthUser } from "@/lib/use-auth-user";

export default function AgentAdvancesPage() {
  const { data: user } = useAuthUser();
  return (
    <div>
      <PageHeading mark="cash_received" title="Cash received" body="Every amount given to you by the enterprise." />
      {user ? <AdvanceList agentId={user.id} /> : null}
    </div>
  );
}
