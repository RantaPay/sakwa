export function Mark({ className }: { className?: string }) {
  return <img src="/brand/mark.png" alt="" className={className ?? "h-8 w-auto"} />;
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className ?? ""}`}>
      <Mark className="h-8 w-auto shrink-0" />
      <span className="whitespace-nowrap leading-tight">
        Sakwa
        <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
          Agro Enterprise
        </span>
      </span>
    </span>
  );
}
