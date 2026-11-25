"use client";

import { useRef, useState } from "react";
import { copy } from "@/content/tools/londonNights";
import { readFileText } from "@/lib/tools/download";
import {
  findDuplicate,
  formatRange,
  platformName,
  previewCsv,
  previewIcs,
  previewNights,
  readBackup,
  type Booking,
  type Draft,
  type PreviewRow,
  type Store,
} from "@/lib/tools/london-nights";

const C = copy.files;

/** Import (CSV / .ics) with a preview, restore a backup, and clear all data. All on this device. */
export function FilesPanel({
  bookings,
  propertyName,
  onImport,
  onRestore,
  onClearAll,
}: {
  bookings: Booking[];
  propertyName: string;
  onImport: (drafts: Draft[]) => void;
  onRestore: (s: Store) => void;
  onClearAll: () => void;
}) {
  const importRef = useRef<HTMLInputElement>(null);
  const restoreRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{ name: string; rows: PreviewRow[] } | null>(null);
  const [restore, setRestore] = useState<Store | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [message, setMessage] = useState("");

  const pickImport = async (f: File | undefined) => {
    if (!f) return;
    setMessage("");
    const text = await readFileText(f);
    const isIcs = /BEGIN:VCALENDAR/i.test(text) || f.name.toLowerCase().endsWith(".ics");
    const rows = (isIcs ? previewIcs(text) : previewCsv(text)).map((r) =>
      r.draft && findDuplicate(r.draft, bookings) ? { ...r, include: false, note: "Already added." } : r,
    );
    setPreview(rows.length ? { name: f.name, rows } : null);
    if (!rows.length) setMessage("No bookings found in that file.");
    if (importRef.current) importRef.current.value = "";
  };

  const pickRestore = async (f: File | undefined) => {
    if (!f) return;
    const r = readBackup(await readFileText(f));
    if (r.ok) setRestore(r.store);
    else setMessage(r.error);
    if (restoreRef.current) restoreRef.current.value = "";
  };

  const toggle = (i: number) =>
    setPreview((p) => (p ? { ...p, rows: p.rows.map((r, k) => (k === i && r.draft ? { ...r, include: !r.include } : r)) } : p));
  const chosen = preview?.rows.filter((r) => r.include && r.draft) ?? [];

  return (
    <section aria-labelledby="files-title" className="grid gap-3 rounded-[16px] bg-cloud-2 p-4 md:p-5">
      <h2 id="files-title" className="m-0 text-lg font-extrabold">
        {C.title}
      </h2>
      <p className="m-0 text-[13px] leading-[1.55] text-muted">{C.importHint}</p>

      <div className="flex flex-wrap gap-2">
        <label className="btn btn-outline min-h-11 cursor-pointer bg-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink">
          {C.import}
          <input ref={importRef} type="file" accept=".csv,.ics,.txt,text/csv,text/calendar" className="sr-only-label" onChange={(e) => pickImport(e.target.files?.[0])} />
        </label>
        <label className="btn btn-outline min-h-11 cursor-pointer bg-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink">
          {C.restore}
          <input ref={restoreRef} type="file" accept=".json,application/json" className="sr-only-label" onChange={(e) => pickRestore(e.target.files?.[0])} />
        </label>
      </div>
      <p className="m-0 text-[13px] leading-[1.55] text-muted">{C.backupHint}</p>
      {message && (
        <p className="m-0 text-sm font-bold text-brand" role="alert">
          {message}
        </p>
      )}

      {preview && (
        <div className="grid gap-3 rounded-[14px] border border-line bg-white p-4" role="region" aria-label="Import preview">
          <p className="m-0 text-sm font-bold">
            {preview.name}: tick the stays to add to {propertyName}.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-muted">
                  <th className="py-2 pr-2 font-bold">Add</th>
                  <th className="py-2 pr-2 font-bold">Dates</th>
                  <th className="py-2 pr-2 font-bold">Nights</th>
                  <th className="py-2 pr-2 font-bold">Platform</th>
                  <th className="py-2 font-bold">Details</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((r, i) => (
                  <tr key={i} className="border-b border-line-4 align-top">
                    <td className="py-2 pr-2">
                      <input
                        type="checkbox"
                        checked={r.include}
                        disabled={!r.draft}
                        onChange={() => toggle(i)}
                        aria-label={r.draft ? `Add ${formatRange(r.draft.checkIn, r.draft.checkOut)}` : `Row ${r.line} can’t be added`}
                        className="size-5 accent-ink"
                      />
                    </td>
                    <td className="py-2 pr-2 whitespace-nowrap">{r.draft ? formatRange(r.draft.checkIn, r.draft.checkOut, 0) : `Row ${r.line}`}</td>
                    <td className="py-2 pr-2">{r.draft ? previewNights(r) : "–"}</td>
                    <td className="py-2 pr-2">{r.draft ? platformName({ platform: r.draft.platform as Booking["platform"], otherPlatform: r.draft.otherPlatform }) : "–"}</td>
                    <td className="py-2 text-xs">
                      {r.error && <span className="font-bold text-brand">{r.error} Skipped.</span>}
                      {r.note && <span className="font-semibold text-amber">{r.note}</span>}
                      {!r.error && !r.note && <span className="text-muted">{r.draft?.reference}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!chosen.length}
              onClick={() => {
                onImport(chosen.map((r) => r.draft!));
                setMessage("");
                setPreview(null);
              }}
              className="btn btn-ink disabled:opacity-40"
            >
              Add {chosen.length} {chosen.length === 1 ? "booking" : "bookings"}
            </button>
            <button type="button" onClick={() => setPreview(null)} className="btn btn-outline">
              Cancel
            </button>
          </div>
        </div>
      )}

      {restore && (
        <div className="grid gap-2 rounded-[14px] border border-line bg-white p-4" role="alert">
          <p className="m-0 text-sm font-bold">
            Replace everything on this device with the backup ({restore.properties.length} {restore.properties.length === 1 ? "property" : "properties"},{" "}
            {restore.properties.reduce((n, p) => n + p.bookings.length, 0)} bookings)?
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                onRestore(restore);
                setRestore(null);
              }}
              className="btn btn-ink"
            >
              Yes, restore
            </button>
            <button type="button" onClick={() => setRestore(null)} className="btn btn-outline">
              Cancel
            </button>
          </div>
        </div>
      )}

      {!confirmClear ? (
        <button type="button" onClick={() => setConfirmClear(true)} className="min-h-11 cursor-pointer self-start border-none bg-transparent p-0 text-sm font-bold text-brand underline underline-offset-2">
          {C.clearAll}
        </button>
      ) : (
        <div className="grid gap-2 rounded-[14px] border border-coral bg-white p-4" role="alert">
          <p className="m-0 text-sm font-bold">{C.clearConfirm}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                onClearAll();
                setConfirmClear(false);
              }}
              className="btn btn-coral"
            >
              {C.clearYes}
            </button>
            <button type="button" onClick={() => setConfirmClear(false)} className="btn btn-outline">
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
