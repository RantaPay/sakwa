export function profitKobo(input: {
  incomingKobo: bigint;
  outgoingKobo: bigint;
}): bigint {
  return input.incomingKobo - input.outgoingKobo;
}
