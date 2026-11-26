import type { DB } from "./client-type";
import { fetchAll } from "./fetch-all";
import type { Profile } from "@/lib/auth/roles";

/* ------------------------------------------------------------------ */
/* Work plan (supervisor + employee)                                   */
/* ------------------------------------------------------------------ */

const WORK_TASK_SELECT = `
  id, order_id, title_pt, title_en, status, department, employee_id, due_date, pending_at, started_at,
  order:orders ( id, lote, priority, surgery_date, patient_name, product:products ( name ) )
`;

/** PostgREST "or" values with spaces/commas must be quoted. */
const q = (v: string) => `"${v.replace(/"/g, '\\"')}"`;

/**
 * Tasks for "My Work Plan".
 * - supervisor (old SupervisorDashboard): pending tasks of my department + my unfinished tasks
 * - employee (old EmployeeDashboard): my unfinished tasks + pending tasks of my department that are unassigned or mine
 */
export async function listWorkPlanTasks(db: DB, me: Profile) {
  const dept = me.department ?? "";
  const filter =
    me.role === "employee"
      ? `and(employee_id.eq.${me.id},status.neq.completed),and(department.eq.${q(dept)},status.eq.pending,employee_id.is.null)`
      : `and(employee_id.eq.${me.id},status.neq.completed),and(department.eq.${q(dept)},status.eq.pending)`;
  const tasks = await fetchAll((from, to) =>
    db.from("order_tasks").select(WORK_TASK_SELECT).or(filter).order("id").range(from, to),
  );
  return sortWorkPlan(tasks.filter((t) => t.order));
}
export type WorkPlanTask = Awaited<ReturnType<typeof listWorkPlanTasks>>[number];

/** Urgent orders first, then nearest surgery, then in-progress before pending, then nearest due date. */
function sortWorkPlan<T extends { status: string; due_date: string | null; order: { priority: string | null; surgery_date: string | null } | null }>(
  tasks: T[],
) {
  const score = (t: T) => [
    t.order?.priority === "urgent" ? 0 : 1,
    t.order?.surgery_date ? new Date(t.order.surgery_date).getTime() : Infinity,
    t.status === "in_progress" ? 0 : t.status === "pending" ? 1 : 2,
    t.due_date ? new Date(t.due_date).getTime() : Infinity,
  ];
  return [...tasks].sort((a, b) => {
    const A = score(a), B = score(b);
    for (let i = 0; i < A.length; i++) if (A[i] !== B[i]) return A[i] < B[i] ? -1 : 1;
    return 0;
  });
}

/* ------------------------------------------------------------------ */
/* Messages, grouped by order                                          */
/* ------------------------------------------------------------------ */

const MESSAGE_SELECT = `
  id, subject, body, sent_at, is_read, to_user_id, tagged_department, order_id, task_id,
  order:orders!inner ( id, lote, patient_name, doctor_id, distributor_id, status, product:products ( name ) ),
  task:order_tasks ( sequence_order )
`;

export type MessageGroup = {
  orderId: string;
  lote: string;
  productName: string | null;
  patientName: string | null;
  unread: number;
  messages: { id: string; subject: string; sentAt: string; isRead: boolean; toMe: boolean }[];
};

type Scope =
  | { kind: "staff"; me: Profile; onlyTargeted: boolean }
  | { kind: "doctor" | "distributor"; me: Profile };

/**
 * Old app: Message + TaskMessage (type "message") → now one `messages` table; task messages have task_id.
 * - supervisor: messages to me, to my department or to "all"
 * - employee: all messages (RLS decides what they can see); the ones aimed at them are highlighted
 * - doctor / distributor: messages on my active orders, sent to me or to my role
 */
export async function listMessageGroups(db: DB, scope: Scope, limit = 500) {
  const me = scope.me;
  let query = db.from("messages").select(MESSAGE_SELECT).eq("is_deleted", false);

  if (scope.kind === "staff") {
    if (scope.onlyTargeted) {
      query = query.or(`to_user_id.eq.${me.id},tagged_department.eq.${q(me.department ?? "")},tagged_department.eq.all`);
    }
  } else {
    query = query
      .or(`to_user_id.eq.${me.id},tagged_department.eq.${scope.kind}`)
      .eq(scope.kind === "doctor" ? "order.doctor_id" : "order.distributor_id", me.id);
    if (scope.kind === "doctor") query = query.not("order.status", "in", "(finished,cancelled)");
  }

  const { data, error } = await query.order("sent_at", { ascending: false }).limit(limit);
  if (error) throw error;

  const groups = new Map<string, MessageGroup>();
  let unread = 0, unreadToMe = 0;
  for (const m of data) {
    if (!m.order) continue;
    const toMe =
      m.to_user_id === me.id ||
      (scope.kind === "staff" && (m.tagged_department === me.department || m.tagged_department === "all"));
    const subject = m.task_id
      ? `Task ${m.task?.sequence_order ?? "?"}: ${m.subject ?? "Message"}`
      : m.subject || "Message";
    let g = groups.get(m.order.id);
    if (!g) {
      g = {
        orderId: m.order.id, lote: m.order.lote, productName: m.order.product?.name ?? null,
        patientName: m.order.patient_name, unread: 0, messages: [],
      };
      groups.set(m.order.id, g);
    }
    g.messages.push({ id: m.id, subject, sentAt: m.sent_at, isRead: m.is_read, toMe });
    if (!m.is_read) {
      g.unread++;
      unread++;
      if (toMe) unreadToMe++;
    }
  }
  // Map keeps insertion order = newest message first, as the old dashboards sorted the groups
  return { groups: [...groups.values()], unread, unreadToMe };
}

/* ------------------------------------------------------------------ */
/* Supervisor                                                          */
/* ------------------------------------------------------------------ */

export async function getSupervisorStats(db: DB) {
  const [orders, activeTasks, cancelledClosing, products, profiles, invites] = await Promise.all([
    fetchAll((from, to) =>
      db.from("orders")
        .select("id, status, payment, accessibility, product:products ( name )")
        .eq("is_old_order", false).order("id").range(from, to),
    ),
    fetchAll((from, to) =>
      db.from("order_tasks").select("order_id, phase, status").in("status", ["pending", "in_progress"]).order("id").range(from, to),
    ),
    fetchAll((from, to) =>
      db.from("order_tasks")
        .select("order_id, status, o:orders!inner ( status )")
        .eq("phase", "closing").eq("o.status", "cancelled").order("id").range(from, to),
    ),
    db.from("products").select("id", { count: "exact", head: true }),
    fetchAll((from, to) => db.from("profiles").select("role, status").order("id").range(from, to)),
    fetchAll((from, to) => db.from("invites").select("role, status").order("id").range(from, to)),
  ]);
  if (products.error) throw products.error;

  // Cancelled orders stay "cancelling" until all their closing tasks are done (same rule as the Orders page)
  const closingByOrder = new Map<string, string[]>();
  for (const t of cancelledClosing) closingByOrder.set(t.order_id, [...(closingByOrder.get(t.order_id) ?? []), t.status]);
  const fullyClosed = (o: { id: string; status: string }) => {
    if (o.status !== "cancelled") return false;
    const s = closingByOrder.get(o.id) ?? [];
    return s.every((x) => x === "completed");
  };

  const ongoing = orders.filter((o) => o.status !== "awaiting_terms" && o.status !== "finished" && !fullyClosed(o));
  const orderIds = new Set(orders.map((o) => o.id));
  const ongoingIds = new Set(ongoing.map((o) => o.id));

  // Old order.status values (designing, in_production, ...) are now the phase of the active tasks
  const phaseOrders = (phase: string) =>
    new Set(activeTasks.filter((t) => t.phase === phase && ongoingIds.has(t.order_id)).map((t) => t.order_id)).size;

  const byAccess = (a: string) => {
    const list = ongoing.filter((o) => o.accessibility === a);
    return { orders: list.length, products: new Set(list.map((o) => o.product?.name)).size };
  };

  const roleStats = (["doctor", "distributor", "employee"] as const).map((role) => ({
    label: `${role}s`,
    total: profiles.filter((p) => p.role === role).length,
    pendingInvites: invites.filter((i) => i.role === role && i.status === "pending").length,
    sentInvites: invites.filter((i) => i.role === role && i.status === "sent").length,
    pendingApproval: profiles.filter((p) => p.role === role && p.status === "pending").length,
  }));

  const tasksOfOrders = activeTasks.filter((t) => orderIds.has(t.order_id));
  return {
    totalOrders: orders.length,
    ongoing: ongoing.length,
    awaitingTerms: orders.filter((o) => o.status === "awaiting_terms").length,
    toPay: orders.filter((o) => o.payment === "to_pay" && o.status !== "cancelled" && o.status !== "finished" && o.accessibility !== "internal").length,
    designing: phaseOrders("designing"),
    inProduction: phaseOrders("production"),
    delivering: phaseOrders("delivery"),
    closing: phaseOrders("closing"),
    cancelling: orders.filter((o) => o.status === "cancelled" && !fullyClosed(o)).length,
    pendingTasks: tasksOfOrders.filter((t) => t.status === "pending").length,
    inProgressTasks: tasksOfOrders.filter((t) => t.status === "in_progress").length,
    internal: byAccess("internal"),
    private: byAccess("private"),
    external: byAccess("external"),
    totalProducts: products.count ?? 0,
    totalUsers: profiles.length,
    roleStats,
  };
}

/* ------------------------------------------------------------------ */
/* Employee                                                            */
/* ------------------------------------------------------------------ */

export async function getEmployeeStats(db: DB, me: Profile, workPlan: WorkPlanTask[]) {
  const dept = me.department ?? "";
  const [pending, deptOrders] = await Promise.all([
    db.from("order_tasks").select("id", { count: "exact", head: true }).eq("status", "pending").eq("department", dept),
    fetchAll((from, to) =>
      db.from("order_tasks")
        .select("order_id, o:orders!inner ( status )")
        .eq("department", dept).not("o.status", "in", "(finished,cancelled)").order("id").range(from, to),
    ),
  ]);
  if (pending.error) throw pending.error;
  const inProgress = workPlan.filter((t) => t.status === "in_progress" && t.employee_id === me.id);
  const now = Date.now();
  return {
    pending: pending.count ?? 0,
    inProgress: inProgress.length,
    overdue: inProgress.filter((t) => t.due_date && new Date(t.due_date).getTime() < now).length,
    activeOrders: new Set(deptOrders.map((t) => t.order_id)).size,
    workingOnOrders: new Set(inProgress.map((t) => t.order_id)).size,
  };
}

/* ------------------------------------------------------------------ */
/* Doctor / distributor                                                */
/* ------------------------------------------------------------------ */

const CLIENT_ORDER_SELECT = `
  id, lote, status, payment, delivery, accessibility, is_old_order, request_cancel, created_at,
  patient_name, jaw, porosity, breaking_line, restoration_area, shipping_address, product_id,
  product:products ( id, name, surgical_protocols, ifu_docs ),
  tasks:order_tasks ( id, phase, status, department )
`;

export async function listClientOrders(db: DB, me: Profile) {
  const column = me.role === "doctor" ? "doctor_id" : "distributor_id";
  // Build the query fresh for every page: supabase-js builders are mutable
  return fetchAll((from, to) => {
    let query = db.from("orders").select(CLIENT_ORDER_SELECT).eq(column, me.id);
    // Doctors only see their active orders on the dashboard; distributors see all assigned orders
    if (me.role === "doctor") query = query.not("status", "in", "(finished,cancelled)");
    return query.order("created_at", { ascending: false }).order("id").range(from, to);
  });
}
export type ClientOrder = Awaited<ReturnType<typeof listClientOrders>>[number];

/**
 * Featured products on the doctor/distributor dashboards.
 * The old app picked products by a "category" field that no longer exists.
 * Put product names here to choose them; empty = the first 4 active external products.
 */
export const FEATURED_PRODUCT_NAMES: string[] = [];

export async function listFeaturedProducts(db: DB) {
  let query = db.from("products").select("id, name, image_url").eq("is_active", true);
  query = FEATURED_PRODUCT_NAMES.length
    ? query.in("name", FEATURED_PRODUCT_NAMES)
    : query.eq("accessibility", "external").order("name");
  const { data, error } = await query.limit(4);
  if (error) throw error;
  return data;
}
export type FeaturedProduct = Awaited<ReturnType<typeof listFeaturedProducts>>[number];
