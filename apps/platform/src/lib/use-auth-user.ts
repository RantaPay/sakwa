"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { queryKeys } from "@/lib/query-keys";

export function useAuthUser() {
  return useQuery({
    queryKey: queryKeys.auth,
    queryFn: async () => {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    },
  });
}
