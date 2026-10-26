import { PageHeading } from "@/components/page-heading";
import { ReleaseList } from "@/features/stock";

export default function WarehouseReleasesPage() {
  return (
    <div>
      <PageHeading
        title="Outgoing"
        body="Release bags after payment is confirmed. This marks the order delivered."
      />
      <ReleaseList />
    </div>
  );
}
