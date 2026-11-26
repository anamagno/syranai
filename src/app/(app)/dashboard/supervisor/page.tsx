import Link from "next/link";
import { ChevronRight, Clock, Package, ShoppingBag } from "lucide-react";
import { requirePageRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getSupervisorStats, listMessageGroups, listWorkPlanTasks } from "@/lib/queries/dashboard";
import { plural } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/dashboard/FadeIn";
import { WorkPlanCard } from "@/components/dashboard/WorkPlanCard";
import { MessagesCard } from "@/components/dashboard/MessagesCard";
import { UsersMenuCard } from "@/components/dashboard/UsersMenuCard";
import { TaskNotificationsPanel } from "@/components/dashboard/TaskNotificationsPanel";

export const metadata = { title: "Dashboard" };

/** Clickable summary card (Orders, Work Timelines, Products). */
function NavCard({
  href, color, icon, title, subtitle, lines, footer,
}: {
  href: string; color: string; icon: React.ReactNode; title: string; subtitle: string; lines: string[]; footer: string;
}) {
  return (
    <Link href={href} className="block h-full">
      <Card className="h-full transition-colors group hover:border-[var(--c)]" style={{ ["--c" as string]: color }}>
        <CardHeader className="pb-1">
          <CardTitle className="flex items-center gap-2">
            <span style={{ color }}>{icon}</span> {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground mt-2 mb-3 transition-colors group-hover:text-[var(--c)]">{subtitle}</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            {lines.map((l) => <p key={l}>{l}</p>)}
          </div>
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color }}>{footer}</span>
            <ChevronRight size={14} style={{ color }} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/** Only the lines with a non-zero count, as in the old dashboard. */
const lines = (items: [number, string][]) => items.filter(([n]) => n > 0).map(([, text]) => text);

export default async function SupervisorDashboardPage() {
  const me = await requirePageRole(["supervisor"]);
  const db = await createClient();

  const [s, workPlan, messages] = await Promise.all([
    getSupervisorStats(db),
    listWorkPlanTasks(db, me),
    listMessageGroups(db, { kind: "staff", me, onlyTargeted: true }),
  ]);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-5">
      <TaskNotificationsPanel me={{ id: me.id, role: me.role, department: me.department }} />

      <FadeIn y={-8}>
        <h1 className="text-2xl font-semibold text-foreground">Welcome back{me.name ? `, ${me.name}` : ""}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Supervisor · Full system access</p>
      </FadeIn>

      <FadeIn y={12}>
        <WorkPlanCard tasks={workPlan} lang={me.system_language} emptyText="No active tasks assigned to you." iconClass="text-slate-500" />
      </FadeIn>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FadeIn y={12} delay={0.06}>
          <NavCard
            href="/orders" color="#0ea5e9" icon={<ShoppingBag className="w-5 h-5" />} title="Orders" subtitle="View and edit all orders"
            lines={lines([
              [s.awaitingTerms, `${plural(s.awaitingTerms, "order")} waiting terms approval`],
              [s.toPay, `${plural(s.toPay, "order")} waiting payment`],
              [s.ongoing, `${plural(s.ongoing, "ongoing order")}`],
              [s.designing, `${plural(s.designing, "order")} in designing`],
              [s.inProduction, `${plural(s.inProduction, "order")} in production`],
              [s.delivering, `${plural(s.delivering, "order")} delivering`],
              [s.closing, `${plural(s.closing, "order")} closing`],
              [s.cancelling, `${plural(s.cancelling, "order")} cancelling`],
            ])}
            footer={`${s.totalOrders} total orders`}
          />
        </FadeIn>

        <FadeIn y={12} delay={0.12}>
          <NavCard
            href="/work-plan" color="#8b5cf6" icon={<Clock className="w-5 h-5" />} title="Work Timelines" subtitle="View and manage the task timelines"
            lines={lines([
              [s.designing, `${plural(s.designing, "order")} in designing`],
              [s.inProduction, `${plural(s.inProduction, "order")} in production`],
              [s.closing, `${plural(s.closing, "order")} closing`],
              [s.pendingTasks, `${plural(s.pendingTasks, "task")} pending`],
              [s.inProgressTasks, `${plural(s.inProgressTasks, "task")} in progress`],
            ])}
            footer={`${s.ongoing} ongoing orders`}
          />
        </FadeIn>

        <FadeIn y={12} delay={0.18} className="sm:col-span-2">
          <MessagesCard title="Messages" subtitle="Order messages and notifications" variant="supervisor"
            groups={messages.groups} unread={messages.unread} />
        </FadeIn>

        <FadeIn y={12} delay={0.24}>
          <NavCard
            href="/products" color="#10b981" icon={<Package className="w-5 h-5" />} title="Products" subtitle="View and edit products and the task timelines"
            lines={lines([
              [s.internal.orders, `${plural(s.internal.products, "internal product")} in ${plural(s.internal.orders, "order")}`],
              [s.private.orders, `${plural(s.private.products, "private product")} in ${plural(s.private.orders, "order")}`],
              [s.external.orders, `${plural(s.external.products, "external product")} in ${plural(s.external.orders, "order")}`],
            ])}
            footer={`${s.totalProducts} products`}
          />
        </FadeIn>

        <FadeIn y={12} delay={0.3}>
          <UsersMenuCard roleStats={s.roleStats} totalUsers={s.totalUsers} />
        </FadeIn>
      </div>
    </div>
  );
}
