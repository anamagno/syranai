import { requireApprovedProfile } from "@/lib/auth/session";
import { navFor } from "@/lib/auth/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";

/** Everything inside (app) requires a logged-in, onboarded and approved user. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireApprovedProfile();

  // Version shown in the sidebar footer; not critical, so an error just hides it
  const db = await createClient();
  const { data: settings } = await db.from("app_settings").select("current_version").limit(1).maybeSingle();

  return (
    <AppShell
      nav={navFor(profile)}
      version={settings?.current_version ?? null}
      user={{
        name: profile.name,
        email: profile.email,
        role: profile.role,
        department: profile.department,
        systemLanguage: profile.system_language,
      }}
    >
      {children}
    </AppShell>
  );
}
