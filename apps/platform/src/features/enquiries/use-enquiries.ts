"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listEnquiries, updateEnquiryStatus } from "./enquiries";

// Live updates come from RealtimeSync in the dashboard layout.
export function useEnquiries() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["enquiries"], queryFn: listEnquiries });

  const mutate = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "contacted" | "closed" }) =>
      updateEnquiryStatus(id, status),
    onSuccess: (_data, { status }) => {
      toast.success(status === "closed" ? "Enquiry closed." : "Marked as contacted.");
      return client.invalidateQueries({ queryKey: ["enquiries"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return { ...query, mutate };
}
