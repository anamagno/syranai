import type { Tables } from "@/types/database";

export type Profile = Tables<"profiles">;
export type Role = Profile["role"];

export const ROLES: Role[] = ["supervisor", "employee", "doctor", "distributor"];

/** Departments with supervisor-like rights in parts of the app (from the old app). */
export const SUPERVISOR_LIKE_DEPARTMENTS = ["Sales and Client Support", "Quality"];
export const PRODUCTION_DEPARTMENTS = ["Quality Control", "Production", "Logistics", "Chemical Production"];

export type UserState = "onboarding" | "pending" | "approved";

/** Same rules as the old AuthContext.isProfileComplete. */
export function isProfileComplete(p: Profile | null): boolean {
  if (!p || !p.name) return false;
  if (p.role === "employee" && !p.department) return false;
  if (p.role === "doctor" && !p.doctor_code) return false;
  if (p.role === "distributor" && !p.country) return false;
  return true;
}

export function getUserState(p: Profile | null): UserState {
  if (!isProfileComplete(p)) return "onboarding";
  return p!.status === "approved" ? "approved" : "pending";
}

export function isStaff(p: Pick<Profile, "role">) {
  return p.role === "supervisor" || p.role === "employee";
}

/** "Supervisor permissions" as the old Orders page defined them. */
export function hasSupervisorPermissions(p: Pick<Profile, "role" | "department">) {
  return p.role === "supervisor" || SUPERVISOR_LIKE_DEPARTMENTS.includes(p.department ?? "");
}

export function dashboardPath(role: Role) {
  return `/dashboard/${role}`;
}
