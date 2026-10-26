"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export function useRealtimeTable(table: string, queryKey: readonly unknown[]) {
  const client = useQueryClient();
  const channelName = `rt-${table}-${queryKey.join(":")}`;
  const rootKey = String(queryKey[0] ?? table);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        void client.invalidateQueries({ queryKey: [rootKey] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [client, table, channelName, rootKey]);
}
