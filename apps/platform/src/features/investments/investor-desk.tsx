"use client";

import { useReturns } from "@/features/returns";
import { useAuthUser } from "@/lib/use-auth-user";
import { SectionMark } from "@/components/shell/section-icons";
import { GrowthChart } from "./growth-chart";
import { InvestmentList } from "./investment-list";
import { InvestmentRequestForm } from "./request-form";
import { InvestmentRequestList } from "./request-list";
import { PositionChart } from "./position-chart";
import { usePosition } from "./use-investments";

export function InvestorDesk() {
  const { data: user } = useAuthUser();
  const position = usePosition(user?.id);
  const returns = useReturns(user?.id);
  const row = position.data;

  return (
    <div>
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <section className="lg:col-span-5" aria-label="Ask to invest">
          <h2 className="mb-4 flex items-center gap-3 text-xl font-semibold">
            <SectionMark mark="ask_to_invest" size={22} className="size-12" />
            Ask to invest
          </h2>
          <InvestmentRequestForm />
          <div className="mt-6">
            <h3 className="mb-3 text-base font-semibold">Your requests</h3>
            {user ? <InvestmentRequestList investorId={user.id} mode="own" /> : null}
          </div>
        </section>
        <section className="lg:col-span-7" aria-label="Interest chart">
          <PositionChart
            capitalKobo={Number(row?.capital_kobo ?? 0)}
            returnsKobo={Number(row?.returns_kobo ?? 0)}
            withdrawnKobo={Number(row?.withdrawn_or_pending_kobo ?? 0)}
          />
        </section>
      </div>
      <div className="mt-10">
        <GrowthChart rows={returns.data ?? []} />
      </div>
      <div className="mt-10">{user ? <InvestmentList investorId={user.id} /> : null}</div>
    </div>
  );
}
