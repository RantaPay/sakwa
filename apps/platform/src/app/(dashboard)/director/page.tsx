import { PageHeading } from "@/components/page-heading";

export default function DirectorHomePage() {
  return (
    <div>
      <PageHeading
        title="Director"
        body="Watch field buyers, stores, profit requests, and investor enquiries."
      />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <a className="rounded-lg border border-border p-5" href="/director/agents">
          Field buyers
        </a>
        <a className="rounded-lg border border-border p-5" href="/director/stores">
          Stores
        </a>
        <a className="rounded-lg border border-border p-5" href="/director/withdrawals">
          Profit requests
        </a>
        <a className="rounded-lg border border-border p-5" href="/director/enquiries">
          Enquiries
        </a>
      </div>
    </div>
  );
}
