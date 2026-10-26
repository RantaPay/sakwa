import { PageHeading } from "@/components/page-heading";
import { AdvanceForm, AdvanceList } from "@/features/advances";

export default function AdvancesPage() {
  return (
    <div>
      <PageHeading title="Cash given" body="Record cash given to a field buyer." />
      <AdvanceForm />
      <AdvanceList />
    </div>
  );
}
