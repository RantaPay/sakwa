import { PageHeading } from "@/components/page-heading";
import { EnquiryList } from "@/features/enquiries";

export default function DirectorEnquiriesPage() {
  return (
    <div>
      <PageHeading
        title="Enquiries"
        body="Messages from the public site. Mark them contacted or closed after you reply."
      />
      <EnquiryList />
    </div>
  );
}
