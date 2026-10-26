import { DEMO_COOKIE, parseDemoCookie, type DemoAccount } from "./accounts";

export function readDemoSessionFromCookieHeader(header: string | null): DemoAccount | null {
  if (!header) return null;
  const parts = header.split(";").map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(`${DEMO_COOKIE}=`));
  if (!match) return null;
  return parseDemoCookie(match.slice(DEMO_COOKIE.length + 1));
}

export function readDemoSessionFromDocument(): DemoAccount | null {
  if (typeof document === "undefined") return null;
  return readDemoSessionFromCookieHeader(document.cookie);
}
