import { PageHeading } from "@/components/page-heading";
import { InvestmentRequestList } from "@/features/investments";

export default function DirectorInvestmentsPage() {
  return (
    <div>
      <PageHeading
        mark="capital_requests"
        title="Investment requests"
        body="Accept a request to send the house account. Confirm the receipt before the investment and interest go on the books."
      />
      <InvestmentRequestList mode="review" />
    </div>
  );
}
