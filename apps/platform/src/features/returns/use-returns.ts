"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { applyReturnCycle, listReturns } from "./returns";

export function useReturns(investorId?: string) {
  const client = useQueryClient();
  const queryKey = queryKeys.returns(investorId);
  const query = useQuery({
    queryKey,
    queryFn: () => listReturns(investorId),
  });

  const apply = useMutation({
    mutationFn: applyReturnCycle,
    onSuccess: (written) => {
      void client.invalidateQueries({ queryKey: queryKeys.returns() });
      if (written === 0) {
        toast.error("No investor has capital on the books, so no returns were written.");
        return;
      }
      toast.success(
        `Returns written for ${written} investor${written === 1 ? "" : "s"} this week.`,
      );
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return { ...query, apply };
}
