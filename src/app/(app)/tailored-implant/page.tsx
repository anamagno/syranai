import { requireApprovedProfile } from "@/lib/auth/session";
import { NotPortedYet } from "@/components/layout/NotPortedYet";

export default async function Page() {
  await requireApprovedProfile();
  return <NotPortedYet title="Tailored Implant™" oldFile="src/pages/TailoredImplant.jsx" />;
}
