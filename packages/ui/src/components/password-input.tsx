"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react";
import * as React from "react";
import { cn } from "../lib/cn";
import { Input, type InputProps } from "./input";

export const PasswordInput = React.forwardRef<HTMLInputElement, Omit<InputProps, "type">>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn("pr-12", className)}
          {...props}
        />
        <button
          type="button"
          className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center text-muted hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <EyeSlash size={18} /> : <Eye size={18} />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
