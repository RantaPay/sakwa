import { ROLE_HOME, type Role } from "@sakwa/types";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { isFeatureEnabled } from "./access";
import { FEATURES } from "./catalog";
import { FeatureBody } from "./feature-body";
import { loadGrants } from "./load-grants";

export async function FeatureScreen({
  role,
  featureId,
}: {
  role: Role;
  featureId: string;
}) {
  const known = FEATURES.some((feature) => feature.id === featureId);
  const rows = await loadGrants();
  if (!known || role === "admin" || !isFeatureEnabled(role, featureId, rows)) {
    redirect(role === "admin" ? "/admin" : ROLE_HOME[role]);
  }
  return (
    <FeatureBody featureId={featureId} weeklyPercentBps={env.RETURN_WEEKLY_PERCENT_BPS} />
  );
}
