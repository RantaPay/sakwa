"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { flushOutbox, pendingCount } from "@/lib/offline/sync";
import { makeQueryClient } from "@/lib/query-client";
import { useUiStore } from "@/stores/ui-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => makeQueryClient());
  const setOnline = useUiStore((s) => s.setOnline);
  const setPendingCount = useUiStore((s) => s.setPendingCount);

  useEffect(() => {
    const onOnline = () => {
      setOnline(true);
      void flushOutbox().then(() => pendingCount().then(setPendingCount));
    };
    const onOffline = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    void pendingCount().then(setPendingCount);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [setOnline, setPendingCount]);

  return (
    <NuqsAdapter>
      <QueryClientProvider client={client}>
        {children}
        <Toaster position="top-right" />
      </QueryClientProvider>
    </NuqsAdapter>
  );
}
