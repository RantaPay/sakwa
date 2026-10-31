import { PageHeading } from "@/components/page-heading";
import { InvestmentForm, InvestmentList } from "@/features/investments";

export default function AccountantInvestmentsPage() {
  return (
    <div>
      <PageHeading mark="capital" title="Capital" body="Write in the amount each investor put in." />
      <InvestmentForm />
      <InvestmentList />
    </div>
  );
}
