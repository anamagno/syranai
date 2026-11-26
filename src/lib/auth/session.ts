import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserState, type Profile, type Role } from "./roles";

/** Logged-in auth user + their profile row (null if not created yet). Cached per request. */
export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null as Profile | null };

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return { user, profile };
});

/** For pages inside the app: must be logged in, onboarded and approved. */
export async function requireApprovedProfile(): Promise<Profile> {
  const { user, profile } = await getSession();
  if (!user) redirect("/login");
  const state = getUserState(profile);
  if (state === "onboarding") redirect("/onboarding");
  if (state === "pending") redirect("/pending-approval");
  return profile!;
}

/** For pages restricted to some roles (e.g. supervisor-only pages). */
export async function requirePageRole(roles: Role[]): Promise<Profile> {
  const profile = await requireApprovedProfile();
  if (!roles.includes(profile.role)) redirect("/");
  return profile;
}
