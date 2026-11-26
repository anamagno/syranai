import Link from "next/link";
import { ArrowRight, ListOrdered, PlusCircle } from "lucide-react";
import { requirePageRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { listClientOrders, listFeaturedProducts, listMessageGroups, type ClientOrder } from "@/lib/queries/dashboard";
import { progress } from "@/lib/orders/status";
import type { Json } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/dashboard/FadeIn";
import { StatTiles } from "@/components/dashboard/StatTiles";
import { MessagesCard } from "@/components/dashboard/MessagesCard";
import { FeaturedProductsCard } from "@/components/dashboard/FeaturedProductsCard";
import { DoctorOrderRow, type DoctorOrderView } from "@/components/dashboard/ClientOrderRow";
import { TaskNotificationsPanel } from "@/components/dashboard/TaskNotificationsPanel";

export const metadata = { title: "Dashboard" };

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  awaiting_terms: { label: "Approve Terms", className: "bg-destructive/5 text-destructive border-destructive/30" },
  to_pay: { label: "To Pay", className: "bg-[#FFFFCC] text-[#80350E] border-yellow-300" },
  approve_design: { label: "Approve Design", className: "bg-destructive/5 text-destructive border-destructive/30" },
  closing: { label: "Closing Order", className: "bg-transparent text-muted-foreground border-border" },
  surgery: { label: "In surgery", className: "bg-background text-primary border-primary" },
  cancel_request: { label: "Waiting Cancellation", className: "bg-[#FFFFCC] text-[#80350E] border-yellow-300" },
};
const DEFAULT_BADGE = { label: "click to view progress", className: "bg-transparent text-muted-foreground border-border" };

/** Tasks the doctor has to act on (design approval) are the ones of department "doctor". */
const isDoctorAction = (t: ClientOrder["tasks"][number]) =>
  t.department === "doctor" && (t.status === "pending" || t.status === "in_progress");

/** surgical_protocols / ifu_docs are { "en": url, "pt": url, ... } */
function docUrl(docs: Json | null | undefined, lang: string): string | null {
  if (!docs || typeof docs !== "object" || Array.isArray(docs)) return null;
  const d = docs as Record<string, unknown>;
  const url = d[lang] ?? d.en;
  return typeof url === "string" && url ? url : null;
}

function restorationType(area: Json | null): string {
  if (!area || typeof area !== "object" || Array.isArray(area)) return "";
  const t = (area as Record<string, unknown>).type;
  return typeof t === "string" ? t : "";
}

function toView(o: ClientOrder, lang: string): DoctorOrderView {
  const status =
    o.status === "awaiting_terms" ? "awaiting_terms"
    : o.request_cancel && o.status !== "cancelled" ? "cancel_request"
    : o.tasks.some(isDoctorAction) ? "approve_design"
    : o.payment === "to_pay" ? "to_pay"
    : o.tasks.some((t) => t.phase === "closing" && t.status !== "none") ? "closing"
    : o.delivery === "received" ? "surgery"
    : null;

  const type = restorationType(o.restoration_area);
  const typeLabel = type === "upper_all" || type === "lower_all" ? "TOTAL" : type.toUpperCase();
  const details = [
    `Patient: ${o.patient_name || "—"} · Type: ${typeLabel}`,
    o.jaw && `, ${o.jaw} jaw`,
    o.porosity && `, POROSITY ${o.porosity}mm`,
    o.breaking_line && ", BKL",
  ].filter(Boolean).join("");

  return {
    id: o.id,
    title: `${o.lote} - ${o.product?.name ?? ""}`,
    details,
    progress: progress(o.tasks).pct,
    badge: (status && STATUS_CONFIG[status]) || DEFAULT_BADGE,
    protocolUrl: status === "surgery" ? docUrl(o.product?.surgical_protocols, lang) : null,
    ifuUrl: status === "surgery" ? docUrl(o.product?.ifu_docs, lang) : null,
  };
}

export default async function DoctorDashboardPage() {
  const me = await requirePageRole(["doctor"]);
  const db = await createClient();
  const lang = me.preferred_language ?? "en";

  const [orders, products, messages] = await Promise.all([
    listClientOrders(db, me),
    listFeaturedProducts(db),
    listMessageGroups(db, { kind: "doctor", me }),
  ]);

  const ordersWith = (phase: string) =>
    orders.filter((o) => o.tasks.some((t) => t.phase === phase && t.status !== "none")).length;
  const toApprove =
    orders.reduce((n, o) => n + o.tasks.filter(isDoctorAction).length, 0) +
    orders.filter((o) => o.status === "awaiting_terms").length;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <TaskNotificationsPanel me={{ id: me.id, role: me.role, department: me.department }} />

      <FadeIn y={-10} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome{me.name ? `, Dr. ${me.name}` : ""}</h1>
          <p className="text-muted-foreground mt-1">{orders.length} total orders</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/orders/new"><PlusCircle className="w-4 h-4" />New Order</Link>
        </Button>
      </FadeIn>

      <StatTiles
        small
        columns="grid-cols-2 sm:grid-cols-4"
        stats={[
          { label: "To Pay", value: orders.filter((o) => o.payment === "to_pay").length },
          { label: "To Approve by You", value: toApprove },
          { label: "In Production", value: ordersWith("production") },
          { label: "Delivering", value: ordersWith("delivery") },
        ]}
      />

      <FadeIn delay={0.2}>
        <MessagesCard title="My Messages" variant="client" groups={messages.groups} unread={messages.unread} />
      </FadeIn>

      <FadeIn delay={0.3}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-primary" /> Ongoing Orders
            </CardTitle>
            <Link href="/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-center py-8 text-xs text-muted-foreground">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((o) => <DoctorOrderRow key={o.id} o={toView(o, lang)} />)}
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
