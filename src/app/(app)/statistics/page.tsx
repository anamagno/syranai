import { requirePageRole } from "@/lib/auth/session";
import { NotPortedYet } from "@/components/layout/NotPortedYet";

export default async function Page() {
  await requirePageRole(["supervisor"]);
  return <NotPortedYet title="Statistics" oldFile="src/pages/Statistics.jsx" />;
}
