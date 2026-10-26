import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@sakwa/ui/cn";

export function IslandButton({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: string;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const isPrimary = variant === "primary";
  return (
    <a
      href={href}
      className={cn(
        "group inline-flex min-h-11 items-center gap-3 rounded-full pl-5 pr-1.5 py-1.5 text-sm font-semibold transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]",
        isPrimary
          ? "bg-primary text-primary-foreground hover:bg-primary-hover"
          : "border border-border bg-surface text-primary hover:border-primary/30",
        className,
      )}
    >
      <span className="whitespace-nowrap">{children}</span>
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-full transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px",
          isPrimary ? "bg-black/10" : "bg-primary-soft",
        )}
      >
        <ArrowUpRight size={14} weight="bold" />
      </span>
    </a>
  );
}
