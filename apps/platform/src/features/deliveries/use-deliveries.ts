"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { useRealtimeTable } from "@/lib/realtime";
import {
  decideDelivery,
  listAgentDeliveries,
  listWarehouseDeliveries,
  recordDelivery,
} from "./deliveries";

export function useAgentDeliveries(agentId: string | undefined) {
  const client = useQueryClient();
  const queryKey = queryKeys.deliveries(agentId);
  const query = useQuery({
    queryKey,
    enabled: Boolean(agentId),
    queryFn: () => listAgentDeliveries(agentId as string),
  });
  useRealtimeTable("agent_deliveries", queryKey);

  const create = useMutation({
    mutationFn: recordDelivery,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey });
      void client.invalidateQueries({ queryKey: ["agent-balance"] });
      toast.success("Delivery recorded successfully.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return { ...query, create };
}

export function useWarehouseDeliveries() {
  const client = useQueryClient();
  const queryKey = queryKeys.deliveries();
  const query = useQuery({
    queryKey,
    queryFn: listWarehouseDeliveries,
  });
  useRealtimeTable("agent_deliveries", queryKey);

  const decide = useMutation({
    mutationFn: decideDelivery,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey });
      void client.invalidateQueries({ queryKey: queryKeys.stock });
      void client.invalidateQueries({ queryKey: queryKeys.agentBalances });
      void client.invalidateQueries({ queryKey: ["agent-balance"] });
      toast.success("Delivery updated.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return { ...query, decide };
}
