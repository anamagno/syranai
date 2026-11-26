"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowDownUp, ChevronRight, Search, ShoppingBag, TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { listOrdersWithTasks, type OrderListItem } from "@/lib/queries/orders";
import { profileNames } from "@/lib/queries/profiles";
import { activePhases, isFullyClosed, progress, PHASE_KEYS } from "@/lib/orders/status";
import type { Role } from "@/lib/auth/roles";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { SegmentedProgressBar } from "./SegmentedProgressBar";

const TABS = ["all", "awaiting_terms", "to_pay", ...PHASE_KEYS, "finished", "cancelled"] as const;
type Tab = (typeof TABS)[number];
const TAB_LABEL: Record<Tab, string> = {
  all: "All", awaiting_terms: "Waiting", to_pay: "To Pay", ordering: "Ordering", designing: "Designing",
  in_production: "In Production", delivering: "Delivering", closing: "Closing", finished: "Finished", cancelled: "Cancelled",
};
type Sort = "date_desc" | "date_asc" | "progress_desc" | "progress_asc";
type Urgency = "all" | "urgent" | "non-urgent";
const PAGE_SIZE = 20;

function matchesTab(o: OrderListItem, tab: Tab) {
  switch (tab) {
    case "all": return true;
    case "awaiting_terms": return o.status === "awaiting_terms";
    case "finished": return o.status === "finished";
    case "cancelled": return o.status === "cancelled";
    case "to_pay": return o.payment === "to_pay" && o.status !== "cancelled" && o.accessibility !== "internal" && !o.is_old_order;
    default: return activePhases(o.tasks).includes(tab);
  }
}

function orderTypeLabel(o: OrderListItem) {
  const area = o.restoration_area as { type?: string } | null;
  const t = area?.type ?? "";
  if (!t) return "";
  return t === "upper_all" || t === "lower_all" ? ", TOTAL" : `, ${t.toUpperCase()}`;
}

export function OrdersList({ initialTab, role, canSeeWaiting }: { initialTab: string; role: Role; canSeeWaiting: boolean }) {
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<Tab>((TABS as readonly string[]).includes(initialTab) ? (initialTab as Tab) : "all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<Sort>("date_desc");
  const [urgency, setUrgency] = useState<Urgency>("all");
  const [page, setPage] = useState(1);

  // RLS already limits doctors/distributors to their own orders.
  const { data: allOrders = [], isLoading } = useQuery({
    queryKey: ["orders", "list"],
    queryFn: () => listOrdersWithTasks(supabase),
    refetchInterval: 15_000,
  });

  const cancelledByIds = useMemo(
    () => [...new Set(allOrders.map((o) => o.cancelled_by_id).filter((x): x is string => !!x))],
    [allOrders],
  );
  const { data: cancelledBy = new Map<string, string>() } = useQuery({
    queryKey: ["profiles", "names", cancelledByIds],
    queryFn: () => profileNames(supabase, cancelledByIds),
    enabled: cancelledByIds.length > 0,
  });

  const orders = useMemo(
    () => allOrders.filter((o) => o.is_integrated && !(role === "employee" && o.is_test)),
    [allOrders, role],
  );
  const existsWaiting = orders.some((o) => o.status === "awaiting_terms");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter((o) => {
      const matchSearch = !q || [o.lote, o.product?.name, o.patient_name, o.doctor?.name, o.unregistered_doctor_name, o.distributor?.name]
        .some((v) => (v ?? "").toLowerCase().includes(q));
      const matchUrgency = urgency === "all" || (urgency === "urgent" ? o.priority === "urgent" : o.priority !== "urgent");
      return matchesTab(o, tab) && matchSearch && matchUrgency;
    });
  }, [orders, tab, search, urgency]);

  useEffect(() => setPage(1), [tab, search, urgency]);

  const sorted = useMemo(() => {
    const s = [...filtered];
    const time = (o: OrderListItem) => new Date(o.created_at).getTime();
    switch (sortBy) {
      case "date_asc": return s.sort((a, b) => time(a) - time(b));
      case "date_desc": return s.sort((a, b) => time(b) - time(a));
      case "progress_asc": return s.sort((a, b) => progress(a.tasks).pct - progress(b.tasks).pct);
      case "progress_desc": return s.sort((a, b) => progress(b.tasks).pct - progress(a.tasks).pct);
    }
  }, [filtered, sortBy]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-3"><ShoppingBag className="w-8 h-8 text-primary" /> Orders</h1>
        <p className="text-muted-foreground mt-1">{filtered.length} orders</p>
      </motion.div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {TABS.filter((t) => t !== "awaiting_terms" || (canSeeWaiting && existsWaiting)).map((t) => (
            <TabsTrigger key={t} value={t}>{TAB_LABEL[t]}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <div className="relative w-72">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search orders, products, names..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 !text-xs" />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as Sort)}>
          <SelectTrigger className="w-auto h-8 text-xs gap-1 text-slate-500">
            <ArrowDownUp className="w-3 h-3" /><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">Date (newest)</SelectItem>
            <SelectItem value="date_asc">Date (oldest)</SelectItem>
            <SelectItem value="progress_desc">Progress (highest)</SelectItem>
            <SelectItem value="progress_asc">Progress (lowest)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={urgency} onValueChange={(v) => setUrgency(v as Urgency)}>
          <SelectTrigger className="w-auto h-8 text-xs gap-1 text-slate-500">
            <TriangleAlert className="w-3 h-3" /><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All orders</SelectItem>
            <SelectItem value="urgent">Urgent orders</SelectItem>
            <SelectItem value="non-urgent">Non-urgent orders</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">No orders found.</Card>
      ) : (
        <div className="space-y-3">
          {paginated.map((order, i) => (
            <OrderRow key={order.id} order={order} index={i} cancelledByName={order.cancelled_by_id ? cancelledBy.get(order.cancelled_by_id) : undefined} />
          ))}
        </div>
      )}

      {totalPages > 1 && <Pagination page={page} total={totalPages} onChange={setPage} />}
    </div>
  );
}

function OrderRow({ order, index, cancelledByName }: { order: OrderListItem; index: number; cancelledByName?: string }) {
  const { pct, done, total } = progress(order.tasks);
  const awaiting = order.status === "awaiting_terms";
  const finished = order.status === "finished";
  const closed = isFullyClosed(order, order.tasks);
  const href = `/orders/${order.id}`;
  const clientName = order.client_company_name;
  const internal = !order.doctor && !clientName && !order.unregistered_doctor_name && order.accessibility !== "external";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Link href={href} className="block">
        <Card className={`p-5 ${awaiting ? "bg-primary/10" : closed ? "bg-destructive/5" : finished ? "bg-background" : ""} hover:shadow-md transition-shadow`}>
          <div className="text-slate-500 mb-2 text-xs">
            Order #{order.number}
            {order.jaw && ` - ${order.jaw} jaw`}
            {orderTypeLabel(order)}
            {order.porosity != null && `, POROSITY ${order.porosity}mm`}
            {order.breaking_line && ", BKL"}
          </div>
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-foreground">{order.lote} - {order.product?.name}</span>
              <OrderStatusBadge order={order} tasks={order.tasks} variant="list" fullyClosed={closed} />
              {order.priority === "urgent" && order.status !== "cancelled" &&
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" title="Urgent" />}
            </div>
            <span className="flex items-center gap-1 text-primary text-sm font-medium whitespace-nowrap">
              View Details <ChevronRight className="w-4 h-4" />
            </span>
          </div>
          <p className="text-muted-foreground my-3 text-sm">
            {order.patient_name && <>Patient: <b className="text-foreground font-medium">{order.patient_name}</b></>}
            {order.doctor?.name && <> · Doctor: <b className="text-foreground font-medium">{order.doctor.name}</b></>}
            {clientName && <> · Client: <b className="text-foreground font-medium">{clientName}</b></>}
            {order.unregistered_doctor_name && <> · Doctor: <b className="text-foreground font-medium">{order.unregistered_doctor_name}</b></>}
            {order.distributor?.name && <> · Distributor: <b className="text-foreground font-medium">{order.distributor.name}</b></>}
            {internal && <> Internal </>}
            {order.ordered_by?.name && <> · Ordered by: <b className="text-foreground font-medium">{order.ordered_by.name}</b></>}
            {order.status === "cancelled" && <> · Cancelled by: <b className="text-foreground font-medium">{cancelledByName || "—"}</b></>}
          </p>
          {!closed && !order.is_old_order && !awaiting && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>Completion</span><span>{done}/{total} tasks · {pct}%</span>
              </div>
              <SegmentedProgressBar tasks={order.tasks} cancelled={order.status === "cancelled"} />
            </div>
          )}
        </Card>
      </Link>
    </motion.div>
  );
}

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const items = Array.from({ length: total }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === total || Math.abs(p - page) <= 1)
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);
  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button className="px-3 py-1.5 text-xs rounded-lg disabled:opacity-40 hover:bg-gray-50" onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}>⯇</button>
      {items.map((it, i) => it === "..." ? (
        <span key={`e${i}`} className="px-2 text-xs text-muted-foreground">…</span>
      ) : (
        <button key={it} onClick={() => onChange(it)}
          className={`px-3 py-1.5 text-xs border rounded-lg ${page === it ? "bg-gray-100 font-bold border-foreground" : "hover:bg-gray-50"}`}>{it}</button>
      ))}
      <button className="px-3 py-1.5 text-xs rounded-lg disabled:opacity-40 hover:bg-gray-50" onClick={() => onChange(Math.min(total, page + 1))} disabled={page === total}>⯈</button>
    </div>
  );
}
