import { requireApprovedProfile } from "@/lib/auth/session";
import { navFor } from "@/lib/auth/navigation";
import { AppShell } from "@/components/layout/AppShell";

/** Everything inside (app) requires a logged-in, onboarded and approved user. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireApprovedProfile();
  return (
    <AppShell
      nav={navFor(profile)}
      user={{ name: profile.name ?? profile.email, email: profile.email, role: profile.role, department: profile.department }}
    >
      {children}
    </AppShell>
  );
}
