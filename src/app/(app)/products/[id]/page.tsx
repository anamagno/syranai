import { requireApprovedProfile } from "@/lib/auth/session";
import { NotPortedYet } from "@/components/layout/NotPortedYet";

export default async function Page() {
  await requireApprovedProfile();
  return <NotPortedYet title="Product" oldFile="src/pages/ProductDetail.jsx" />;
}
