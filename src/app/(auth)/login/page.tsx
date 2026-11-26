import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/AuthForms";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <AuthCard title="Welcome to BoneEasy" subtitle="Sign in to continue">
      <LoginForm next={next ?? "/"} linkError={error === "link"} />
    </AuthCard>
  );
}
