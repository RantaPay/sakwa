"use client";

import { formatNaira } from "@sakwa/utils";
import { DashboardHome } from "@/components/dashboard-home";
import { WelcomeCard } from "@/components/welcome-card";
import { usePosition } from "@/features/investments";
import { GrantedHome } from "@/features/permissions/home-sections";
import { useAuthUser } from "@/lib/use-auth-user";

export default function InvestorHomePage() {
  const { data: user } = useAuthUser();
  const position = usePosition(user?.id);
  const row = position.data;

  return (
    <DashboardHome
      greeting={
        <WelcomeCard
          role="investor"
          body="Ask to put capital in. Pay the house account, upload the receipt, and interest starts after the director confirms it."
          stats={[
            { label: "Capital in", value: formatNaira(row?.capital_kobo ?? 0) },
            { label: "Returns to date", value: formatNaira(row?.returns_kobo ?? 0), gold: true },
            { label: "Profit you can take", value: formatNaira(row?.withdrawable_kobo ?? 0) },
          ]}
        />
      }
    >
      <GrantedHome role="investor" />
    </DashboardHome>
  );
}
