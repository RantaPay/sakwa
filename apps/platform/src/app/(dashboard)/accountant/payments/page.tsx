import { PageHeading } from "@/components/page-heading";
import { PaymentBoard } from "@/features/money";

export default function PaymentsPage() {
  return (
    <div>
      <PageHeading
        mark="customer_payments"
        title="Customer payments"
        body="Write in a payment, then confirm it before rice is released."
      />
      <PaymentBoard />
    </div>
  );
}
