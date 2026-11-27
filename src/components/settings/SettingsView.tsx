"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Check, CheckCircle2, Briefcase, Lock, Pencil, Plus, RotateCcw, Settings, ShieldCheck, Stethoscope, Truck, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ActionResult } from "@/lib/actions/guard";
import {
  addDepartment, addOccurrence, addStation, releaseVersion, removeOccurrence, renameDepartment, renameOccurrence,
  renameStation, saveLinks, setDepartmentActive, setStationActive, setStationPhase,
} from "@/lib/actions/settings";

type Department = { id: string; name: string; is_active: boolean };
type Station = { id: string; name: string; phase: string | null; is_active: boolean | null };

const PHASES = ["ordering", "designing", "production", "delivery", "closing"] as const;
const phaseLabel = (p: string | null) => (p ? p[0].toUpperCase() + p.slice(1) : "No phase");

/** Runs a server action and shows the result as a toast. */
function useAction() {
  const [pending, start] = useTransition();
  const exec = (fn: () => Promise<ActionResult<unknown>>, success: string, after?: () => void) =>
    start(async () => {
      const r = await fn();
      if (r.ok) {
        toast.success(success);
        after?.();
      } else toast.error(r.error);
    });
  return { pending, exec };
}

/* ------------------------------------------------------------------ */
/* One chip: name, optional rename (pencil), remove (X)                */
/* ------------------------------------------------------------------ */

function Chip({
  label, canEdit, pending, onRename, onRemove, children,
}: {
  label: string;
  canEdit: boolean;
  pending: boolean;
  onRename?: (newName: string) => void;
  onRemove?: () => void;
  children?: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(label);

  if (editing) {
    const save = () => {
      if (value.trim() && value.trim() !== label) onRename?.(value);
      setEditing(false);
    };
    return (
      <div className="flex items-center gap-1 bg-secondary px-2 py-0.5 rounded-full">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") { setValue(label); setEditing(false); }
          }}
          className="bg-transparent text-sm outline-none w-40"
        />
        <button onClick={save} className="text-muted-foreground hover:text-primary" title="Save"><Check className="w-3.5 h-3.5" /></button>
        <button onClick={() => { setValue(label); setEditing(false); }} className="text-muted-foreground hover:text-destructive" title="Cancel">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
      {label}
      {children}
      {canEdit && onRename && (
        <button disabled={pending} onClick={() => setEditing(true)} className="ml-1 text-muted-foreground hover:text-primary" title="Rename">
          <Pencil className="w-3 h-3" />
        </button>
      )}
      {canEdit && onRemove && (
        <button disabled={pending} onClick={onRemove} className="ml-0.5 text-muted-foreground hover:text-destructive" title="Remove">
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

/** Deactivated departments/stations, hidden behind a toggle, with a "reactivate" button. */
function InactiveList({ items, canEdit, pending, onReactivate }: {
  items: { id: string; name: string }[]; canEdit: boolean; pending: boolean; onReactivate: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  if (!items.length) return null;
  return (
    <div className="text-xs">
      <button onClick={() => setOpen((v) => !v)} className="text-muted-foreground hover:text-foreground">
        {open ? "Hide" : "Show"} {items.length} inactive
      </button>
      {open && (
        <div className="flex flex-wrap gap-2 mt-2">
          {items.map((i) => (
            <div key={i.id} className="flex items-center gap-1 border border-dashed border-border text-muted-foreground px-3 py-1 rounded-full text-sm">
              {i.name}
              {canEdit && (
                <button disabled={pending} onClick={() => onReactivate(i.id)} className="ml-1 hover:text-primary" title="Reactivate">
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddRow({ placeholder, pending, onAdd, extra, compact = false }: {
  placeholder: string; pending: boolean; onAdd: (v: string, reset: () => void) => void; extra?: React.ReactNode; compact?: boolean;
}) {
  const [value, setValue] = useState("");
  const add = () => value.trim() && onAdd(value, () => setValue(""));
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}
        placeholder={placeholder} disabled={pending}
        className={compact ? "h-8 max-w-56 text-sm md:text-sm" : "max-w-xs"} />
      {extra}
      <Button variant="outline" size="sm" onClick={add} disabled={pending || !value.trim()}
        className={compact ? "h-8 px-2.5 text-xs" : ""}>
        <Plus className={compact ? "w-3.5 h-3.5 mr-1" : "w-4 h-4 mr-1"} />Add
      </Button>
    </div>
  );
}

/** Phase dropdown (your UI Select). Radix can't use "" as a value, so "none" stands for no phase. */
function PhaseSelect({ value, onChange, disabled, className = "w-36" }: {
  value: string | null; onChange: (phase: string | null) => void; disabled?: boolean; className?: string;
}) {
  return (
    <Select value={value ?? "none"} onValueChange={(v) => onChange(v === "none" ? null : v)} disabled={disabled}>
      <SelectTrigger title="Phase" className={`${className} ${value ? "" : "text-muted-foreground"}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none" className="text-muted-foreground">No phase</SelectItem>
        {PHASES.map((p) => <SelectItem key={p} value={p}>{phaseLabel(p)}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

/** One station per line: name phase  rename  remove. */
function StationRow({ station, canEdit, pending, onRename, onPhase, onRemove }: {
  station: Station;
  canEdit: boolean;
  pending: boolean;
  onRename: (newName: string) => void;
  onPhase: (phase: string | null) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(station.name);
  const cancel = () => { setValue(station.name); setEditing(false); };
  const save = () => {
    if (value.trim() && value.trim() !== station.name) onRename(value);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-2 py-2">
      <div className="flex-1 min-w-0">
        {editing ? (
          <Input autoFocus value={value} onChange={(e) => setValue(e.target.value)} className="h-7 text-sm md:text-sm"
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }} />
        ) : (
          <span className="text-sm truncate">{station.name}</span>
        )}
      </div>

      {canEdit ? (
        <PhaseSelect value={station.phase} disabled={pending || editing} onChange={onPhase}
          className="!h-6 w-24 gap-1 px-1.5 text-[11px] [&_svg]:size-3" />
      ) : (
        <span className={`w-24 text-[11px] ${station.phase ? "" : "text-muted-foreground"}`}>{phaseLabel(station.phase)}</span>
      )}

      {canEdit && (
        <div className="flex items-center gap-0.5 w-9 justify-end">
          {editing ? (
            <>
              <button onClick={save} className="p-0.5 text-muted-foreground hover:text-primary" title="Save"><Check className="w-3 h-3" /></button>
              <button onClick={cancel} className="p-0.5 text-muted-foreground hover:text-destructive" title="Cancel"><X className="w-3 h-3" /></button>
            </>
          ) : (
            <>
              <button disabled={pending} onClick={() => setEditing(true)} className="p-0.5 text-muted-foreground hover:text-primary" title="Rename">
                <Pencil className="w-2.5 h-2.5" />
              </button>
              <button disabled={pending} onClick={onRemove} className="p-0.5 text-muted-foreground hover:text-destructive" title="Remove">
                <X className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function SettingsView({
  canEdit, departments, stations, occurrences, languages, links, currentVersion,
}: {
  canEdit: boolean;
  departments: Department[];
  stations: Station[];
  occurrences: string[];
  languages: string[];
  links: { satisfactionFormUrl: string; googleReviewUrl: string };
  currentVersion: { version: string; title: string | null; released_at: string } | null;
}) {
  const { pending, exec } = useAction();

  // Same warning as the old page, but only for people who can actually change things
  useEffect(() => {
    if (!canEdit) return;
    const id = toast.error("Any action in this page will affect the entire app function!", { duration: Infinity, closeButton: true });
    return () => { toast.dismiss(id); };
  }, [canEdit]);

  const activeDepts = departments.filter((d) => d.is_active);
  const activeStations = stations.filter((s) => s.is_active !== false);
  const [newStationPhase, setNewStationPhase] = useState("");

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" /> System Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage the system settings</p>
        {!canEdit && (
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            <Lock className="w-4 h-4" /> View only: ask an admin to change these settings.
          </p>
        )}
      </motion.div>

      {/* Departments */}
      <Section title="Departments" description="These departments are available for task assignments and employee profiles.">
        <div className="flex flex-wrap gap-2">
          {activeDepts.map((d) => (
            <Chip key={d.id} label={d.name} canEdit={canEdit} pending={pending}
              onRename={(v) => exec(() => renameDepartment(d.name, v), "Department renamed everywhere")}
              onRemove={() => exec(() => setDepartmentActive(d.id, false), `"${d.name}" deactivated`)} />
          ))}
          {activeDepts.length === 0 && <p className="text-sm text-muted-foreground">No departments yet.</p>}
        </div>
        <InactiveList items={departments.filter((d) => !d.is_active)} canEdit={canEdit} pending={pending}
          onReactivate={(id) => exec(() => setDepartmentActive(id, true), "Department reactivated")} />
        {canEdit && (
          <AddRow placeholder="New department name..." pending={pending}
            onAdd={(v, reset) => exec(() => addDepartment(v), "Department added", reset)} />
        )}
      </Section>

      {/* Stations */}
      <Section title="Production Stations" description="These stations are available for easier task tracking.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          {activeStations.map((s) => (
            <div key={s.id} className="border-b border-border">
              <StationRow station={s} canEdit={canEdit} pending={pending}
                onRename={(v) => exec(() => renameStation(s.name, v), "Station renamed everywhere")}
                onPhase={(p) => exec(() => setStationPhase(s.id, p), "Phase updated")}
                onRemove={() => exec(() => setStationActive(s.id, false), `"${s.name}" deactivated`)} />
            </div>
          ))}
          {activeStations.length === 0 && <p className="text-sm text-muted-foreground">No stations yet.</p>}
        </div>
        <InactiveList items={stations.filter((s) => s.is_active === false)} canEdit={canEdit} pending={pending}
          onReactivate={(id) => exec(() => setStationActive(id, true), "Station reactivated")} />
        {canEdit && (
          <AddRow placeholder="New station name..." pending={pending}
            extra={
              <PhaseSelect value={newStationPhase || null} onChange={(p) => setNewStationPhase(p ?? "")} disabled={pending} />
            }
            onAdd={(v, reset) => exec(() => addStation(v, newStationPhase || null), "Station added", () => { reset(); setNewStationPhase(""); })} />
        )}
      </Section>

      {/* Occurrences */}
      <Section title="Non-conformities" description="These occurrences are available for registration of non-conformities and tracking of order progression.">
        <div className="flex flex-wrap gap-2">
          {occurrences.map((o) => (
            <Chip key={o} label={o} canEdit={canEdit} pending={pending}
              onRename={(v) => exec(() => renameOccurrence(o, v), "Occurrence renamed")}
              onRemove={() => exec(() => removeOccurrence(o), `"${o}" removed`)} />
          ))}
          {occurrences.length === 0 && <p className="text-sm text-muted-foreground">No occurrences yet.</p>}
        </div>
        {canEdit && (
          <AddRow placeholder="New occurrence name..." pending={pending}
            onAdd={(v, reset) => exec(() => addOccurrence(v), "Occurrence added", reset)} />
        )}
      </Section>

      {/* Languages (read-only: they come from the database) */}
      <Section title="System Languages" description="Languages accepted for documents and user preferences. New languages are added by a database update.">
        <div className="flex flex-wrap gap-2">
          {languages.map((l) => (
            <div key={l} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm uppercase">{l}</div>
          ))}
          {languages.length === 0 && <p className="text-sm text-muted-foreground">No languages found.</p>}
        </div>
      </Section>

      {/* Links */}
      <LinksCard canEdit={canEdit} links={links} />

      {/* App version */}
      <Section title="App Version Release" description="Release a new version to notify all users to refresh the app.">
        <p className="text-sm text-muted-foreground">
          Current version:{" "}
          {currentVersion ? (
            <span className="font-medium text-foreground">
              {currentVersion.version}{currentVersion.title ? ` · ${currentVersion.title}` : ""}
              {" "}({new Date(currentVersion.released_at).toLocaleDateString()})
            </span>
          ) : "none released yet"}
        </p>
        {canEdit && <ReleaseVersionForm />}
      </Section>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function LinksCard({ canEdit, links }: { canEdit: boolean; links: { satisfactionFormUrl: string; googleReviewUrl: string } }) {
  const { pending, exec } = useAction();
  const [form, setForm] = useState(links);
  const changed = form.satisfactionFormUrl !== links.satisfactionFormUrl || form.googleReviewUrl !== links.googleReviewUrl;
  return (
    <Section title="Links" description="Links sent to doctors when an order is finished.">
      <div className="space-y-3">
        <div className="space-y-1">
          <Label>Satisfaction form</Label>
          <Input value={form.satisfactionFormUrl} disabled={!canEdit || pending} placeholder="https://..."
            onChange={(e) => setForm({ ...form, satisfactionFormUrl: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>Google review</Label>
          <Input value={form.googleReviewUrl} disabled={!canEdit || pending} placeholder="https://..."
            onChange={(e) => setForm({ ...form, googleReviewUrl: e.target.value })} />
        </div>
        {canEdit && (
          <Button size="sm" disabled={pending || !changed} onClick={() => exec(() => saveLinks(form), "Links saved")}>
            Save links
          </Button>
        )}
      </div>
    </Section>
  );
}

const ALL_ROLES = [
  { value: "doctor", label: "Doctors", icon: Stethoscope },
  { value: "distributor", label: "Distributors", icon: Truck },
  { value: "employee", label: "Employees", icon: Briefcase },
  { value: "supervisor", label: "Supervisors", icon: ShieldCheck },
];

function ReleaseVersionForm() {
  const { pending, exec } = useAction();
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [targetRoles, setTargetRoles] = useState<string[]>([]); // empty = all roles

  const toggle = (r: string) => setTargetRoles((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]));
  const reset = () => { setVersion(""); setTitle(""); setNotes(""); setTargetRoles([]); };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Version number *</Label>
          <Input placeholder="e.g. 1.2.0" value={version} onChange={(e) => setVersion(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Title</Label>
          <Input placeholder="e.g. Bug fixes & improvements" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Release notes</Label>
        <Textarea placeholder="What changed in this version?" value={notes} onChange={(e) => setNotes(e.target.value)} className="h-24" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notify</span>
          {targetRoles.length > 0 && (
            <button onClick={() => setTargetRoles([])} className="text-xs text-muted-foreground hover:text-foreground">Reset to all</button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ALL_ROLES.map(({ value, label, icon: Icon }) => {
            const selected = targetRoles.includes(value);
            return (
              <button key={value} onClick={() => toggle(value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                  selected
                    ? "bg-primary/10 text-primary border-primary/30 shadow-sm"
                    : "bg-muted/40 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}>
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
                {selected && <CheckCircle2 className="w-3 h-3 ml-auto" />}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          {targetRoles.length === 0
            ? "No selection: all users will be notified."
            : `Only ${targetRoles.map((r) => ALL_ROLES.find((x) => x.value === r)?.label).join(", ")} will see the notice.`}
        </p>
      </div>
      <Button disabled={pending || !version.trim()} className="w-full sm:w-auto"
        onClick={() => exec(() => releaseVersion({ version, title, notes, targetRoles }), `Version ${version.trim()} released`, reset)}>
        {pending ? "Releasing..." : "Release version"}
      </Button>
    </div>
  );
}
