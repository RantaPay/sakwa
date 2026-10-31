"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useRealtimeTable } from "@/lib/realtime";
import { useAuthUser } from "@/lib/use-auth-user";
import { listNotifications, markRead } from "./notifications";

export function useNotifications() {
  const { data: user } = useAuthUser();
  const client = useQueryClient();
  const queryKey = queryKeys.notifications(user?.id ?? "none");
  const query = useQuery({
    queryKey,
    enabled: Boolean(user?.id),
    queryFn: () => listNotifications(user?.id as string),
  });
  useRealtimeTable("notifications", queryKey);

  const read = useMutation({
    mutationFn: markRead,
    onSuccess: () => client.invalidateQueries({ queryKey }),
  });

  return { ...query, read };
}
