"use client";

import { useState, useTransition } from "react";
import { Loader2, Lock } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { completeOnboarding, type OnboardingInput } from "@/lib/actions/onboarding";
import type { Role } from "@/lib/auth/roles";

type Fields = Omit<OnboardingInput, "role">;
const SELF_SIGNUP_ROLES: Role[] = ["employee", "doctor", "distributor"];

const formatName = (name: string) =>
  name.trim().split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

export function OnboardingForm({
  email, invite, departments, initial,
}: {
  email: string;
  invite: { role: Role } | null;
  departments: string[];
  initial: Fields;
}) {
  const [form, setForm] = useState<Fields>(initial);
  const [role, setRole] = useState<Role | "">(invite?.role ?? "");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const canSave =
    !!role && !!form.name.trim() &&
    !(role === "employee" && !form.department) &&
    !(role === "doctor" && !form.doctor_code) &&
    !(role === "distributor" && !form.country);

  const save = () =>
    startTransition(async () => {
      if (!role) return;
      const res = await completeOnboarding({ ...form, name: formatName(form.name), role });
      if (res?.error) setError(res.error);
    });

  return (
    <AuthCard title="Welcome to BoneEasy" subtitle={`Complete your profile to get started (${email})`}>
      <div className="space-y-2">
        <Label>Name <span className="text-destructive">*</span></Label>
        <Input value={form.name} onChange={set("name")} onBlur={() => setForm((f) => ({ ...f, name: formatName(f.name) }))} placeholder="Type your name" />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          Your Role <span className="text-destructive">*</span>
          {invite && <span className="flex items-center gap-1 text-xs text-muted-foreground font-normal ml-1"><Lock className="w-3 h-3" /> assigned by owner</span>}
        </Label>
        {invite ? (
          <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-muted text-sm text-muted-foreground capitalize">
            <Lock className="w-3.5 h-3.5" /> {invite.role}
          </div>
        ) : (
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger><SelectValue placeholder="Select your role..." /></SelectTrigger>
            <SelectContent>
              {SELF_SIGNUP_ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {role === "employee" && (
        <div className="space-y-2">
          <Label>Department <span className="text-destructive">*</span></Label>
          <Select value={form.department} onValueChange={(v) => setForm((f) => ({ ...f, department: v }))}>
            <SelectTrigger><SelectValue placeholder="Select department..." /></SelectTrigger>
            <SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}

      {role === "doctor" && (
        <>
          <div className="space-y-2">
            <Label>Medical License Number <span className="text-destructive">*</span></Label>
            <Input value={form.doctor_code} onChange={set("doctor_code")} placeholder="DR-001" />
          </div>
          <div className="space-y-2">
            <Label>Clinic Name</Label>
            <Input value={form.clinic_name} onChange={set("clinic_name")} placeholder="City Medical Center" />
          </div>
        </>
      )}

      {role === "distributor" && (
        <>
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input value={form.company_name} onChange={set("company_name")} placeholder="MedTech Distributors" />
          </div>
          <div className="space-y-2">
            <Label>Country <span className="text-destructive">*</span></Label>
            <Input value={form.country} onChange={set("country")} placeholder="Portugal" />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label>Phone</Label>
        <Input value={form.phone} onChange={set("phone")} placeholder="+351 ..." />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button className="w-full mt-2" onClick={save} disabled={!canSave || pending}>
        {pending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {pending ? "Saving..." : "Complete Setup"}
      </Button>
    </AuthCard>
  );
}
