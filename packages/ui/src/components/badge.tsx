import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold",
  {
    variants: {
      tone: {
        green: "bg-primary-soft text-primary",
        gold: "bg-accent-soft text-accent-foreground",
        stone: "bg-bezel text-muted",
        warning: "bg-amber-50 text-warning",
        danger: "bg-red-50 text-danger",
      },
    },
    defaultVariants: { tone: "stone" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
