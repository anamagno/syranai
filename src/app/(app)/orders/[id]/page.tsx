import { notFound } from "next/navigation";
import { requireApprovedProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getOrder } from "@/lib/queries/orders";
import { listTasksForOrder } from "@/lib/queries/tasks";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { NotPortedYet } from "@/components/layout/NotPortedYet";

/**
 * Server-side read example: data is loaded on the server with the user's
 * session (RLS applies), so a doctor opening someone else's order gets 404.
 * The full page (src/pages/OrderDetail.jsx, 2,400 lines) is ported next.
 */
export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireApprovedProfile();
  const { id } = await params;
  const supabase = await createClient();
  const order = await getOrder(supabase, id);
  if (!order) notFound();
  const tasks = await listTasksForOrder(supabase, id);

  return (
    <div>
      <div className="p-6 md:p-8 max-w-4xl mx-auto pb-0">
        <p className="text-xs text-slate-500">Order #{order.number}</p>
        <h1 className="text-2xl font-bold flex flex-wrap items-center gap-3">
          {order.lote} - {order.product?.name}
          <OrderStatusBadge order={order} tasks={tasks} variant="details" />
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {order.patient_name && <>Patient: {order.patient_name} · </>}
          {order.doctor?.name && <>Doctor: {order.doctor.name} · </>}
          {tasks.length} tasks
        </p>
      </div>
      <NotPortedYet title="Order details" oldFile="src/pages/OrderDetail.jsx" />
    </div>
  );
}
