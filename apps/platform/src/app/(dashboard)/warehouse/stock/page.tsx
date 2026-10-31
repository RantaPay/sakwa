import { PageHeading } from "@/components/page-heading";
import { MovementList, StockBoard } from "@/features/stock";

export default function WarehouseStockPage() {
  return (
    <div className="space-y-10">
      <PageHeading mark="stock" title="Stock" body="Bags on hand, plus every in and out." />
      <StockBoard />
      <MovementList />
    </div>
  );
}
