"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { useRealtimeTable } from "@/lib/realtime";
import { listAdvances, recordAdvance } from "./advances";

export function useAdvances(agentId?: string) {
  const client = useQueryClient();
  const queryKey = queryKeys.advances(agentId);
  const query = useQuery({
    queryKey,
    queryFn: () => listAdvances(agentId),
  });
  useRealtimeTable("agent_cash_advances", queryKey);

  const create = useMutation({
    mutationFn: recordAdvance,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey });
      void client.invalidateQueries({ queryKey: queryKeys.agentBalances });
      void client.invalidateQueries({ queryKey: ["agent-balance"] });
      toast.success("Cash given has been written in.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return { ...query, create };
}
