import Link from "next/link";
import { Button } from "@/components/ui/button";

const DASHBOARD: Record<string, string> = {
  supervisor: "/dashboard/supervisor",
  employee: "/dashboard/employee",
  doctor: "/dashboard/doctor",
  distributor: "/dashboard/distributor",
};

/** "You have no access to this page" screen (old pages showed this inline). */
export function NoAccess({ role }: { role: string }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 text-center text-muted-foreground">
        <p className="font-bold">You have no access to this page.</p>
        <Button variant="outline" asChild>
          <Link href={DASHBOARD[role] ?? "/"}>Go to Dashboard</Link>
        </Button>
        <p className="text-xs mt-14">To request access, please send us a support ticket.</p>
      </div>
    </div>
  );
}
