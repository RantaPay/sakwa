"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react";
import { createContext, useContext, useState, type ReactNode } from "react";

const FiguresContext = createContext({ hidden: false, toggle: () => {} });

export function FiguresProvider({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false);
  return (
    <FiguresContext.Provider
      value={{ hidden, toggle: () => setHidden((value) => !value) }}
    >
      {children}
    </FiguresContext.Provider>
  );
}

export function useFigures() {
  return useContext(FiguresContext);
}

export function figureText(value: string, hidden: boolean) {
  return hidden ? "••••" : value;
}

export function FigureToggle() {
  const { hidden, toggle } = useFigures();
  const Icon = hidden ? Eye : EyeSlash;
  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-surface px-4 text-base font-semibold text-foreground"
    >
      <Icon size={22} weight="light" aria-hidden />
      {hidden ? "Show figures" : "Hide figures"}
    </button>
  );
}
