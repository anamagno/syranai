/**
 * Legal documents (legal_documents table + "legal" storage bucket).
 *
 * legal_documents.url holds either
 *  - a full link (old Base44 files: https://...), or
 *  - a path inside the "legal" bucket (new uploads: termsAndConditions/pt/v2-....pdf).
 * Paths are turned into links when the page loads, so moving Supabase to another server
 * doesn't break the stored values.
 */
import type { Profile } from "@/lib/auth/roles";

export const LEGAL_BUCKET = "legal";
export const TERMS_TYPE = "termsAndConditions";

const LANG_NAMES: Record<string, string> = {
  pt: "Portuguese", en: "English", es: "Spanish", fr: "French", ar: "Arabic", de: "German", it: "Italian",
};
export const langName = (code: string) => LANG_NAMES[code.toLowerCase()] ?? code.toUpperCase();
export const langLabel = (code: string) => code.toUpperCase();

/** Full link for a stored value, given the Supabase URL. */
export function legalFileUrl(stored: string, supabaseUrl: string) {
  if (/^https?:\/\//i.test(stored)) return stored;
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${LEGAL_BUCKET}/${stored.replace(/^\//, "")}`;
}

/** File name for display ("...-V9-pt.pdf"). */
export const fileNameOf = (stored: string) => decodeURIComponent(stored.split("/").pop()?.split("?")[0] ?? stored);

/** Who can open the Terms page (same as the old app). */
export const canViewTerms = (p: Pick<Profile, "role" | "department">) =>
  p.role === "supervisor" || p.role === "doctor" ||
  (p.role === "employee" && ["Quality", "Sales and Client Support"].includes(p.department ?? ""));

/** Who can publish new versions. */
export const canEditTerms = (p: Pick<Profile, "role" | "department">) =>
  p.role === "supervisor" || (p.role === "employee" && p.department === "Quality");

/** version is stored as text: "1", "2"... */
export const versionNumber = (v: string | null | undefined) => {
  const n = parseInt(v ?? "", 10);
  return Number.isFinite(n) ? n : 0;
};
