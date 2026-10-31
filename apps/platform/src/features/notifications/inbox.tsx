"use client";

import { Button } from "@sakwa/ui";
import { toLagosDateTime } from "@sakwa/utils";
import { QueryGate } from "@/components/query-gate";
import { useNotifications } from "./use-notifications";

export function NotificationInbox() {
  const { data, isLoading, isError, read } = useNotifications();

  return (
    <QueryGate
      isLoading={isLoading}
      isError={isError}
      isEmpty={!data?.length}
      emptyTitle="No notices"
      emptyBody="When something needs you, it will show here."
    >
      <ul className="divide-y divide-border rounded-lg border border-border">
        {(data ?? []).map((row) => (
          <li key={row.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">{row.title}</p>
              <p className="text-sm text-muted">{row.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">{toLagosDateTime(row.created_at)}</p>
            </div>
            {!row.read_at ? (
              <Button size="sm" variant="secondary" type="button" onClick={() => read.mutate(row.id)}>
                Mark read
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </QueryGate>
  );
}
