"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react";
import * as React from "react";
import { cn } from "../lib/cn";
import type { InputProps } from "./input";

export const PasswordInput = React.forwardRef<HTMLInputElement, Omit<InputProps, "type">>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <div
        className={cn(
          "flex min-h-12 w-full items-center rounded-md border border-border bg-surface pr-1 shadow-none transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
          className,
        )}
      >
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          className="min-h-12 min-w-0 flex-1 border-0 bg-transparent px-3.5 py-2 text-base text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        <button
          type="button"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted hover:bg-bezel hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <EyeSlash size={22} /> : <Eye size={22} />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
