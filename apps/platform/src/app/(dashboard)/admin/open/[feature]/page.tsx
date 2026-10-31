import { notFound } from "next/navigation";
import { FeatureBody } from "@/features/permissions/feature-body";
import { env } from "@/lib/env";

/** Screens the director, accountant, or store already use. Admin opens the same ones. */
const ADMIN_SCREENS = new Set([
  "trade",
  "buying_price",
  "cash_given",
  "field_buyers",
  "stores",
  "incoming",
  "outgoing",
  "stock",
  "orders",
  "customer_payments",
  "other_money",
  "reports",
  "capital_requests",
  "profit_requests",
  "capital",
  "returns_desk",
  "enquiries",
]);

export default async function AdminFeaturePage({
  params,
}: {
  params: Promise<{ feature: string }>;
}) {
  const { feature } = await params;
  if (!ADMIN_SCREENS.has(feature)) notFound();
  return <FeatureBody featureId={feature} weeklyPercentBps={env.RETURN_WEEKLY_PERCENT_BPS} />;
}
