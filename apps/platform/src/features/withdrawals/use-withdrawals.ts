"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { useRealtimeTable } from "@/lib/realtime";
import {
  confirmWithdrawalReceived,
  decideWithdrawal,
  listWithdrawals,
  requestWithdrawal,
  uploadWithdrawalReceipt,
} from "./withdrawals";

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
      void client.invalidateQueries({ queryKey: ["positions"] });
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
      status: "accepted" | "rejected";
      userId: string;
      reason?: string;
    }) => decideWithdrawal(id, status, userId, reason),
    onSuccess: (_value, variables) => {
      void client.invalidateQueries({ queryKey: queryKeys.withdrawals() });
      toast.success(variables.status === "accepted" ? "Request accepted. Pay the investor, then upload the receipt." : "Request turned down.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const upload = useMutation({
    mutationFn: uploadWithdrawalReceipt,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.withdrawals() });
      toast.success("Receipt sent to the investor.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const received = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      confirmWithdrawalReceived(id, userId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.withdrawals() });
      void client.invalidateQueries({ queryKey: ["positions"] });
      toast.success("Profit marked as received.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return { ...query, request, decide, upload, received };
}
