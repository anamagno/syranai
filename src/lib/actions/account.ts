"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authorize, run } from "./guard";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/auth/roles";
import type { TablesUpdate } from "@/types/database";

/**
 * Account page: what each role may change on their OWN profile.
 * The server only saves these columns, whatever the browser sends.
 * Email, role, status, is_admin, distributor, etc. can never be changed here.
 */
const EDITABLE_BY_ROLE: Record<Role, readonly string[]> = {
  supervisor: ["name", "phone", "department"],
  employee: ["name", "phone"], // department is shown but not editable
  doctor: ["name", "phone", "doctor_code", "clinic_name", "country", "billing_name", "billing_vat", "billing_address"],
  distributor: ["name", "phone", "company_name", "country", "billing_name", "billing_vat", "billing_address"],
};

export type AccountForm = Partial<Record<
  "name" | "phone" | "department" | "doctor_code" | "clinic_name" | "company_name" | "country" |
  "billing_name" | "billing_vat" | "billing_address",
  string
>>;

export async function saveMyAccount(form: AccountForm) {
  return run(async () => {
    const { profile, admin } = await authorize();
    const allowed = EDITABLE_BY_ROLE[profile.role];

    const patch: Record<string, string | null> = {};
    for (const key of allowed) {
      if (!(key in form)) continue;
      const v = (form[key as keyof AccountForm] ?? "").trim();
      patch[key] = v === "" ? null : v;
    }
    if (!patch.name) throw new Error("Full name is required");

    // Supervisors pick their department from the active departments only
    if ("department" in patch && patch.department) {
      const { data, error } = await admin.from("departments").select("name")
        .eq("name", patch.department).eq("is_active", true).maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("That department doesn't exist or is inactive");
    }

    const { error } = await admin.from("profiles").update(patch as TablesUpdate<"profiles">).eq("id", profile.id);
    if (error) throw error;
    revalidatePath("/", "layout"); // the sidebar shows the name too
  });
}

// Send request to delete account
export async function requestAccountDeletion() {
  const result = await run(async () => {
    const { profile, admin } = await authorize();
    // the user's account gets active=false and a pending status, until a supervisor or client support employee confirms the deletion
    const { error } = await admin.from("profiles")
      .update({ status: "pending", is_active: false })
      .eq("id", profile.id);
    if (error) throw error;

    // TODO: send notification to the supervisors (account deletion request from profile.id)
  });
  if (!result.ok) return result;

  // Log out: the account can no longer be used
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?deleted=1");
}
