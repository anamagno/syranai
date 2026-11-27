import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/AuthForms";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; deleted?: string }>;
}) {
  const { next, error, deleted } = await searchParams;
  return (
    <AuthCard title="Welcome to BoneEasy" subtitle="Sign in to continue">
      {deleted && (
        <p className="mb-4 rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
          Your request to delete your account was sent. You have been logged out.
        </p>
      )}
      <LoginForm next={next ?? "/"} linkError={error === "link"} />
    </AuthCard>
  );
}
