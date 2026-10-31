import * as React from "react";
import { cn } from "../lib/cn";

export function Card({
  className,
  bezel = false,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { bezel?: boolean }) {
  if (bezel) {
    return (
      <div
        className={cn(
          "rounded-[2rem] border border-border/70 bg-bezel p-1.5",
          className,
        )}
      >
        <div
          className="rounded-[calc(2rem-0.375rem)] bg-surface shadow-[inset_0_1px_1px_rgb(255_255_255_/_0.8)]"
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface shadow-[var(--shadow-whisper)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}
