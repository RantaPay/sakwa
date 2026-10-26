"use client";

import { PageHeading } from "@/components/page-heading";
import { NotificationInbox } from "@/features/notifications";

export function NoticesPage() {
  return (
    <div>
      <PageHeading title="Notices" body="Things that need your attention, as they happen." />
      <NotificationInbox />
    </div>
  );
}
