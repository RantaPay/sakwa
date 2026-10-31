import { PageHeading } from "@/components/page-heading";
import { AdvanceForm, AdvanceList } from "@/features/advances";

export default function AdvancesPage() {
  return (
    <div>
      <PageHeading mark="cash_given" title="Cash given" body="Record cash given to an agent." />
      <AdvanceForm />
      <AdvanceList />
    </div>
  );
}
