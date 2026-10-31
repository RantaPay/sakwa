import type { Role } from "@sakwa/types";
import { FeatureScreen } from "./feature-screen";

export function openFeaturePage(role: Role) {
  return async function Page({ params }: { params: Promise<{ feature: string }> }) {
    const { feature } = await params;
    return <FeatureScreen role={role} featureId={feature} />;
  };
}
