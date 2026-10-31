"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { useRealtimeTable } from "@/lib/realtime";
import {
  confirmInvestmentPayment,
  decideInvestmentRequest,
  listInvestmentRequests,
  requestInvestment,
  uploadInvestmentReceipt,
} from "./requests";

export function useInvestmentRequests(investorId?: string) {
  const client = useQueryClient();
  const queryKey = queryKeys.investmentRequests(investorId);
  const query = useQuery({
    queryKey,
    queryFn: () => listInvestmentRequests(investorId),
  });
  useRealtimeTable("investment_requests", queryKey);

  const request = useMutation({
    mutationFn: requestInvestment,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["investment-requests"] });
      toast.success("Investment request sent to the director.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const decide = useMutation({
    mutationFn: decideInvestmentRequest,
    onSuccess: (_value, variables) => {
      void client.invalidateQueries({ queryKey: ["investment-requests"] });
      toast.success(
        variables.status === "accepted"
          ? "Account details sent to the investor."
          : "Request turned down.",
      );
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const upload = useMutation({
    mutationFn: uploadInvestmentReceipt,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["investment-requests"] });
      toast.success("Receipt sent to the director.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const confirm = useMutation({
    mutationFn: confirmInvestmentPayment,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["investment-requests"] });
      void client.invalidateQueries({ queryKey: ["investments"] });
      void client.invalidateQueries({ queryKey: ["positions"] });
      toast.success("Payment confirmed. The investment is on the books.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return { ...query, request, decide, upload, confirm };
}
