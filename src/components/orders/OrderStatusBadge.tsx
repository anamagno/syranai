import { Badge } from "@/components/ui/badge";
import type { Enums } from "@/types/database";
import { activePhases, type PhaseKey } from "@/lib/orders/status";

const STATUS_CONFIG: Record<PhaseKey | "awaiting" | "finished" | "to_pay" | "cancelled" | "old_order", { label: string; className: string }> = {
  awaiting: { label: "Awaiting Terms", className: "bg-background text-primary border-primary" },
  ordering: { label: "Ordering", className: "bg-blue-50 text-[#215F9A] border-blue-300" },
  designing: { label: "Designing", className: "bg-[#E7F7E1] text-[#3B7D23] border-[#9ED08A]" },
  delivering: { label: "Delivering", className: "bg-purple-50 text-[#7030A0] border-purple-300" },
  in_production: { label: "In Production", className: "bg-[#E8F2F4] text-[#417D87] border-[#8DC0C9]" },
  closing: { label: "Closing", className: "bg-[#FDF3ED] text-amber-700 border-[#E19E71]" },
  finished: { label: "Finished", className: "bg-[#DCEAF7] text-green-800 border-green-800" },
  to_pay: { label: "To Pay", className: "bg-[#FFFFCC] text-[#80350E] border-yellow-300" },
  cancelled: { label: "Cancelled", className: "bg-destructive/5 text-destructive border-destructive/30" },
  old_order: { label: "Old Order", className: "bg-slate-700 text-white border-slate-800" },
};

type OrderLike = {
  status: Enums<"order_status">;
  payment: Enums<"payment"> | null;
  accessibility: Enums<"accessibility">;
  is_old_order: boolean;
};
type TaskLike = { phase: Enums<"order_phase"> | null; status: Enums<"task_status"> };

function B({ k, suffix }: { k: keyof typeof STATUS_CONFIG; suffix?: string }) {
  const c = STATUS_CONFIG[k];
  return <Badge variant="outline" className={`${c.className} border font-medium`}>{c.label}{suffix}</Badge>;
}

export function OrderStatusBadge({
  order, tasks = [], variant, fullyClosed = false,
}: { order: OrderLike; tasks?: TaskLike[]; variant: "list" | "details"; fullyClosed?: boolean }) {
  const toPay = order.payment === "to_pay" && order.accessibility !== "internal";

  if (order.is_old_order) return <B k="old_order" suffix={` - ${order.status}`} />;
  if (order.status === "cancelled") {
    return (
      <div className="flex gap-1 flex-wrap">
        <B k="cancelled" />
        {!fullyClosed && variant !== "details" && <B k="closing" />}
      </div>
    );
  }
  if (order.status === "awaiting_terms") return <B k="awaiting" />;
  if (variant === "details") return toPay ? <B k="to_pay" /> : null;

  const phases = order.status === "finished" ? [] : activePhases(tasks);
  return (
    <div className="flex gap-1 flex-wrap">
      {order.status === "finished" && <B k="finished" />}
      {phases.map((p) => <B key={p} k={p} />)}
      {toPay && <B k="to_pay" />}
    </div>
  );
}
