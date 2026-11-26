import Link from "next/link";
import { ArrowRight, Truck } from "lucide-react";
import { requirePageRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { listClientOrders, listFeaturedProducts, listMessageGroups } from "@/lib/queries/dashboard";
import { progress } from "@/lib/orders/status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { FadeIn } from "@/components/dashboard/FadeIn";
import { StatTiles } from "@/components/dashboard/StatTiles";
import { MessagesCard } from "@/components/dashboard/MessagesCard";
import { FeaturedProductsCard } from "@/components/dashboard/FeaturedProductsCard";
import { DistributorOrderRow } from "@/components/dashboard/ClientOrderRow";
import { TaskNotificationsPanel } from "@/components/dashboard/TaskNotificationsPanel";

export const metadata = { title: "Dashboard" };

export default async function DistributorDashboardPage() {
  const me = await requirePageRole(["distributor"]);
  const db = await createClient();

  const [orders, products, messages] = await Promise.all([
    listClientOrders(db, me),
    listFeaturedProducts(db),
    listMessageGroups(db, { kind: "distributor", me }),
  ]);

  // The old page counted statuses that no longer exist; the phase of the active tasks replaces them
  const ordersIn = (phase: string) =>
    orders.filter((o) => o.status === "processing" && o.tasks.some((t) => t.phase === phase && (t.status === "pending" || t.status === "in_progress"))).length;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <TaskNotificationsPanel me={{ id: me.id, role: me.role, department: me.department }} />

      <FadeIn y={-10}>
        <h1 className="text-3xl font-bold">Welcome{me.name ? `, ${me.name}` : ""}</h1>
        <p className="text-muted-foreground mt-1">{orders.length} assigned orders</p>
      </FadeIn>

      <StatTiles
        small
        columns="grid-cols-1 sm:grid-cols-3"
        stats={[
          { label: "In Production", value: ordersIn("production") },
          { label: "Delivering", value: ordersIn("delivery") },
          { label: "Finished", value: orders.filter((o) => o.status === "finished").length },
        ]}
      />

      <FadeIn delay={0.2}>
        <MessagesCard title="My Messages" variant="client" groups={messages.groups} unread={messages.unread} />
      </FadeIn>

      <FadeIn delay={0.25}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" /> Assigned Orders
            </CardTitle>
            <Link href="/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Truck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No orders assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((o) => (
                  <DistributorOrderRow
                    key={o.id} id={o.id} lote={o.lote} patientName={o.patient_name} shippingAddress={o.shipping_address}
                    progress={progress(o.tasks).pct}
                    badge={<OrderStatusBadge order={o} tasks={o.tasks} variant="list" />}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.3}>
        <FeaturedProductsCard products={products} />
      </FadeIn>
    </div>
  );
}
