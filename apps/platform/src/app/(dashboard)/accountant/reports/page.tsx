import { PageHeading } from "@/components/page-heading";
import { ReportsPanel } from "@/features/reports";

export default function ReportsPage() {
  return (
    <div>
      <PageHeading mark="reports" title="Reports" body="Download the money list as Excel or PDF." />
      <ReportsPanel />
    </div>
  );
}
