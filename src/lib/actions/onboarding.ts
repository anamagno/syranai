"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";
import type { Role } from "@/lib/auth/roles";
import type { TablesInsert } from "@/types/database";

export type OnboardingInput = {
  name: string;
  role: Role;
  phone?: string;
  department?: string;
  doctor_code?: string;
  clinic_name?: string;
  company_name?: string;
  country?: string;
};

const formatName = (name: string) =>
  name.trim().split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

/**
 * Replaces the Base44 completeOnboarding function.
 * Security: the role comes from the invite when there is one, and status
 * "approved" is only given to invited users. The client can never make
 * itself a supervisor or approve itself.
 */
export async function completeOnboarding(input: OnboardingInput): Promise<{ error?: string }> {
  const { user } = await getSession();
  if (!user?.email) return { error: "Not signed in" };
  const admin = createAdminClient();

  const { data: invite } = await admin
    .from("invites").select("*").ilike("email", user.email).maybeSingle();

  const role: Role = invite?.role ?? input.role;
  if (!invite && role === "supervisor") return { error: "Supervisors must be invited" };
  if (!input.name?.trim()) return { error: "Name is required" };
  if (role === "employee" && !input.department) return { error: "Department is required" };
  if (role === "doctor" && !input.doctor_code) return { error: "Medical license number is required" };
  if (role === "distributor" && !input.country) return { error: "Country is required" };

  const row: TablesInsert<"profiles"> = {
    id: user.id,
    email: user.email,
    name: formatName(input.name),
    role,
    status: invite ? "approved" : "pending",
    phone: input.phone || null,
    is_old_user: invite?.is_old_user ?? false,
    is_integrated: true,
    department: role === "employee" ? input.department ?? null : null,
    doctor_code: role === "doctor" ? input.doctor_code ?? null : null,
    clinic_name: role === "doctor" ? input.clinic_name ?? null : null,
    distributor_id: role === "doctor" ? invite?.distributor_id ?? null : null,
    company_name: role === "distributor" ? input.company_name ?? null : null,
    country: role === "distributor" ? input.country ?? null : null,
  };

  const { error } = await admin.from("profiles").upsert(row, { onConflict: "id" });
  if (error) return { error: error.message };

  if (invite) {
    await admin.from("invites").update({ status: "used" }).eq("id", invite.id);
  }
  // TODO (notifications): email IT supervisors when a new doctor joins, as the old app did.

  redirect(invite ? "/" : "/pending-approval");
}
