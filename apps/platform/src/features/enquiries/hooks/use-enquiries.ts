"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { listEnquiries, updateEnquiryStatus } from "../services/enquiries";

export function useEnquiries() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["enquiries"], queryFn: listEnquiries });

  useEffect(() => {
    const supabase = createBrowserSupabase();
    const channel = supabase
      .channel("enquiries")
      .on("postgres_changes", { event: "*", schema: "public", table: "investor_enquiries" }, () => {
        void client.invalidateQueries({ queryKey: ["enquiries"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [client]);

  const mutate = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "contacted" | "closed" }) =>
      updateEnquiryStatus(id, status),
    onSuccess: () => client.invalidateQueries({ queryKey: ["enquiries"] }),
  });

  return { ...query, mutate };
}
