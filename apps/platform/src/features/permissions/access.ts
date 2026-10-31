import { ROLE_HOME, type Role } from "@sakwa/types";
import { ROLE_NAV } from "@/components/shell/nav-config";
import {
  CONTROLLABLE_ROLES,
  FEATURES,
  type ControllableRole,
  type FeatureDef,
  type PermissionRow,
} from "./catalog";

const ROLE_PREFIXES: Role[] = [
  "admin",
  "director",
  "accountant",
  "warehouse",
  "agent",
  "investor",
  "customer",
];

const OPEN_PATH = new RegExp(`^/(${CONTROLLABLE_ROLES.join("|")})/open/([a-z0-9_-]+)/?$`);

export function isControllableRole(value: string): value is ControllableRole {
  return (CONTROLLABLE_ROLES as readonly string[]).includes(value);
}

export function isFeatureEnabled(role: Role, featureId: string, rows: PermissionRow[]): boolean {
  if (role === "admin") return false;
  const row = rows.find((item) => item.role === role && item.feature_id === featureId);
  if (row) return row.enabled;
  const feature = FEATURES.find((item) => item.id === featureId);
  if (!feature || !isControllableRole(role)) return false;
  return feature.defaults.includes(role);
}

export type NavItem = { href: string; label: string };

export function navItemsFor(role: Role, rows: PermissionRow[]): NavItem[] {
  if (role === "admin") return ROLE_NAV.admin;
  const enabled = FEATURES.filter((feature) => isFeatureEnabled(role, feature.id, rows));
  const visible = enabled
    .filter(
      (feature) =>
        !feature.card && (feature.nav || !feature.defaults.includes(role as ControllableRole)),
    )
    .sort((a, b) => a.order - b.order);
  const items = visible.map((feature) => {
    const clash = visible.some((item) => item.id !== feature.id && item.label === feature.label);
    return {
      href: `/${role}/open/${feature.id}`,
      label: clash ? feature.menuLabel : feature.label,
    };
  });
  return [{ href: ROLE_HOME[role], label: "Home" }, ...items];
}

export function homeFeatures(role: Role, rows: PermissionRow[]): FeatureDef[] {
  if (role === "admin") return [];
  return FEATURES.filter((feature) => feature.home && isFeatureEnabled(role, feature.id, rows)).sort(
    (a, b) => a.homeOrder - b.homeOrder || a.order - b.order,
  );
}

export function pathAccess(
  pathname: string,
  role: Role,
  rows: PermissionRow[],
): "allow" | "deny" | "ignore" {
  if (role === "admin") return "ignore";
  const open = pathname.match(OPEN_PATH);
  if (open) {
    const feature = FEATURES.find((item) => item.id === open[2]);
    if (!feature || open[1] !== role) return "deny";
    return isFeatureEnabled(role, feature.id, rows) ? "allow" : "deny";
  }
  const feature = FEATURES.find((item) =>
    item.paths.some((path) => pathname === path || pathname.startsWith(`${path}/`)),
  );
  if (!feature) return "ignore";
  return isFeatureEnabled(role, feature.id, rows) ? "allow" : "deny";
}

export function actingRole(pathname: string, held: Role[]): Role | null {
  const prefix = ROLE_PREFIXES.find(
    (role) => pathname === `/${role}` || pathname.startsWith(`/${role}/`),
  );
  if (prefix && held.includes(prefix)) return prefix;
  return held[0] ?? null;
}

export function isNavActive(pathname: string, href: string, role: Role) {
  if (href === `/${role}`) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Deltas from catalog defaults, so a screen added later still follows its own default. */
export function encodeGrantCookie(rows: PermissionRow[]): string {
  const parts: string[] = [];
  for (const role of CONTROLLABLE_ROLES) {
    const roleRows = rows.filter((row) => row.role === role);
    if (roleRows.length === 0) continue;
    const deltas: string[] = [];
    for (const feature of FEATURES) {
      const row = roleRows.find((item) => item.feature_id === feature.id);
      if (!row) continue;
      const fallback = feature.defaults.includes(role);
      if (row.enabled === fallback) continue;
      deltas.push(`${feature.id}:${row.enabled ? "1" : "0"}`);
    }
    if (deltas.length === 0) continue;
    parts.push(`${role}=${deltas.join(",")}`);
  }
  return parts.join("|");
}

export function decodeGrantCookie(value: string | undefined): PermissionRow[] {
  if (!value) return [];
  let current = value.trim();
  if (current.startsWith('"') && current.endsWith('"')) current = current.slice(1, -1);
  for (let step = 0; step < 3; step += 1) {
    if (!current.includes("%")) break;
    try {
      const next = decodeURIComponent(current);
      if (next === current) break;
      current = next;
    } catch {
      break;
    }
  }
  const rows: PermissionRow[] = [];
  if (!current) return rows;
  for (const part of current.split("|")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    const role = part.slice(0, eq);
    if (!isControllableRole(role)) continue;
    const tokens = part
      .slice(eq + 1)
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean);
    const legacy = tokens.some((token) => !token.includes(":"));
    if (legacy) {
      const enabled = new Set(tokens);
      for (const feature of FEATURES) {
        rows.push({ role, feature_id: feature.id, enabled: enabled.has(feature.id) });
      }
      continue;
    }
    for (const token of tokens) {
      const colon = token.indexOf(":");
      const featureId = token.slice(0, colon);
      const flag = token.slice(colon + 1);
      if ((flag !== "0" && flag !== "1") || !FEATURES.some((feature) => feature.id === featureId)) {
        continue;
      }
      rows.push({ role, feature_id: featureId, enabled: flag === "1" });
    }
  }
  return rows;
}
