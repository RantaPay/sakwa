const LAGOS = "Africa/Lagos";

export function toLagosDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: LAGOS,
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(iso));
}

export function toLagosDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: LAGOS,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function startOfIsoWeekUtc(date = new Date()): Date {
  const utc = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() - day + 1);
  return utc;
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
