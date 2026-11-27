import { requirePageRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "@/components/settings/SettingsView";

export const metadata = { title: "System Settings" };

/** Supervisors can see this page; only admins (is_admin) can change anything. */
export default async function SystemSettingsPage() {
  const me = await requirePageRole(["supervisor"]);
  const db = await createClient();

  const [departments, stations, settings, languages, version] = await Promise.all([
    db.from("departments").select("id, name, is_active").order("sort_order").order("name"),
    db.from("stations").select("id, name, phase, is_active").order("sequence_order"),
    db.from("app_settings").select("occurrences, satisfaction_form_url, google_review_url, current_version").limit(1).maybeSingle(),
    db.rpc("system_languages"),
    db.from("app_versions").select("version, title, released_at").eq("is_current", true).limit(1).maybeSingle(),
  ]);
  for (const r of [departments, stations, settings, version]) if (r.error) throw r.error;

  return (
    <SettingsView
      canEdit={me.is_admin}
      departments={departments.data ?? []}
      stations={stations.data ?? []}
      occurrences={settings.data?.occurrences ?? []}
      // if the language function isn't installed yet, show the list as empty instead of failing
      languages={languages.error ? [] : (languages.data ?? [])}
      links={{
        satisfactionFormUrl: settings.data?.satisfaction_form_url ?? "",
        googleReviewUrl: settings.data?.google_review_url ?? "",
      }}
      currentVersion={version.data ?? null}
    />
  );
}
