import type { DB } from "./client-type";
import type { Role } from "@/lib/auth/roles";

/** Replaces the getAllUsers / getDoctorUsers / getEmployeeUsers / getSupervisorUsers functions. */
export async function listProfiles(db: DB, role?: Role) {
  let q = db.from("profiles").select("*").order("name");
  if (role) q = q.eq("role", role);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function profileNames(db: DB, ids: string[]) {
  if (!ids.length) return new Map<string, string>();
  const { data, error } = await db.from("profiles").select("id, name").in("id", ids);
  if (error) throw error;
  return new Map(data.map((p) => [p.id, p.name ?? ""]));
}

export async function listDepartments(db: DB) {
  const { data, error } = await db.from("departments").select("name").eq("is_active", true).order("sort_order");
  if (error) throw error;
  return data.map((d) => d.name);
}
