import { PageHeading } from "@/components/page-heading";
import { OrderList } from "@/features/orders";

export default function CustomerHomePage() {
  return (
    <div>
      <PageHeading
        title="Your orders"
        body="Place an order, pay offline, and watch it through to delivery."
      />
      <OrderList />
    </div>
  );
}
