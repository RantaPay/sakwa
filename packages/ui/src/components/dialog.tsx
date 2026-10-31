"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "@phosphor-icons/react";
import * as React from "react";
import { cn } from "../lib/cn";
import { Button } from "./button";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <DialogPrimitive.Overlay className="absolute inset-0 z-0 bg-foreground/40" />
        <DialogPrimitive.Content
          className={cn(
            "relative z-10 max-h-[min(44rem,calc(100dvh-2rem))] w-full max-w-lg overflow-y-auto rounded-[1.75rem] border border-border bg-white p-6 shadow-[var(--shadow-whisper)]",
            className,
          )}
          {...props}
        >
          {children}
          <DialogPrimitive.Close asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3"
              aria-label="Close"
            >
              <X size={22} />
            </Button>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </div>
    </DialogPrimitive.Portal>
  );
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-xl font-semibold text-foreground", className)}
      {...props}
    />
  );
}

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  tone = "primary",
  onConfirm,
  children,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  tone?: "primary" | "danger";
  onConfirm: () => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <p className="mt-2 text-base text-muted">{body}</p>
        <div className="mt-6 flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="secondary" type="button">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant={tone === "danger" ? "danger" : "primary"}
              type="button"
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
