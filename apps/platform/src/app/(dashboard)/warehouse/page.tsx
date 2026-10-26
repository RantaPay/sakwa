import { PageHeading } from "@/components/page-heading";
import { StockBoard } from "@/features/stock";

export default function WarehouseHomePage() {
  return (
    <div>
      <PageHeading
        title="Store"
        body="Confirm incoming bags, release outgoing bags, and watch stock."
      />
      <StockBoard />
    </div>
  );
}
