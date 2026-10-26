export type ReturnFormulaKind = "fixed_weekly_percent" | "profit_share";

export type ReturnInput = {
  kind: ReturnFormulaKind;
  capitalKobo: bigint;
  weeklyPercentBps?: number;
  periodProfitKobo?: bigint;
  totalCapitalKobo?: bigint;
};

/**
 * Isolated on purpose. The business has not confirmed the formula.
 * fixed_weekly_percent: capital * bps / 10_000
 * profit_share: period profit * capital / total capital
 */
export function calculateInvestorReturn(input: ReturnInput): bigint {
  if (input.kind === "fixed_weekly_percent") {
    const bps = input.weeklyPercentBps ?? 0;
    if (bps < 0) throw new Error("Weekly percent cannot be negative.");
    return (input.capitalKobo * BigInt(bps)) / 10_000n;
  }

  const profit = input.periodProfitKobo ?? 0n;
  const total = input.totalCapitalKobo ?? 0n;
  if (total <= 0n) return 0n;
  if (profit <= 0n) return 0n;
  return (profit * input.capitalKobo) / total;
}
