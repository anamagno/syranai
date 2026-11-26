import { requirePageRole } from "@/lib/auth/session";
import { NotPortedYet } from "@/components/layout/NotPortedYet";

export default async function Page() {
  await requirePageRole(["supervisor", "employee"]);
  return <NotPortedYet title="Work Plan" oldFile="src/pages/WorkTimelines.jsx" />;
}
