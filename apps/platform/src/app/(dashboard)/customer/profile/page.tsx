import { PageHeading } from "@/components/page-heading";
import { ProfileForm } from "@/features/users";

export default function CustomerProfilePage() {
  return (
    <div>
      <PageHeading title="Profile" body="Keep your name and phone current." />
      <ProfileForm />
    </div>
  );
}
