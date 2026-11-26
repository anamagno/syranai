import { requirePageRole } from "@/lib/auth/session";
import { NotPortedYet } from "@/components/layout/NotPortedYet";

export default async function Page() {
  await requirePageRole(["supervisor", "employee"]);
  return <NotPortedYet title="Distributors" oldFile="src/pages/UsersDistributors.jsx" />;
}
