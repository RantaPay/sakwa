"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { useRealtimeTable } from "@/lib/realtime";
import {
  decideWithdrawal,
  listWithdrawals,
  markWithdrawalPaid,
  requestWithdrawal,
} from "../services/withdrawals";

export function useWithdrawals(investorId?: string) {
  const client = useQueryClient();
  const queryKey = queryKeys.withdrawals(investorId);
  const query = useQuery({
    queryKey,
    queryFn: () => listWithdrawals(investorId),
  });
  useRealtimeTable("withdrawal_requests", queryKey);

  const request = useMutation({
    mutationFn: requestWithdrawal,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey });
      toast.success("Profit request sent.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const decide = useMutation({
    mutationFn: ({
      id,
      status,
      userId,
      reason,
    }: {
      id: string;
      status: "approved" | "rejected";
      userId: string;
      reason?: string;
    }) => decideWithdrawal(id, status, userId, reason),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.withdrawals() });
      toast.success("Request updated.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const paid = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      markWithdrawalPaid(id, userId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.withdrawals() });
      toast.success("Marked as paid.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return { ...query, request, decide, paid };
}
