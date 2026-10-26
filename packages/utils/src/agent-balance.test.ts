import { describe, expect, it } from "vitest";
import { agentBalanceKobo, agentBalanceLabel } from "./agent-balance";

describe("agentBalanceKobo", () => {
  it("is cash left when advances exceed confirmed spend", () => {
    expect(
      agentBalanceKobo({ advancedKobo: 500_000n, spentOnConfirmedKobo: 200_000n }),
    ).toBe(300_000n);
    expect(agentBalanceLabel(300_000n)).toBe("cash_left");
  });

  it("is agent added when confirmed spend exceeds advances", () => {
    expect(
      agentBalanceKobo({ advancedKobo: 100_000n, spentOnConfirmedKobo: 150_000n }),
    ).toBe(-50_000n);
    expect(agentBalanceLabel(-50_000n)).toBe("agent_added");
  });

  it("is even at zero", () => {
    expect(
      agentBalanceKobo({ advancedKobo: 100_000n, spentOnConfirmedKobo: 100_000n }),
    ).toBe(0n);
    expect(agentBalanceLabel(0n)).toBe("even");
  });
});
