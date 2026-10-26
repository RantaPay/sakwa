const NAIRA = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export function nairaToKobo(naira: string | number): bigint {
  const value = typeof naira === "number" ? naira : Number(naira.replace(/,/g, ""));
  if (!Number.isFinite(value)) {
    throw new Error("Amount is not a number.");
  }
  return BigInt(Math.round(value * 100));
}

export function koboToNairaNumber(kobo: bigint | number | string): number {
  return Number(BigInt(kobo)) / 100;
}

export function formatNaira(kobo: bigint | number | string): string {
  const naira = koboToNairaNumber(kobo);
  return NAIRA.format(naira);
}

export function parseKobo(value: bigint | number | string): bigint {
  return BigInt(value);
}
