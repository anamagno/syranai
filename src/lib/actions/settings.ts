"use server";

import { revalidatePath } from "next/cache";
import { authorize, run } from "./guard";
import type { Enums } from "@/types/database";

/**
 * System Settings: only admins (supervisor with is_admin = true) can change anything.
 * Departments and stations are never deleted, only deactivated, because tasks,
 * templates, profiles, machines and messages store their names.
 */
const requireAdmin = () => authorize({ roles: ["supervisor"], check: (p) => p.is_admin });

const PHASES: Enums<"order_phase">[] = ["ordering", "designing", "production", "delivery", "closing"];
const ROLES: Enums<"user_role">[] = ["supervisor", "employee", "doctor", "distributor"];

const done = () => revalidatePath("/settings");

function cleanName(name: string) {
  const v = (name ?? "").replace(/\s+/g, " ").trim();
  if (!v) throw new Error("The name is empty");
  if (v.length > 80) throw new Error("The name is too long (80 characters max)");
  return v;
}

/* ---------------- Departments ---------------- */

export async function addDepartment(name: string) {
  return run(async () => {
    const { admin } = await requireAdmin();
    const v = cleanName(name);
    const { data: existing, error: e1 } = await admin.from("departments").select("id, name, is_active").ilike("name", v);
    if (e1) throw e1;
    const same = existing.find((d) => d.name.toLowerCase() === v.toLowerCase());
    if (same?.is_active) throw new Error(`"${same.name}" already exists`);
    if (same) {
      // it was deactivated: bring it back instead of creating a duplicate
      const { error } = await admin.from("departments").update({ is_active: true }).eq("id", same.id);
      if (error) throw error;
    } else {
      const { error } = await admin.from("departments").insert({ name: v });
      if (error) throw error;
    }
    done();
  });
}

export async function setDepartmentActive(id: string, active: boolean) {
  return run(async () => {
    const { admin } = await requireAdmin();
    const { error } = await admin.from("departments").update({ is_active: active }).eq("id", id);
    if (error) throw error;
    done();
  });
}

export async function renameDepartment(oldName: string, newName: string) {
  return run(async () => {
    const { admin } = await requireAdmin();
    const { error } = await admin.rpc("rename_department", { p_old: oldName, p_new: cleanName(newName) });
    if (error) throw new Error(error.message);
    done();
  });
}

/* ---------------- Stations ---------------- */

function cleanPhase(phase: string | null) {
  if (phase === null || phase === "") return null;
  if (!PHASES.includes(phase as Enums<"order_phase">)) throw new Error("Unknown phase");
  return phase as Enums<"order_phase">;
}

export async function addStation(name: string, phase: string | null) {
  return run(async () => {
    const { profile, admin } = await requireAdmin();
    const v = cleanName(name);
    const p = cleanPhase(phase);
    const { data: existing, error: e1 } = await admin.from("stations").select("id, name, is_active").ilike("name", v);
    if (e1) throw e1;
    const same = existing.find((s) => s.name.toLowerCase() === v.toLowerCase());
    if (same?.is_active) throw new Error(`"${same.name}" already exists`);
    if (same) {
      const { error } = await admin.from("stations").update({ is_active: true, phase: p }).eq("id", same.id);
      if (error) throw error;
    } else {
      const { error } = await admin.from("stations").insert({ name: v, phase: p, created_by_id: profile.id });
      if (error) throw error;
    }
    done();
  });
}

export async function setStationActive(id: string, active: boolean) {
  return run(async () => {
    const { admin } = await requireAdmin();
    const { error } = await admin.from("stations").update({ is_active: active }).eq("id", id);
    if (error) throw error;
    done();
  });
}

export async function setStationPhase(id: string, phase: string | null) {
  return run(async () => {
    const { admin } = await requireAdmin();
    const { error } = await admin.from("stations").update({ phase: cleanPhase(phase) }).eq("id", id);
    if (error) throw error;
    done();
  });
}

export async function renameStation(oldName: string, newName: string) {
  return run(async () => {
    const { admin } = await requireAdmin();
    const { error } = await admin.rpc("rename_station", { p_old: oldName, p_new: cleanName(newName) });
    if (error) throw new Error(error.message);
    done();
  });
}

/* ---------------- App settings (single row) ---------------- */

type SettingsPatch = { occurrences?: string[]; satisfaction_form_url?: string; google_review_url?: string };

async function saveSettings(patch: SettingsPatch) {
  const { admin } = await requireAdmin();
  const { data: row, error: e1 } = await admin.from("app_settings").select("id").limit(1).maybeSingle();
  if (e1) throw e1;
  const { error } = row
    ? await admin.from("app_settings").update(patch).eq("id", row.id)
    : await admin.from("app_settings").insert(patch);
  if (error) throw error;
  done();
}

async function currentOccurrences() {
  const { admin } = await requireAdmin();
  const { data, error } = await admin.from("app_settings").select("occurrences").limit(1).maybeSingle();
  if (error) throw error;
  return data?.occurrences ?? [];
}

export async function addOccurrence(name: string) {
  return run(async () => {
    const v = cleanName(name);
    const list = await currentOccurrences();
    if (list.some((o) => o.toLowerCase() === v.toLowerCase())) throw new Error(`"${v}" already exists`);
    await saveSettings({ occurrences: [...list, v] });
  });
}

/** Occurrences are only labels picked when registering a repetition; past registrations keep their text. */
export async function removeOccurrence(name: string) {
  return run(async () => {
    const list = await currentOccurrences();
    await saveSettings({ occurrences: list.filter((o) => o !== name) });
  });
}

export async function renameOccurrence(oldName: string, newName: string) {
  return run(async () => {
    const v = cleanName(newName);
    const list = await currentOccurrences();
    if (list.some((o) => o !== oldName && o.toLowerCase() === v.toLowerCase())) throw new Error(`"${v}" already exists`);
    await saveSettings({ occurrences: list.map((o) => (o === oldName ? v : o)) });
  });
}

function cleanUrl(url: string) {
  const v = (url ?? "").trim();
  if (!v) return "";
  try {
    const u = new URL(v);
    if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error();
    return v;
  } catch {
    throw new Error(`"${v}" is not a valid link (it must start with https://)`);
  }
}

export async function saveLinks(links: { satisfactionFormUrl: string; googleReviewUrl: string }) {
  return run(async () => {
    await saveSettings({
      satisfaction_form_url: cleanUrl(links.satisfactionFormUrl),
      google_review_url: cleanUrl(links.googleReviewUrl),
    });
  });
}

/* ---------------- App version ---------------- */

export async function releaseVersion(input: { version: string; title: string; notes: string; targetRoles: string[] }) {
  return run(async () => {
    const { profile, admin } = await requireAdmin();
    const version = (input.version ?? "").trim();
    if (!version) throw new Error("Version number is required");
    const roles = (input.targetRoles ?? []).filter((r): r is Enums<"user_role"> => ROLES.includes(r as Enums<"user_role">));
    const { error } = await admin.rpc("release_app_version", {
      p_version: version,
      p_title: input.title ?? "",
      p_notes: input.notes ?? "",
      p_target_roles: roles,
      p_released_by: profile.id,
    });
    if (error) throw new Error(error.message);
    done();
  });
}
