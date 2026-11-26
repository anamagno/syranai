import { requireApprovedProfile } from "@/lib/auth/session";
import { hasSupervisorPermissions } from "@/lib/auth/roles";
import { OrdersList } from "@/components/orders/OrdersList";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const profile = await requireApprovedProfile();
  const { status } = await searchParams;
  return (
    <OrdersList
      initialTab={status ?? "all"}
      role={profile.role}
      canSeeWaiting={hasSupervisorPermissions(profile)}
    />
  );
}
