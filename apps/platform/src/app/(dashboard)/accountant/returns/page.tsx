import { env } from "@/lib/env";
import { ReturnsPanel } from "@/features/returns";

export default function AccountantReturnsPage() {
  return (
    <ReturnsPanel weeklyPercentBps={env.RETURN_WEEKLY_PERCENT_BPS} />
  );
}
