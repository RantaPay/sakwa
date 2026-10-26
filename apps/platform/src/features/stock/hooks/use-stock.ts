"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { useRealtimeTable } from "@/lib/realtime";
import { listMovements, listStock, releaseStock } from "../services/stock";

export function useStock() {
  const query = useQuery({ queryKey: queryKeys.stock, queryFn: listStock });
  useRealtimeTable("stock_movements", queryKeys.stock);
  return query;
}

export function useMovements(warehouseId?: string) {
  const queryKey = queryKeys.movements(warehouseId);
  const query = useQuery({
    queryKey,
    queryFn: () => listMovements(warehouseId),
  });
  useRealtimeTable("stock_movements", queryKey);
  return query;
}

export function useReleaseStock() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: releaseStock,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.stock });
      void client.invalidateQueries({ queryKey: queryKeys.orders() });
      toast.success("Bags released.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
