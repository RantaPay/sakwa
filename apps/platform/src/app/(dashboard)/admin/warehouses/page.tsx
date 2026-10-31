import { PageHeading } from "@/components/page-heading";
import { StoreForm } from "@/features/stock";

export default function AdminWarehousesPage() {
  return (
    <div>
      <PageHeading
        mark="stores"
        title="Stores"
        body="Each store holds bags. Staff can be assigned to more than one store."
      />
      <StoreForm />
    </div>
  );
}
