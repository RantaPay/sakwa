import { PageHeading } from "@/components/page-heading";
import { OrderPriceList } from "@/features/orders";

export default function AccountantOrdersPage() {
  return (
    <div>
      <PageHeading
        mark="orders"
        title="Orders"
        body="Set the price per kg for each order. A store can be assigned here or later."
      />
      <OrderPriceList />
    </div>
  );
}
