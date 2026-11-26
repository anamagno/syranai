import { AuthCard } from "@/components/auth/AuthCard";
import { SignupForm } from "@/components/auth/AuthForms";

export default function SignupPage() {
  return (
    <AuthCard title="Create your account" subtitle="You'll complete your profile next">
      <SignupForm />
    </AuthCard>
  );
}
