import { PageHeading } from "@/components/page-heading";
import { TransactionBoard } from "@/features/money";

export default function TransactionsPage() {
  return (
    <div>
      <PageHeading
        mark="other_money"
        title="Other money"
        body="Any incoming or outgoing amount that is not an order payment or cash given to an agent."
      />
      <TransactionBoard />
    </div>
  );
}
