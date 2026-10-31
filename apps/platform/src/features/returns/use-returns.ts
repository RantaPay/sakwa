"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { useRealtimeTable } from "@/lib/realtime";
import { applyReturnCycle, listReturns } from "./returns";

export function useReturns(investorId?: string) {
  const client = useQueryClient();
  const queryKey = queryKeys.returns(investorId);
  const query = useQuery({
    queryKey,
    queryFn: () => listReturns(investorId),
  });
  useRealtimeTable("investor_returns", queryKey);

  const apply = useMutation({
    mutationFn: applyReturnCycle,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.returns() });
      toast.success("Return rows were written for this week.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return { ...query, apply };
}
