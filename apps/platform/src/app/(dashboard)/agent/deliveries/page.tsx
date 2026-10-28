import { PageHeading } from "@/components/page-heading";
import { DeliveryForm, DeliveryList } from "@/features/deliveries";

export default function AgentDeliveriesPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Deliveries"
        body="Record bags supplied to a store."
      />
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <section className="lg:col-span-5" aria-label="Record delivery">
          <DeliveryForm />
        </section>
        <section className="lg:col-span-7" aria-label="Delivery history">
          <DeliveryList />
        </section>
      </div>
    </div>
  );
}
