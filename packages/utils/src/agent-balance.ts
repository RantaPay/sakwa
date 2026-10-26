/**
 * Agent balance = cash advanced minus spend on confirmed deliveries.
 * Positive: cash still with the agent.
 * Negative: the agent added their own money.
 * Zero: even.
 */
export function agentBalanceKobo(input: {
  advancedKobo: bigint;
  spentOnConfirmedKobo: bigint;
}): bigint {
  return input.advancedKobo - input.spentOnConfirmedKobo;
}

export function agentBalanceLabel(balanceKobo: bigint): "cash_left" | "agent_added" | "even" {
  if (balanceKobo > 0n) return "cash_left";
  if (balanceKobo < 0n) return "agent_added";
  return "even";
}
