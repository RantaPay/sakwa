"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { useRealtimeTable } from "@/lib/realtime";
import { getPosition, listInvestments, recordInvestment } from "./investments";

export function useInvestments(investorId?: string) {
  const client = useQueryClient();
  const queryKey = queryKeys.investments(investorId);
  const query = useQuery({
    queryKey,
    queryFn: () => listInvestments(investorId),
  });
  useRealtimeTable("investments", queryKey);

  const create = useMutation({
    mutationFn: recordInvestment,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["investments"] });
      void client.invalidateQueries({ queryKey: ["positions"] });
      toast.success("Capital has been written in.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return { ...query, create };
}

export function usePosition(investorId: string | undefined) {
  const queryKey = queryKeys.positions(investorId);
  const query = useQuery({
    queryKey,
    enabled: Boolean(investorId),
    queryFn: () => getPosition(investorId as string),
  });
  useRealtimeTable("investments", queryKey);
  useRealtimeTable("investor_returns", queryKey);
  useRealtimeTable("withdrawal_requests", queryKey);
  return query;
}
