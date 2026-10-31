import { PageHeading } from "@/components/page-heading";
import { ProfileForm } from "@/features/users";

export default function CustomerProfilePage() {
  return (
    <div>
      <PageHeading mark="profile" title="Profile" body="Keep the details for your role current." />
      <ProfileForm />
    </div>
  );
}
