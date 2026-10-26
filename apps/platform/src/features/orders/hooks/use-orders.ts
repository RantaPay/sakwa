"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { useRealtimeTable } from "@/lib/realtime";
import {
  listAllOrders,
  listCustomerOrders,
  placeOrder,
  setOrderPrice,
  setOrderStatus,
} from "../services/orders";

export function useCustomerOrders(customerId: string | undefined) {
  const client = useQueryClient();
  const queryKey = queryKeys.orders(customerId);
  const query = useQuery({
    queryKey,
    enabled: Boolean(customerId),
    queryFn: () => listCustomerOrders(customerId as string),
  });
  useRealtimeTable("orders", queryKey);

  const create = useMutation({
    mutationFn: placeOrder,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey });
      toast.success("Order placed.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return { ...query, create };
}

export function useAllOrders() {
  const client = useQueryClient();
  const queryKey = queryKeys.orders();
  const query = useQuery({ queryKey, queryFn: listAllOrders });
  useRealtimeTable("orders", queryKey);

  const price = useMutation({
    mutationFn: ({
      orderId,
      pricePerBagNaira,
      warehouseId,
    }: {
      orderId: string;
      pricePerBagNaira: number;
      warehouseId?: string;
    }) => setOrderPrice(orderId, pricePerBagNaira, warehouseId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey });
      toast.success("Price saved.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const status = useMutation({
    mutationFn: ({
      orderId,
      next,
    }: {
      orderId: string;
      next: "payment_recorded" | "payment_confirmed" | "dispatched" | "delivered";
    }) => setOrderStatus(orderId, next),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey });
      toast.success("Order updated.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return { ...query, price, status };
}
