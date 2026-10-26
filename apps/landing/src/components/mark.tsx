export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="16" cy="16" rx="7" ry="12" fill="#166534" />
      <ellipse cx="16" cy="16" rx="2.4" ry="9" fill="#D4A72C" opacity="0.85" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className ?? ""}`}>
      <Mark className="h-6 w-6 shrink-0" />
      <span className="whitespace-nowrap">Sakwa Agro Enterprise</span>
    </span>
  );
}
