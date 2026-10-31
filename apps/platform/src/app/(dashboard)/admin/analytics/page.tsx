import { PageHeading } from "@/components/page-heading";
import { AnalyticsPanel } from "@/features/analytics/panel";

export default function AdminAnalyticsPage() {
  return (
    <div>
      <PageHeading
        mark="analytics"
        title="Analytics"
        body="Expense, interest, and every amount in or out. Download the same list as CSV or PDF."
      />
      <AnalyticsPanel />
    </div>
  );
}
