import { PageHeading } from "@/components/page-heading";
import { DeliveryDecisionList } from "@/features/deliveries";

export default function WarehouseDeliveriesPage() {
  return (
    <div>
      <PageHeading
        mark="incoming"
        title="Incoming"
        body="Confirm bags that arrived. Only confirmed bags go on the books."
      />
      <DeliveryDecisionList />
    </div>
  );
}
