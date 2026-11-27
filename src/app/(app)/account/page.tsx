import { requireApprovedProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AccountView } from "@/components/account/AccountView";

export const metadata = { title: "Account" };

/** Every user sees and edits only their own profile. */
export default async function AccountPage() {
  const me = await requireApprovedProfile();

  // Department list: only supervisors can choose one
  let departments: string[] = [];
  if (me.role === "supervisor") {
    const db = await createClient();
    const { data } = await db.from("departments").select("name").eq("is_active", true).order("sort_order").order("name");
    departments = (data ?? []).map((d) => d.name);
  }

  // Doctor's distributor: only the name is read, on the server
  // (a doctor can't read other profiles, so this uses the server key for this one field)
  let distributorName: string | null = null;
  if (me.role === "doctor" && me.distributor_id) {
    const { data } = await createAdminClient().from("profiles")
      .select("name, company_name").eq("id", me.distributor_id).maybeSingle();
    distributorName = data?.name || data?.company_name || null;
  }

  return (
    <AccountView
      me={{
        name: me.name, email: me.email, role: me.role, phone: me.phone, department: me.department,
        doctor_code: me.doctor_code, clinic_name: me.clinic_name, company_name: me.company_name, country: me.country,
        billing_name: me.billing_name, billing_vat: me.billing_vat, billing_address: me.billing_address,
      }}
      departments={departments}
      distributorName={distributorName}
    />
  );
}
