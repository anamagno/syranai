import { requirePageRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getEmployeeStats, listMessageGroups, listWorkPlanTasks } from "@/lib/queries/dashboard";
import { FadeIn } from "@/components/dashboard/FadeIn";
import { StatTiles } from "@/components/dashboard/StatTiles";
import { WorkPlanCard } from "@/components/dashboard/WorkPlanCard";
import { MessagesCard } from "@/components/dashboard/MessagesCard";
import { TaskNotificationsPanel } from "@/components/dashboard/TaskNotificationsPanel";

export const metadata = { title: "My Dashboard" };

export default async function EmployeeDashboardPage() {
  const me = await requirePageRole(["employee"]);
  const db = await createClient();

  const [workPlan, messages] = await Promise.all([
    listWorkPlanTasks(db, me),
    listMessageGroups(db, { kind: "staff", me, onlyTargeted: false }),
  ]);
  const s = await getEmployeeStats(db, me, workPlan);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <TaskNotificationsPanel me={{ id: me.id, role: me.role, department: me.department }} />

      <FadeIn y={-10}>
        <h1 className="text-3xl font-bold">Welcome back{me.name ? `, ${me.name}` : ""}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {s.activeOrders} active orders · You are currently working on {s.workingOnOrders} orders
        </p>
      </FadeIn>

      <StatTiles
        columns="grid-cols-1 sm:grid-cols-3"
        href="/work-plan"
        stats={[
          { label: "Pending", value: s.pending },
          { label: "In Progress", value: s.inProgress },
          { label: "Overdue", value: s.overdue },
        ]}
      />

      <FadeIn delay={0.2}>
        <WorkPlanCard tasks={workPlan} lang={me.system_language} emptyText="All tasks completed!" />
      </FadeIn>

      <FadeIn delay={0.2}>
        <MessagesCard title="My Messages" variant="employee"
          groups={messages.groups} unread={messages.unread} unreadToMe={messages.unreadToMe} />
      </FadeIn>
    </div>
  );
}
