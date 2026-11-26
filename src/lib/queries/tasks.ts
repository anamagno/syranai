import type { DB } from "./client-type";

const TASK_SELECT = `
  *,
  employee:profiles!order_tasks_employee_id_fkey ( id, name ),
  subtasks:order_task_subtasks ( * ),
  occurrence:order_occurrences ( id, type, repetition_motive, created_at )
`;

export async function listTasksForOrder(db: DB, orderId: string) {
  const { data, error } = await db
    .from("order_tasks").select(TASK_SELECT).eq("order_id", orderId).order("sequence_order");
  if (error) throw error;
  return data;
}
export type OrderTaskWithDetails = Awaited<ReturnType<typeof listTasksForOrder>>[number];
