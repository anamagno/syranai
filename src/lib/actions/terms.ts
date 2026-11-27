"use server";

import { revalidatePath } from "next/cache";
import { authorize, run } from "./guard";
import { canEditTerms, LEGAL_BUCKET, TERMS_TYPE, versionNumber } from "@/lib/legal";
import type { TablesInsert } from "@/types/database";

const MAX_BYTES = 20 * 1024 * 1024; // same limit as the "legal" bucket

const slug = (name: string) =>
  name.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/\.pdf$/i, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "terms";

/**
 * "Publish new version" in the Update Terms dialog.
 * formData:
 *   file:<lang>  a PDF for that language -> new version (highest version ever + 1)
 *   remove       a language code (repeatable) -> all its versions become inactive
 *
 * Order: upload every file first; then save all new rows in ONE insert;
 * if anything fails before that, the uploaded files are deleted again.
 */
export async function publishTerms(formData: FormData) {
  return run(async () => {
    const { profile, admin } = await authorize({ check: canEditTerms });

    const files: { lang: string; file: File }[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("file:") && value instanceof File && value.size > 0) files.push({ lang: key.slice(5), file: value });
    }
    const removed = [...new Set(formData.getAll("remove").map(String))];
    if (!files.length && !removed.length) throw new Error("Nothing to publish");

    // Languages must exist in the database enum
    const { data: langs, error: langErr } = await admin.rpc("document_languages");
    if (langErr) throw new Error(langErr.message);
    for (const l of [...files.map((f) => f.lang), ...removed]) {
      if (!langs?.includes(l)) throw new Error(`Unknown language "${l}"`);
    }
    for (const { lang, file } of files) {
      if (removed.includes(lang)) throw new Error(`${lang.toUpperCase()} can't be updated and removed at the same time`);
      const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
      if (!isPdf) throw new Error(`${file.name}: only PDF files are accepted`);
      if (file.size > MAX_BYTES) throw new Error(`${file.name}: the file is larger than 20 MB`);
    }

    // Highest version ever per language (active or not), so numbers never repeat
    const { data: existing, error: exErr } = await admin.from("legal_documents")
      .select("lang, version").eq("document_type", TERMS_TYPE);
    if (exErr) throw exErr;
    const maxVersion = new Map<string, number>();
    for (const r of existing) maxVersion.set(r.lang, Math.max(maxVersion.get(r.lang) ?? 0, versionNumber(r.version)));

    // 1. Upload all files
    const storage = admin.storage.from(LEGAL_BUCKET);
    const uploaded: string[] = [];
    const rows: TablesInsert<"legal_documents">[] = [];
    try {
      for (const { lang, file } of files) {
        const version = (maxVersion.get(lang) ?? 0) + 1;
        const path = `${TERMS_TYPE}/${lang}/v${version}-${Date.now()}-${slug(file.name)}.pdf`;
        const { error } = await storage.upload(path, file, { contentType: "application/pdf", upsert: false });
        if (error) throw new Error(`Upload of ${file.name} failed: ${error.message}`);
        uploaded.push(path);
        rows.push({
          document_type: TERMS_TYPE, lang, version: String(version), url: path,
          is_active: true, created_by_id: profile.id,
        });
      }

      // 2. Save all new versions in one step (all or nothing)
      if (rows.length) {
        const { error } = await admin.from("legal_documents").insert(rows);
        if (error) throw error;
      }
    } catch (e) {
      if (uploaded.length) await storage.remove(uploaded); // don't leave orphan files
      throw e;
    }

    // 3. Removed languages: hide every version (kept as history)
    if (removed.length) {
      const { error } = await admin.from("legal_documents").update({ is_active: false })
        .eq("document_type", TERMS_TYPE).in("lang", removed);
      if (error) throw new Error(`New versions were saved, but removing ${removed.join(", ").toUpperCase()} failed: ${error.message}`);
    }

    // TODO: send notification "termsUpdated" (old app: to all supervisors)
    // await sendNotification({ event: "termsUpdated", from: profile.id, to: supervisors });

    revalidatePath("/terms");
  });
}
