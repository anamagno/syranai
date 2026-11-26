import type { DB } from "./client-type";

export async function listProducts(db: DB, { activeOnly = false } = {}) {
  let q = db.from("products").select("*").order("name");
  if (activeOnly) q = q.eq("is_active", true);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

/** A product's workflow with the task templates and their subtasks. */
export async function getProductWorkflow(db: DB, productId: string) {
  const { data, error } = await db
    .from("product_workflows")
    .select(`*, template:task_templates ( *, subtasks:subtask_templates ( * ) )`)
    .eq("product_id", productId)
    .order("sequence_order");
  if (error) throw error;
  return data;
}
