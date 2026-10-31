import { cn } from "../lib/cn";

export function StatCard({
  label,
  value,
  hint,
  gold = false,
}: {
  label: string;
  value: string;
  hint?: string;
  gold?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface p-5",
        gold && "bg-accent-soft border-accent/30",
      )}
    >
      <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className="mt-2 font-mono text-3xl font-semibold text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
