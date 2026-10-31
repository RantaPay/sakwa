import { Badge } from "./badge";

const MAP: Record<string, { tone: "green" | "gold" | "stone" | "warning" | "danger"; label: string }> =
  {
    pending: { tone: "warning", label: "Waiting" },
    confirmed: { tone: "green", label: "Confirmed" },
    rejected: { tone: "danger", label: "Turned down" },
    placed: { tone: "stone", label: "Placed" },
    payment_recorded: { tone: "warning", label: "Payment written in" },
    payment_confirmed: { tone: "green", label: "Payment confirmed" },
    dispatched: { tone: "gold", label: "On the way" },
    delivered: { tone: "green", label: "Delivered" },
    requested: { tone: "warning", label: "Requested" },
    accepted: { tone: "gold", label: "Accepted" },
    receipt_sent: { tone: "warning", label: "Receipt in" },
    approved: { tone: "green", label: "Approved" },
    paid: { tone: "green", label: "Paid" },
    new: { tone: "gold", label: "New" },
    contacted: { tone: "green", label: "Contacted" },
    closed: { tone: "stone", label: "Closed" },
    incoming: { tone: "green", label: "In" },
    outgoing: { tone: "warning", label: "Out" },
  };

export function StatusBadge({ status }: { status: string }) {
  const mapped = MAP[status] ?? { tone: "stone" as const, label: status };
  return <Badge tone={mapped.tone}>{mapped.label}</Badge>;
}
