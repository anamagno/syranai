"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { publishTerms } from "@/lib/actions/terms";
import { fileNameOf, langLabel, langName } from "@/lib/legal";

export type TermsLang = { lang: string; version: number; stored: string; url: string; createdAt: string };

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function TermsView({ active, canEdit, allLanguages }: {
  active: TermsLang[];
  canEdit: boolean;
  allLanguages: string[];
}) {
  const codes = active.map((a) => a.lang);
  const [activeLang, setActiveLang] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Default: the browser's language (PT or EN) if available, else the first one
  useEffect(() => {
    if (!codes.length) return;
    if (activeLang && codes.includes(activeLang)) return;
    const browser = navigator.language.toLowerCase().startsWith("pt") ? "pt" : "en";
    setActiveLang(codes.includes(browser) ? browser : codes[0]);
  }, [codes.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  // Warning when the languages are not on the same latest version
  const hasMismatch = useMemo(() => new Set(active.map((a) => a.version)).size > 1, [active]);
  const current = active.find((a) => a.lang === activeLang);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-primary" /> Terms & Conditions
        </h1>
        <p className="text-muted-foreground mt-1">Select your language to view the document</p>
      </motion.div>

      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 flex-wrap">
          {active.map((a) => (
            <button key={a.lang} onClick={() => setActiveLang(a.lang)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeLang === a.lang ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}>
              {langLabel(a.lang)}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {canEdit && (
          <div className="relative group">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)} className="text-xs gap-1.5">
              Update Terms
            </Button>
            {hasMismatch && (
              <div className="absolute -top-1 -right-1 group">
                <div className="w-4 h-4 rounded-full bg-yellow-500 text-white text-[10px] flex items-center justify-center">!</div>
                <div className="absolute bottom-full right-0 mb-2 w-52 text-[11px] bg-white border border-yellow-500 text-foreground px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">
                  <span className="font-bold text-yellow-500">Warning:</span> Latest version is not consistent across files
                </div>
              </div>
            )}
          </div>
        )}

        {current && (
          <a href={current.url} download target="_blank" rel="noopener noreferrer"
            className="px-3 py-1 rounded text-xs font-medium bg-foreground text-background hover:opacity-85 transition">
            Download PDF
          </a>
        )}
      </div>

      <div className="w-full h-[80vh] overflow-hidden mb-4 bg-background">
        {current ? (
          <iframe src={`${current.url}#view=FitH&toolbar=0&navpanes=0&scrollbar=0`} title="Terms and Conditions" className="w-full h-full bg-background" />
        ) : (
          <div className="w-full h-full flex items-center justify-center border border-border rounded-md">
            <p className="text-muted-foreground text-sm">No document available for this language.</p>
          </div>
        )}
      </div>

      {canEdit && (
        <UpdateTermsDialog open={dialogOpen} onOpenChange={setDialogOpen} active={active} allLanguages={allLanguages} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Update dialog                                                       */
/* ------------------------------------------------------------------ */

type Entry = { stored: string | null; version: number | null; file: File | null; removed: boolean };

function UpdateTermsDialog({ open, onOpenChange, active, allLanguages }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  active: TermsLang[];
  allLanguages: string[];
}) {
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [addLang, setAddLang] = useState("");
  const [publishing, start] = useTransition();
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const addInput = useRef<HTMLInputElement>(null);

  // Reset every time the dialog opens
  useEffect(() => {
    if (!open) return;
    const initial: Record<string, Entry> = {};
    for (const a of active) initial[a.lang] = { stored: a.stored, version: a.version, file: null, removed: false };
    setEntries(initial);
    setShowAdd(false);
    setAddLang("");
  }, [open, active]);

  const patch = (lang: string, p: Partial<Entry>) => setEntries((e) => ({ ...e, [lang]: { ...e[lang], ...p } }));
  const unused = allLanguages.filter((l) => !(l in entries));

  const hasChanges = Object.values(entries).some((e) => e.file || (e.removed && e.stored));

  const onAddFile = (file: File | undefined) => {
    if (!file || !addLang) return;
    setEntries((e) => ({ ...e, [addLang]: { stored: null, version: null, file, removed: false } }));
    setShowAdd(false);
    setAddLang("");
  };

  const publish = () =>
    start(async () => {
      const fd = new FormData();
      for (const [lang, e] of Object.entries(entries)) {
        if (e.removed && e.stored) fd.append("remove", lang);
        else if (e.file) fd.append(`file:${lang}`, e.file);
      }
      const r = await publishTerms(fd);
      if (r.ok) {
        toast.success("Terms and conditions updated successfully.");
        onOpenChange(false);
      } else toast.error(r.error);
    });

  return (
    <Dialog open={open} onOpenChange={(v) => !publishing && onOpenChange(v)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Update Terms and Conditions</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {Object.keys(entries).length === 0 && (
            <p className="text-sm text-muted-foreground">No files yet. Add a language to get started.</p>
          )}

          {Object.entries(entries).map(([lang, e]) => (
            <div key={lang} className={`flex items-center gap-3 p-3 rounded-lg border bg-muted/30 min-w-0 overflow-hidden ${
              e.removed ? "border-destructive/30 opacity-60" : "border-border"}`}>
              <span className="w-8 text-xs font-bold uppercase text-primary">{langLabel(lang)}</span>

              <div className="flex-1 min-w-0 overflow-hidden">
                {e.removed ? (
                  <span className="text-xs text-destructive italic">The file will be removed</span>
                ) : e.file ? (
                  <span className="text-xs text-foreground truncate block">
                    {e.file.name}{" "}
                    <span className="text-muted-foreground">{e.version !== null ? `→ v${e.version + 1}` : "(new language)"}</span>
                  </span>
                ) : e.stored ? (
                  <span className="text-xs text-muted-foreground truncate block" title={fileNameOf(e.stored)}>
                    v{e.version} · {fileNameOf(e.stored)}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground italic">No file</span>
                )}
              </div>

              {publishing && e.file && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground flex-shrink-0" />}

              {e.removed ? (
                <Button variant="outline" size="sm" className="text-xs h-7 px-3 flex-shrink-0" onClick={() => patch(lang, { removed: false })}>
                  Restore
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="text-xs h-7 px-3 flex-shrink-0" disabled={publishing}
                    onClick={() => fileInputs.current[lang]?.click()}>
                    <Upload className="w-3 h-3 mr-1" />{e.file ? "Change" : "Update"}
                  </Button>
                  <input ref={(el) => { fileInputs.current[lang] = el; }} type="file" accept="application/pdf" className="hidden"
                    onChange={(ev) => { const f = ev.target.files?.[0]; if (f) patch(lang, { file: f, removed: false }); ev.target.value = ""; }} />
                  <button disabled={publishing} className="text-muted-foreground hover:text-destructive transition-colors"
                    title={e.stored ? "Remove" : "Discard"}
                    onClick={() => {
                      // a language that was only added in this dialog just disappears
                      if (!e.stored) setEntries((all) => { const { [lang]: _drop, ...rest } = all; return rest; });
                      else patch(lang, { removed: true, file: null });
                    }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}

          {unused.length > 0 && !showAdd && (
            <button onClick={() => setShowAdd(true)} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add language
            </button>
          )}

          {showAdd && (
            <div className="flex gap-2 items-center">
              <Select value={addLang || undefined} onValueChange={setAddLang}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Select language..." /></SelectTrigger>
                <SelectContent>
                  {unused.map((l) => <SelectItem key={l} value={l}>{langName(l)}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button size="sm" disabled={!addLang} onClick={() => addInput.current?.click()}>Upload file</Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowAdd(false); setAddLang(""); }}>Cancel</Button>
            </div>
          )}
          <input ref={addInput} type="file" accept="application/pdf" className="hidden"
            onChange={(ev) => { onAddFile(ev.target.files?.[0]); ev.target.value = ""; }} />
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
          <Button variant="outline" disabled={publishing} onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={publish} disabled={publishing || !hasChanges}>
            {publishing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Publishing...</> : "Publish new version"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
