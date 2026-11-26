import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getUserState } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { listDepartments } from "@/lib/queries/profiles";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export default async function OnboardingPage() {
  const { user, profile } = await getSession();
  if (!user) redirect("/login");
  const state = getUserState(profile);
  if (state === "approved") redirect("/");
  if (state === "pending") redirect("/pending-approval");

  // Read with the service client: a brand-new user has no profile yet, so RLS would hide these.
  const admin = createAdminClient();
  const [{ data: invite }, departments] = await Promise.all([
    admin.from("invites").select("role, name, phone, doctor_code, clinic_name, country, company_name")
      .ilike("email", user.email ?? "").maybeSingle(),
    listDepartments(admin),
  ]);

  return (
    <OnboardingForm
      email={user.email ?? ""}
      invite={invite}
      departments={departments}
      initial={{
        name: profile?.name ?? invite?.name ?? "",
        phone: profile?.phone ?? invite?.phone ?? "",
        department: profile?.department ?? "",
        doctor_code: profile?.doctor_code ?? invite?.doctor_code ?? "",
        clinic_name: profile?.clinic_name ?? invite?.clinic_name ?? "",
        company_name: profile?.company_name ?? invite?.company_name ?? "",
        country: profile?.country ?? invite?.country ?? "",
      }}
    />
  );
}
