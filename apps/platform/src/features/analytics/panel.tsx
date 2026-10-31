"use client";

import { Button } from "@sakwa/ui";
import { formatNaira } from "@sakwa/utils";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { analyticsCsv, analyticsPdf } from "./export";
import { loadAnalytics, type AnalyticsReport, type PersonRollup } from "./load";

function booksLabel(group: "rice" | "cash" | "interest") {
  if (group === "rice") return "House books";
  if (group === "interest") return "Investor interest";
  return "Cash";
}

function save(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <figure className="rounded-[1.25rem] border border-border bg-white p-4">
      <figcaption className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{label}</figcaption>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </figure>
  );
}

function People({ title, rows }: { title: string; rows: PersonRollup[] }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-3 rounded-[1.75rem] border border-border/70 bg-bezel p-1.5">
        <ul className="grid gap-2">
          {rows.length === 0 ? (
            <li className="rounded-[1.25rem] bg-white p-4 text-base text-muted">Nothing recorded yet.</li>
          ) : (
            rows.map((row) => (
              <li key={row.id} className="rounded-[1.25rem] border border-border bg-white p-4">
                <p className="text-lg font-semibold">{row.name}</p>
                <p className="text-sm text-muted">{row.note}</p>
                <p className="mt-2 text-base">{row.primary}</p>
                <p className="text-base text-muted">{row.secondary}</p>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}

export function AnalyticsPanel() {
  const report = useQuery({ queryKey: queryKeys.analytics, queryFn: loadAnalytics });
  const data = report.data;

  async function downloadCsv() {
    const current = data ?? (await loadAnalytics());
    const blob = new Blob([analyticsCsv(current)], { type: "text/csv;charset=utf-8" });
    save("sakwa-analytics.csv", blob);
  }

  async function downloadPdf() {
    const current = data ?? (await loadAnalytics());
    save("sakwa-analytics.pdf", await analyticsPdf(current));
  }

  if (report.isLoading) return <p className="text-base text-muted">Reading the books.</p>;
  if (report.isError || !data) return <p className="text-base text-danger">Could not read the books.</p>;

  return <AnalyticsBody data={data} onCsv={() => void downloadCsv()} onPdf={() => void downloadPdf()} />;
}

function AnalyticsBody({
  data,
  onCsv,
  onPdf,
}: {
  data: AnalyticsReport;
  onCsv: () => void;
  onPdf: () => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={onCsv}>
          Download CSV
        </Button>
        <Button type="button" variant="secondary" onClick={onPdf}>
          Download PDF
        </Button>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Figure label="Expense" value={formatNaira(data.expenseKobo)} />
        <Figure label="Sales" value={formatNaira(data.salesKobo)} />
        <Figure label="Interest" value={formatNaira(data.interestKobo)} />
        <Figure label="Cash in" value={formatNaira(data.cashInKobo)} />
        <Figure label="Cash out" value={formatNaira(data.cashOutKobo)} />
        <Figure label="Investor interest written" value={formatNaira(data.investorInterestKobo)} />
      </div>
      <section className="mt-8">
        <h2 className="text-xl font-semibold">Every amount</h2>
        <p className="mt-1 text-base text-muted">
          Expense and sales use the house price per kg on that day. House interest is sales minus that expense. Investor interest is the weekly return written for each investor. Cash lines are money that actually moved.
        </p>
        <div className="mt-3 rounded-[1.75rem] border border-border/70 bg-bezel p-1.5">
          <ul className="grid gap-2">
            {data.lines.length === 0 ? (
              <li className="rounded-[1.25rem] bg-white p-4 text-base text-muted">No lines yet.</li>
            ) : (
              data.lines.map((row) => (
                <li key={row.id} className="rounded-[1.25rem] border border-border bg-white p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className="text-lg font-semibold">
                      {row.title} · {row.direction === "in" ? "In" : "Out"}
                    </p>
                    <p className="text-lg font-semibold tabular-nums">{formatNaira(row.amountKobo)}</p>
                  </div>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-muted">
                    {row.date} · {booksLabel(row.group)}
                  </p>
                  <p className="mt-2 text-base">{row.who}</p>
                  <p className="text-base text-muted">{row.detail}</p>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
      <People title="Agents" rows={data.agents} />
      <People title="Customers" rows={data.customers} />
    </div>
  );
}
