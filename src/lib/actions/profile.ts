"use server";

import { revalidatePath } from "next/cache";
import type { TablesUpdate } from "@/types/database";
import { authorize, pick, run } from "./guard";

/** Columns a user may change on their own profile. role/status/is_admin/... are never in this list. */
const SELF_EDITABLE = ["name", "phone", "clinic_name", "company_name", "country", "billing_name",
  "billing_vat", "billing_address", "preferred_language", "system_language"] as const;

export async function updateMyProfile(patch: TablesUpdate<"profiles">) {
  return run(async () => {
    const { profile, admin } = await authorize();
    const safe = pick(patch, SELF_EDITABLE);
    const { error } = await admin.from("profiles").update(safe).eq("id", profile.id);
    if (error) throw error;
    revalidatePath("/", "layout");
  });
}

/** Supervisors approve / reject / edit other users (replaces completeOnboarding with userId). */
export async function updateUserProfile(userId: string, patch: TablesUpdate<"profiles">) {
  return run(async () => {
    const { admin } = await authorize({ roles: ["supervisor"] });
    const { id: _ignored, ...rest } = patch;
    const { error } = await admin.from("profiles").update(rest).eq("id", userId);
    if (error) throw error;
    revalidatePath("/users", "layout");
  });
}
