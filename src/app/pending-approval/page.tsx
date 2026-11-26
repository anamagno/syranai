import { redirect } from "next/navigation";
import { Clock, LogOut } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getUserState } from "@/lib/auth/roles";
import { signOut } from "@/lib/actions/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";

export default async function PendingApprovalPage() {
  const { user, profile } = await getSession();
  if (!user) redirect("/login");
  const state = getUserState(profile);
  if (state === "onboarding") redirect("/onboarding");
  if (state === "approved") redirect("/");

  return (
    <AuthCard title="Request Pending">
      <div className="text-center space-y-4 py-4">
        <div className="bg-sky-100 mx-auto rounded-full w-14 h-14 flex items-center justify-center">
          <Clock className="w-7 h-7 text-primary" />
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Your profile has been submitted and is waiting for approval.
          You&apos;ll receive an email once the owner reviews your request.
        </p>
        <form action={signOut}>
          <Button variant="outline" className="gap-2" type="submit"><LogOut className="w-4 h-4" /> Sign Out</Button>
        </form>
      </div>
    </AuthCard>
  );
}
