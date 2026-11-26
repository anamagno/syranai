import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkPlanTask } from "@/lib/queries/dashboard";
import { timeAgo } from "@/lib/format";

/** "My Work Plan" list (supervisor + employee dashboards). Server component: no client JS. */
export function WorkPlanCard({
  tasks, lang, emptyText, iconClass = "text-primary",
}: {
  tasks: WorkPlanTask[];
  lang: string;
  emptyText: string;
  iconClass?: string;
}) {
  return (
    <Card className="h-full hover:border-muted-foreground transition-colors">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className={`w-5 h-5 ${iconClass}`} /> My Work Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">{emptyText}</div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, i) => {
              const order = task.order!;
              const title = lang === "pt" ? task.title_pt : task.title_en || task.title_pt;
              return (
                <div key={task.id} className="relative flex gap-3 items-start p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  {/* whole row opens the task; the order line below is its own link */}
                  <Link href={`/orders/${task.order_id}?task=${task.id}`} className="absolute inset-0" aria-label={title ?? "Open task"} />
                  <div className="w-8 h-8 rounded-full border-2 border-primary/30 bg-primary/5 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{title}</p>
                      {order.priority === "urgent" && (
                        <span className="bg-red-500 mx-2 rounded-full w-2.5 h-2.5 inline-block flex-shrink-0" title="Urgent" />
                      )}
                      <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${task.status === "pending" ? "text-muted-foreground" : "text-primary"}`}>
                        {task.status === "pending" ? `Pending ${timeAgo(task.pending_at)}` : `Started ${timeAgo(task.started_at)}`}
                      </span>
                    </div>
                    <Link href={`/orders/${order.id}`} className="relative z-10 text-xs text-primary hover:underline inline-flex items-center gap-1">
                      Order: {order.lote}
                      {order.product?.name && ` · ${order.product.name}`}
                      {order.patient_name && ` · ${order.patient_name}`}
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
