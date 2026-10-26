import { PageHeading } from "@/components/page-heading";
import { DeliveryForm, DeliveryList } from "@/features/deliveries";

export default function AgentDeliveriesPage() {
  return (
    <div>
      <PageHeading
        title="Deliveries"
        body="Record bags taken to a store. This works even without a network."
      />
      <DeliveryForm />
      <DeliveryList />
    </div>
  );
}
