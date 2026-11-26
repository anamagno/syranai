import type { DB } from "./client-type";
import { fetchAll } from "./fetch-all";

/**
 * The old Base44 Order entity stored names directly on the order (product_name,
 * doctor_name, distributor_name, ordered_by_name...). In Supabase they come
 * from joins. The FK hint (!orders_doctor_id_fkey) is needed because orders
 * points to profiles more than once.
 */
const ORDER_LIST_SELECT = `
  id, lote, number, product_id, accessibility, status, payment, delivery, priority,
  patient_name, unregistered_doctor_name, client_company_name, client_doctor_name,
  jaw, restoration_area, porosity, breaking_line, is_old_order, is_integrated, is_test,
  created_at, cancelled_at, cancelled_by_id, doctor_id, distributor_id, ordered_by_id,
  product:products ( id, name ),
  doctor:profiles!orders_doctor_id_fkey ( id, name ),
  distributor:profiles!orders_distributor_id_fkey ( id, name ),
  ordered_by:profiles!orders_ordered_by_id_fkey ( id, name ),
  tasks:order_tasks ( id, title_pt, title_en, phase, status, department, sequence_order, duration_hours )
`;

export async function listOrdersWithTasks(db: DB) {
  return fetchAll((from, to) =>
    db.from("orders").select(ORDER_LIST_SELECT).order("created_at", { ascending: false }).range(from, to),
  );
}
export type OrderListItem = Awaited<ReturnType<typeof listOrdersWithTasks>>[number];
export type OrderListTask = OrderListItem["tasks"][number];

const ORDER_DETAIL_SELECT = `
  *,
  product:products ( * ),
  doctor:profiles!orders_doctor_id_fkey ( id, name, email, clinic_name, doctor_code, phone ),
  distributor:profiles!orders_distributor_id_fkey ( id, name, email, company_name ),
  ordered_by:profiles!orders_ordered_by_id_fkey ( id, name, email )
`;

export async function getOrder(db: DB, id: string) {
  const { data, error } = await db.from("orders").select(ORDER_DETAIL_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}
export type OrderDetail = NonNullable<Awaited<ReturnType<typeof getOrder>>>;
