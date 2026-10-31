import { PageHeading } from "@/components/page-heading";
import { PermissionBoard } from "@/features/permissions/permission-board";

export default function PermissionsPage() {
  return (
    <div>
      <PageHeading
        mark="permissions"
        title="Permissions"
        body="Tick a screen to show it on that role's menu and home. Untick it and the screen leaves. Any screen can be given to any role except admin."
      />
      <PermissionBoard />
    </div>
  );
}
