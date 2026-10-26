export function stockOnHand(input: {
  bagsIn: number;
  bagsOut: number;
  kgIn: number;
  kgOut: number;
}): { bags: number; kg: number } {
  return {
    bags: input.bagsIn - input.bagsOut,
    kg: Number((input.kgIn - input.kgOut).toFixed(3)),
  };
}

export function deliveryTotalKg(bagCount: number, kgPerBag: number): number {
  return Number((bagCount * kgPerBag).toFixed(3));
}
