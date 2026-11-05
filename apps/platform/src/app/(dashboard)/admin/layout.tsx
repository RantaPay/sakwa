"use client";

import type { ReactNode } from "react";
import { FigureToggle, FiguresProvider } from "@/features/money/figures";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <FiguresProvider>
      <div className="mb-4 flex justify-end">
        <FigureToggle />
      </div>
      {children}
    </FiguresProvider>
  );
}
