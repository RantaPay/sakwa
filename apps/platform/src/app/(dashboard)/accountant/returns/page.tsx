import { env } from "@/lib/env";
import { ReturnsClient } from "./returns-client";

export default function AccountantReturnsPage() {
  return (
    <ReturnsClient
      kind={env.RETURN_FORMULA_KIND}
      weeklyPercentBps={env.RETURN_WEEKLY_PERCENT_BPS}
    />
  );
}
