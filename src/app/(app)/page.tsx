import { redirect } from "next/navigation";
import { requireApprovedProfile } from "@/lib/auth/session";
import { dashboardPath } from "@/lib/auth/roles";

export default async function Home() {
  const profile = await requireApprovedProfile();
  redirect(dashboardPath(profile.role));
}
