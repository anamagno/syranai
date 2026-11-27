"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Loader2, Save, Trash2, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RoleBadge } from "@/components/users/RoleBadge";
import { requestAccountDeletion, saveMyAccount, type AccountForm } from "@/lib/actions/account";

type Me = {
  name: string | null; email: string; role: string; phone: string | null; department: string | null;
  doctor_code: string | null; clinic_name: string | null; company_name: string | null; country: string | null;
  billing_name: string | null; billing_vat: string | null; billing_address: string | null;
};

// Editable form fields per role (the server saves only these columns too lib/actions/account.ts
function initialForm(me: Me): AccountForm {
  const v = (x: string | null) => x ?? "";
  const base = { name: v(me.name), phone: v(me.phone) };
  const billing = { billing_name: v(me.billing_name), billing_vat: v(me.billing_vat), billing_address: v(me.billing_address) };
  if (me.role === "doctor") return { ...base, doctor_code: v(me.doctor_code), clinic_name: v(me.clinic_name), country: v(me.country), ...billing };
  if (me.role === "distributor") return { ...base, company_name: v(me.company_name), country: v(me.country), ...billing };
  if (me.role === "supervisor") return { ...base, department: v(me.department) };
  return base;
}

function Field({ label, value, onChange, placeholder, className }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

export function AccountView({ me, departments, distributorName }: {
  me: Me; departments: string[]; distributorName: string | null;
}) {
  const [form, setForm] = useState<AccountForm>(() => initialForm(me));
  const [saving, startSave] = useTransition();
  const [deleting, startDelete] = useTransition();
  const set = (key: keyof AccountForm) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const save = () =>
    startSave(async () => {
      const r = await saveMyAccount(form);
      if (r.ok) toast.success("Profile updated");
      else toast.error(r.error);
    });

  const requestDelete = () =>
    startDelete(async () => {
      // on success the server logs the user out and redirects to /login
      const r = await requestAccountDeletion();
      if (r && !r.ok) toast.error(r.error);
    });

  const hasBilling = me.role === "doctor" || me.role === "distributor";

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <UserCircle className="w-8 h-8 text-primary" /> Account
        </h1>
        <p className="text-muted-foreground mt-1">Manage your profile settings</p>
      </motion.div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
              {(me.name || me.email || "?")[0].toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-semibold">{me.name || "User"}</p>
              <p className="text-muted-foreground">{me.email}</p>
              <div className="mt-1"><RoleBadge role={me.role} /></div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Everyone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" value={form.name ?? ""} onChange={set("name")} placeholder="Your full name" />
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={me.email} disabled className="bg-muted/40" />
            </div>
            <Field label="Phone" value={form.phone ?? ""} onChange={set("phone")} placeholder="+1 234 567 890" />
          </div>

          {/* Doctor */}
          {me.role === "doctor" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
              <Field label="Medical License Number" value={form.doctor_code ?? ""} onChange={set("doctor_code")} placeholder="DR-001" />
              <Field label="Clinic Name" value={form.clinic_name ?? ""} onChange={set("clinic_name")} placeholder="City Medical Center" />
              <Field label="Country" value={form.country ?? ""} onChange={set("country")} placeholder="Portugal" />
              <div className="space-y-2">
                <Label>Distributor</Label>
                <Input value={distributorName ?? "No distributor assigned yet."} disabled className="bg-muted/40" />
              </div>
            </div>
          )}

          {/* Distributor */}
          {me.role === "distributor" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
              <Field label="Company Name" value={form.company_name ?? ""} onChange={set("company_name")} placeholder="MedTech Distributors" />
              <Field label="Country" value={form.country ?? ""} onChange={set("country")} placeholder="United States" />
            </div>
          )}

          {/* Billing (doctor + distributor) */}
          {hasBilling && (
            <div className="pt-4 border-t border-border space-y-4">
              <p className="text-sm font-medium">Billing Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Billing Name" value={form.billing_name ?? ""} onChange={set("billing_name")} placeholder="Name or company on the invoice" />
                <Field label="VAT Number" value={form.billing_vat ?? ""} onChange={set("billing_vat")} placeholder="PT123456789" />
                <Field label="Billing Address" value={form.billing_address ?? ""} onChange={set("billing_address")}
                  placeholder="Street, postal code, city" className="sm:col-span-2" />
              </div>
            </div>
          )}

          {/* Supervisor: editable department */}
          {me.role === "supervisor" && (
            <div className="pt-4 border-t border-border space-y-2">
              <Label>Department</Label>
              <Select value={form.department || undefined} onValueChange={set("department")}>
                <SelectTrigger><SelectValue placeholder="Select your department..." /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Employee: department shown, not editable */}
          {me.role === "employee" && (
            <div className="pt-4 border-t border-border space-y-2">
              <Label>Department</Label>
              <Input value={me.department ?? "No department assigned"} disabled className="bg-muted/40" />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete account request */}
      <div className="flex justify-end pt-2 pb-6">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="outline" disabled={deleting}
              className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5">
              <Trash2 className="w-4 h-4 mr-1" />Send request to delete account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                Your account will be blocked right away and you will be logged out. A supervisor will then delete it.
                You will lose all access to the app.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={requestDelete} disabled={deleting}
                className="bg-destructive text-white hover:bg-destructive/90">
                {deleting ? "Sending..." : "Yes, send request"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
