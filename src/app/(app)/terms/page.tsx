import { requireApprovedProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { canEditTerms, canViewTerms, legalFileUrl, TERMS_TYPE, versionNumber } from "@/lib/legal";
import { TermsView, type TermsLang } from "@/components/terms/TermsView";
import { NoAccess } from "@/components/layout/NoAccess";

export const metadata = { title: "Terms & Conditions" };

export default async function TermsPage() {
  const me = await requireApprovedProfile();
  if (!canViewTerms(me)) return <NoAccess role={me.role} />;

  const db = await createClient();
  const canEdit = canEditTerms(me);
  const [docs, langs] = await Promise.all([
    db.from("legal_documents").select("lang, version, url, is_active, created_at").eq("document_type", TERMS_TYPE),
    canEdit ? db.rpc("document_languages") : Promise.resolve({ data: [] as string[], error: null }),
  ]);
  if (docs.error) throw docs.error;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  // Per language: latest active version (what people see)
  const byLang = new Map<string, TermsLang>();
  for (const d of docs.data) {
    if (!d.is_active) continue;
    const v = versionNumber(d.version);
    const current = byLang.get(d.lang);
    if (!current || v > current.version || (v === current.version && d.created_at > current.createdAt)) {
      byLang.set(d.lang, { lang: d.lang, version: v, stored: d.url, url: legalFileUrl(d.url, supabaseUrl), createdAt: d.created_at });
    }
  }
  const active = [...byLang.values()].sort((a, b) => a.lang.localeCompare(b.lang));

  return (
    <TermsView
      active={active}
      canEdit={canEdit}
      allLanguages={langs.error ? [] : (langs.data ?? [])}
    />
  );
}
