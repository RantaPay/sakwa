"use client";

import { toLagosDateTime } from "@sakwa/utils";
import { useQuery } from "@tanstack/react-query";
import { PageHeading } from "@/components/page-heading";
import { describeAudit, listAudit } from "@/features/overview";
import { listUsers } from "@/features/users";
import { queryKeys } from "@/lib/query-keys";

export default function AuditPage() {
  const audit = useQuery({ queryKey: queryKeys.audit, queryFn: () => listAudit(100) });
  const people = useQuery({ queryKey: queryKeys.users, queryFn: listUsers });
  const names = new Map((people.data ?? []).map((row) => [row.id, row.full_name]));

  return (
    <div>
      <PageHeading mark="history" title="History" body="Every change is kept. This list cannot be edited." />
      {audit.isLoading ? <p className="text-base text-muted">Reading history.</p> : null}
      {audit.isError ? <p className="text-base text-danger">Could not read history.</p> : null}
      <div className="rounded-[1.75rem] border border-border/70 bg-bezel p-1.5">
        <ul className="grid gap-2">
          {(audit.data ?? []).map((row) => {
            const copy = describeAudit(row, names);
            return (
              <li key={row.id} className="rounded-[1.25rem] border border-border bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                  {toLagosDateTime(row.created_at)}
                </p>
                <p className="mt-1 text-lg font-semibold">{copy.title}</p>
                <p className="mt-1 text-base text-muted">{copy.detail}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
