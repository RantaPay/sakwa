"use client";

import type { Role } from "@sakwa/types";
import { create } from "zustand";

type UiState = {
  sidebarOpen: boolean;
  activeRole: Role | null;
  pendingCount: number;
  online: boolean;
  setSidebarOpen: (open: boolean) => void;
  setActiveRole: (role: Role) => void;
  setPendingCount: (count: number) => void;
  setOnline: (online: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  activeRole: null,
  pendingCount: 0,
  online: true,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setActiveRole: (activeRole) => set({ activeRole }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setOnline: (online) => set({ online }),
}));
