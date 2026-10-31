import { PageHeading } from "@/components/page-heading";
import { OrderForm, OrderList } from "@/features/orders";

export default function CustomerOrdersPage() {
  return (
    <div>
      <PageHeading
        mark="customer_orders"
        title="Orders"
        body="Staff set the price per order. Payment is made offline before rice is released."
      />
      <OrderForm />
      <OrderList />
    </div>
  );
}
