import { PageHeading } from "@/components/page-heading";
import { PersonForm } from "@/features/users";

export default function AdminUsersPage() {
  return (
    <div>
      <PageHeading
        mark="people"
        title="People"
        body="Create every person from here. Customers, agents, stores, and the rest."
      />
      <PersonForm />
    </div>
  );
}
