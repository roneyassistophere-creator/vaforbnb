"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { confirmImportAction, previewImportAction } from "@/app/admin/actions";
import { cn } from "@/lib/cn";
import { downloadText } from "@/lib/tools/download";
import { CSV_COLUMNS, csvTemplate, eventsCsv, type AdminEvent, type ImportRow } from "@/lib/tools/events";

export function ImportPanel({ role, events, today }: { role: "admin" | "editor"; events: AdminEvent[]; today: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ImportRow[] | null>(null);
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [publish, setPublish] = useState(false);
  const [summary, setSummary] = useState("");
  const [pending, start] = useTransition();
  const valid = rows?.filter((r) => r.event).length ?? 0;
  const bad = rows?.filter((r) => !r.event).length ?? 0;

  const preview = (t: string, pub: boolean) =>
    start(async () => {
      const r = await previewImportAction(t, pub);
      setRows(r.rows);
      setHeaderError(r.headerError);
      setSummary("");
    });

  return (
    <div className="grid gap-4">
      <section className="grid gap-3 rounded-[18px] border border-line bg-white p-5">
        <h2 className="m-0 text-lg font-extrabold">1. Start from the template</h2>
        <p className="m-0 text-sm text-ink-copy">
          Columns: <code className="text-[12px]">{CSV_COLUMNS.join(", ")}</code>. Dates as YYYY-MM-DD. City and category can be the name or the slug. Leave status empty to import as drafts.
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-outline min-h-11" onClick={() => downloadText("events-template.csv", csvTemplate(), "text/csv")} data-template>
            Download CSV template
          </button>
          <button type="button" className="btn btn-outline min-h-11" onClick={() => downloadText(`events-${today}.csv`, eventsCsv(events), "text/csv")} data-export-all>
            Export all events ({events.length})
          </button>
        </div>
        <p className="m-0 text-[13px] text-muted">Tip: export, edit in a spreadsheet, then re-import. Rows are matched by name and year, so existing events are updated, not duplicated.</p>
      </section>

      <section className="grid gap-3 rounded-[18px] border border-line bg-white p-5">
        <h2 className="m-0 text-lg font-extrabold">2. Choose your file</h2>
        <div className="grid gap-1.5">
          <label htmlFor="import-file" className="text-[15px] font-bold">
            CSV file
          </label>
          <input
            id="import-file"
            type="file"
            accept=".csv,text/csv"
            className="text-sm"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const t = await f.text();
              setText(t);
              setFileName(f.name);
              preview(t, publish);
            }}
          />
        </div>
        {role === "admin" && (
          <label className="flex min-h-11 items-center gap-2.5 text-sm font-bold">
            <input
              type="checkbox"
              checked={publish}
              onChange={(e) => {
                setPublish(e.target.checked);
                if (text) preview(text, e.target.checked);
              }}
              className="size-5"
            />
            Publish the valid rows straight away (otherwise they’re saved as drafts)
          </label>
        )}
      </section>

      {headerError && (
        <p className="m-0 rounded-[14px] bg-coral-50 px-4 py-3 text-sm font-bold text-brand" role="alert">
          {headerError}
        </p>
      )}

      {rows && !headerError && (
        <section className="grid gap-3 rounded-[18px] border border-line bg-white p-5" data-import-preview>
          <h2 className="m-0 text-lg font-extrabold">3. Check the preview</h2>
          <p className="m-0 text-sm text-ink-copy" data-import-counts>
            {fileName}: <strong>{valid}</strong> ready to import, <strong>{bad}</strong> with problems (these will be skipped). Nothing is saved until you confirm.
          </p>
          <div className="max-h-[420px] overflow-auto rounded-[12px] border border-line">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead className="sticky top-0 bg-cloud-2 text-[12px] tracking-[0.5px] text-muted uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">Line</th>
                  <th className="px-3 py-2 text-left">Event</th>
                  <th className="px-3 py-2 text-left">Result</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.line} className={cn("border-t border-line align-top", !r.event && "bg-coral-25")} data-import-row={r.line}>
                    <td className="px-3 py-2 tabular-nums">{r.line}</td>
                    <td className="px-3 py-2 font-bold">{r.event ? `${r.event.name} · ${r.event.startDate}` : "—"}</td>
                    <td className="px-3 py-2">
                      {r.event ? (
                        <span className="text-green">
                          ✓ {r.updatesSlug ? "Updates an existing event" : "New"}
                          {r.duplicateOf && <span className="ml-2 font-bold text-amber">⚠ Looks like {r.duplicateOf}</span>}
                        </span>
                      ) : (
                        <ul className="m-0 grid list-none gap-0.5 p-0 font-bold text-brand">
                          {r.errors.map((x) => (
                            <li key={x}>✗ {x}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="btn btn-coral min-h-12"
              disabled={!valid || pending}
              onClick={() =>
                start(async () => {
                  const s = await confirmImportAction(text, publish);
                  setSummary(`${s.imported} imported, ${s.updated} updated, ${s.skipped} skipped.`);
                  setRows(null);
                  router.refresh();
                })
              }
              data-import-confirm
            >
              {publish ? `Import and publish ${valid} valid rows` : `Import ${valid} valid rows as drafts`}
            </button>
            <button type="button" className="btn btn-outline min-h-12" onClick={() => (setRows(null), setText(""))}>
              Cancel
            </button>
          </div>
        </section>
      )}

      {summary && (
        <p className="m-0 rounded-[14px] bg-green-100 px-4 py-3 text-sm font-bold text-green" role="status" data-import-summary>
          {summary}
        </p>
      )}
    </div>
  );
}
