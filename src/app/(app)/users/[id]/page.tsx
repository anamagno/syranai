import { requirePageRole } from "@/lib/auth/session";
import { NotPortedYet } from "@/components/layout/NotPortedYet";

export default async function Page() {
  await requirePageRole(["supervisor", "employee", "distributor"]);
  return <NotPortedYet title="User Profile" oldFile="src/pages/UserProfile.jsx" />;
}
