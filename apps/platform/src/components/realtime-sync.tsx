"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createBrowserSupabase } from "@/lib/supabase/browser";

/**
 * Keeps every dashboard figure live. Any insert, update, or delete in the
 * public schema (that this user is allowed to read) refetches the data on
 * screen and refreshes server-rendered parts such as the notice count.
 * Bursts of changes are batched so one action causes one refresh.
 */
export function RealtimeSync() {
  const client = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserSupabase();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let channel: RealtimeChannel | null = null;
    let stopped = false;
    let joined = false;

    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        void client.invalidateQueries();
        router.refresh();
      }, 400);
    };

    async function start() {
      // Join with the signed-in user's token. Without it the socket joins as
      // anon and row-level security filters out every change.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (stopped || !session) return;
      await supabase.realtime.setAuth(session.access_token);
      if (stopped) return;
      channel = supabase
        .channel("sakwa-live")
        .on("postgres_changes", { event: "*", schema: "public" }, refresh)
        .subscribe((status) => {
          if (status !== "SUBSCRIBED") return;
          // After a reconnect, catch up on anything missed while offline.
          if (joined) refresh();
          joined = true;
        });
    }

    void start();

    const { data: auth } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) void supabase.realtime.setAuth(session.access_token);
    });

    return () => {
      stopped = true;
      clearTimeout(timer);
      auth.subscription.unsubscribe();
      if (channel) void supabase.removeChannel(channel);
    };
  }, [client, router]);

  return null;
}
