import { describe, expect, it } from "vitest";
import { calculateInvestorReturn } from "./investor-returns";

describe("calculateInvestorReturn", () => {
  it("credits a fixed weekly percent of capital", () => {
    expect(
      calculateInvestorReturn({
        kind: "fixed_weekly_percent",
        capitalKobo: 1_000_000n,
        weeklyPercentBps: 200,
      }),
    ).toBe(20_000n);
  });

  it("shares profit by capital portion", () => {
    expect(
      calculateInvestorReturn({
        kind: "profit_share",
        capitalKobo: 250_000n,
        periodProfitKobo: 100_000n,
        totalCapitalKobo: 1_000_000n,
      }),
    ).toBe(25_000n);
  });

  it("returns zero when total capital is zero", () => {
    expect(
      calculateInvestorReturn({
        kind: "profit_share",
        capitalKobo: 100n,
        periodProfitKobo: 50n,
        totalCapitalKobo: 0n,
      }),
    ).toBe(0n);
  });
});
