import { describe, expect, it } from "vitest";
import { assertWithdrawalAllowed, withdrawableKobo } from "./withdrawable";

describe("withdrawableKobo", () => {
  it("never goes below zero", () => {
    expect(
      withdrawableKobo({ returnsKobo: 10_000n, withdrawnOrPendingKobo: 12_000n }),
    ).toBe(0n);
  });

  it("subtracts pending and paid profit", () => {
    expect(
      withdrawableKobo({ returnsKobo: 50_000n, withdrawnOrPendingKobo: 20_000n }),
    ).toBe(30_000n);
  });
});

describe("assertWithdrawalAllowed", () => {
  it("blocks a second request in the same week", () => {
    expect(() =>
      assertWithdrawalAllowed({
        amountKobo: 1_000n,
        withdrawableKobo: 5_000n,
        alreadyRequestedThisCycle: true,
      }),
    ).toThrow(/one profit request/);
  });

  it("blocks amounts above withdrawable profit", () => {
    expect(() =>
      assertWithdrawalAllowed({
        amountKobo: 6_000n,
        withdrawableKobo: 5_000n,
        alreadyRequestedThisCycle: false,
      }),
    ).toThrow(/more than the profit/);
  });
});
