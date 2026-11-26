"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "./AuthCard";
import { requestPasswordReset, signIn, signUp, updatePassword } from "@/lib/actions/auth";

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </Button>
  );
}

function Field({ name, label, type = "text", autoComplete }: { name: string; label: string; type?: string; autoComplete?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} autoComplete={autoComplete} required />
    </div>
  );
}

export function LoginForm({ next, linkError }: { next: string; linkError: boolean }) {
  const [state, action, pending] = useActionState(signIn, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {linkError && <p className="text-sm text-destructive">That link is invalid or has expired. Request a new one.</p>}
      <Field name="email" label="Email" type="email" autoComplete="email" />
      <Field name="password" label="Password" type="password" autoComplete="current-password" />
      <FormMessage state={state} />
      <Submit pending={pending}>Sign in</Submit>
      <div className="flex justify-between text-sm">
        <Link href="/forgot-password" className="text-primary hover:underline">First time here or forgot your password?</Link>
        <Link href="/signup" className="text-muted-foreground hover:underline">Create account</Link>
      </div>
    </form>
  );
}

export function SignupForm() {
  const [state, action, pending] = useActionState(signUp, undefined);
  return (
    <form action={action} className="space-y-4">
      <Field name="email" label="Email" type="email" autoComplete="email" />
      <Field name="password" label="Password" type="password" autoComplete="new-password" />
      <FormMessage state={state} />
      <Submit pending={pending}>Create account</Submit>
      <p className="text-sm text-center"><Link href="/login" className="text-primary hover:underline">Back to sign in</Link></p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);
  return (
    <form action={action} className="space-y-4">
      <Field name="email" label="Email" type="email" autoComplete="email" />
      <FormMessage state={state} />
      <Submit pending={pending}>Send me a link</Submit>
      <p className="text-sm text-center"><Link href="/login" className="text-primary hover:underline">Back to sign in</Link></p>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, undefined);
  return (
    <form action={action} className="space-y-4">
      <Field name="password" label="New password" type="password" autoComplete="new-password" />
      <Field name="confirm" label="Repeat new password" type="password" autoComplete="new-password" />
      <FormMessage state={state} />
      <Submit pending={pending}>Save password</Submit>
    </form>
  );
}
