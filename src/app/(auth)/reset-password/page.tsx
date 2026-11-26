import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/AuthForms";

/** Reached from the email link (session already set by /auth/callback or /auth/confirm). */
export default async function ResetPasswordPage() {
  const { user } = await getSession();
  if (!user) redirect("/login?error=link");
  return (
    <AuthCard title="Choose a password" subtitle={user.email}>
      <ResetPasswordForm />
    </AuthCard>
  );
}
