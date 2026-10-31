"use client";

import { Button, EmptyState, Skeleton, StatusBadge } from "@sakwa/ui";
import { toLagosDateTime } from "@sakwa/utils";
import { useEnquiries } from "./use-enquiries";

export function EnquiryList() {
  const { data, isLoading, isError, mutate } = useEnquiries();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }
  if (isError) {
    return <p className="text-sm text-danger">Could not load enquiries.</p>;
  }
  if (!data?.length) {
    return (
      <EmptyState
        title="No enquiries yet"
        body="When someone writes from the public site, the message will appear here."
      />
    );
  }

  return (
    <ul className="grid gap-3">
      {data.map((row) => (
        <li key={row.id} className="rounded-lg border border-border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{row.name}</p>
              <p className="text-sm text-muted">
                {row.phone} · {row.email}
              </p>
            </div>
            <StatusBadge status={row.status} />
          </div>
          <p className="mt-3 text-sm">{row.message}</p>
          {row.intended_amount_naira ? (
            <p className="mt-2 text-sm text-muted">
              Intended amount: {row.intended_amount_naira}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-muted-foreground">
            {toLagosDateTime(row.created_at)}
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              type="button"
              onClick={() => mutate.mutate({ id: row.id, status: "contacted" })}
            >
              Mark contacted
            </Button>
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={() => mutate.mutate({ id: row.id, status: "closed" })}
            >
              Close
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
