/**
 * Withdrawable = credited returns minus profit already withdrawn or still pending.
 * Capital is never withdrawable.
 */
export function withdrawableKobo(input: {
  returnsKobo: bigint;
  withdrawnOrPendingKobo: bigint;
}): bigint {
  const value = input.returnsKobo - input.withdrawnOrPendingKobo;
  return value > 0n ? value : 0n;
}

export function assertWithdrawalAllowed(input: {
  amountKobo: bigint;
  withdrawableKobo: bigint;
  alreadyRequestedThisCycle: boolean;
}): void {
  if (input.alreadyRequestedThisCycle) {
    throw new Error("You can make one profit request per week.");
  }
  if (input.amountKobo <= 0n) {
    throw new Error("Enter an amount greater than zero.");
  }
  if (input.amountKobo > input.withdrawableKobo) {
    throw new Error("That amount is more than the profit you can take out.");
  }
}
