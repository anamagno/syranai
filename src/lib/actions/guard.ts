import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";
import { getUserState, type Profile, type Role } from "@/lib/auth/roles";

/**
 * Every write in the app goes through a server action, and every server action
 * starts with authorize(). RLS has no INSERT/UPDATE/DELETE policies, so the
 * browser can't write directly; the service-role client used here can, which
 * is why the permission check below is mandatory.
 */

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string };

export class ForbiddenError extends Error {}

type Rule = {
  roles?: Role[];
  departments?: string[]; // employee departments allowed (supervisors always pass)
  check?: (p: Profile) => boolean;
};

export async function authorize(rule: Rule = {}) {
  const { user, profile } = await getSession();
  if (!user || !profile || getUserState(profile) !== "approved") throw new ForbiddenError("Not signed in");
  if (rule.roles && !rule.roles.includes(profile.role)) throw new ForbiddenError("Not allowed for your role");
  if (rule.departments && profile.role === "employee" && !rule.departments.includes(profile.department ?? "")) {
    throw new ForbiddenError("Not allowed for your department");
  }
  if (rule.check && !rule.check(profile)) throw new ForbiddenError("Not allowed");
  return { profile, admin: createAdminClient() };
}

/** Wraps an action body so it always returns ActionResult instead of throwing to the client. */
export async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    if (e instanceof ForbiddenError) return { ok: false, error: e.message };
    console.error(e);
    return { ok: false, error: e instanceof Error ? e.message : "Unexpected error" };
  }
}

/** Keep only the allowed keys of a patch (so a client can't sneak in other columns). */
export function pick<T extends object>(patch: T, allowed: readonly (keyof T)[]): Partial<T> {
  const out: Partial<T> = {};
  for (const k of allowed) if (k in patch) out[k] = patch[k];
  return out;
}
