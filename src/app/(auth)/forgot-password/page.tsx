import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/AuthForms";

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Set or reset your password" subtitle="We'll email you a link">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
