import { PageHeading } from "@/components/page-heading";
import { PersonForm } from "@/features/users";

export default function AdminUsersPage() {
  return (
    <div>
      <PageHeading
        mark="people"
        title="People"
        body="Staff and investors are created here. Customers sign up themselves."
      />
      <PersonForm />
    </div>
  );
}
