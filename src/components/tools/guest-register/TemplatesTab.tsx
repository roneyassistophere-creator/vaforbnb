"use client";

import { useState } from "react";
import { copy, toolSlug } from "@/content/tools/guestRegister";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { downloadText } from "@/lib/tools/download";
import { blankCsv, blankPrintable, checkInCard, exampleRow, fileSlug, registerColumns, type Lists } from "@/lib/tools/guest-register";
import { printHtml } from "@/lib/tools/printable";
import { Toggle } from "../Toggle";

const chip =
  "flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-line px-4 text-sm font-semibold has-checked:border-ink has-checked:bg-sand has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink";

/** A scaled-down live preview of a printable page. */
function Preview({ html, title, landscape }: { html: string; title: string; landscape?: boolean }) {
  const w = landscape ? 1123 : 794;
  const h = landscape ? 794 : 1123;
  const scale = 0.3;
  return (
    <div className="overflow-hidden rounded-[10px] border border-line bg-white shadow-[0_6px_18px_rgba(20,33,43,0.08)]" style={{ width: w * scale, height: h * scale }}>
      <iframe title={title} srcDoc={html} tabIndex={-1} aria-hidden="true" className="pointer-events-none origin-top-left border-0" style={{ width: w, height: h, transform: `scale(${scale})` }} />
    </div>
  );
}

/** Tab 2: blank register (CSV or printable) and the guest check-in card. */
export function TemplatesTab({ lists, defaultProperty }: { lists: Lists; defaultProperty: string }) {
  const T = copy.templates;
  const [format, setFormat] = useState<"csv" | "printable">("csv");
  const [example, setExample] = useState(false);
  const [property, setProperty] = useState(defaultProperty === "My property" ? "" : defaultProperty);
  const register = blankPrintable(lists, property, example);
  const card = checkInCard(lists, property);
  const slug = property.trim() ? fileSlug(property) : "blank";

  const downloadRegister = () => {
    if (format === "csv") downloadText(`guest-register-${slug}.csv`, blankCsv(example), "text/csv");
    else downloadText(`guest-register-${slug}-printable.html`, register, "text/html");
    track("template_downloaded", toolSlug, { type: format === "csv" ? "register-csv" : "register-print" });
  };
  const downloadCard = () => {
    downloadText(`guest-check-in-card-${slug}.html`, card, "text/html");
    track("template_downloaded", toolSlug, { type: "checkin-card" });
  };

  return (
    <div className="grid gap-5 rounded-[20px] border border-line bg-white p-5 md:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <fieldset className="m-0 min-w-0 border-none p-0">
          <legend className="mb-2 p-0 text-[15px] font-bold">{T.format}</legend>
          <div className="flex flex-wrap gap-2">
            {(["csv", "printable"] as const).map((v) => (
              <label key={v} className={chip}>
                <input type="radio" name="template-format" checked={format === v} onChange={() => setFormat(v)} className="size-4 accent-ink" />
                {v === "csv" ? T.csv : T.printable}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-1.5">
          <label htmlFor="template-property" className="text-[15px] font-bold">
            {T.property}
          </label>
          <input id="template-property" className="field min-h-12" value={property} maxLength={60} onChange={(e) => setProperty(e.target.value)} placeholder="For example: Flat 2, Leith" />
        </div>
      </div>
      <Toggle label={T.example} checked={example} onChange={setExample} hint="Marked “EXAMPLE – delete”." />

      <div className="grid gap-5 md:grid-cols-2">
        <div className="grid content-start gap-3">
          <h3 className="m-0 text-lg font-extrabold">{T.blank}</h3>
          <p className="m-0 text-sm text-ink-copy">
            {format === "csv" ? "Opens in Excel, Numbers or Google Sheets. One row per adult guest." : "A4 landscape, 15 rows, with what to record in the footer."}
          </p>
          <p className="m-0 text-xs font-extrabold tracking-[1px] text-muted uppercase">{T.preview}</p>
          {format === "csv" ? (
            <div className="overflow-x-auto rounded-[10px] border border-line" role="region" aria-label="Spreadsheet preview" tabIndex={0}>
              <table className="border-collapse text-[11px] whitespace-nowrap">
                <thead>
                  <tr className="bg-cloud">
                    {registerColumns.map((c) => (
                      <th key={c} className="border-r border-line px-2 py-1.5 text-left font-extrabold">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className={cn(example && "text-brand italic")}>
                    {(example ? exampleRow : registerColumns.map(() => "")).map((c, i) => (
                      <td key={i} className="h-7 border-t border-r border-line px-2">
                        {c}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <Preview html={register} title="Blank register preview" landscape />
          )}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={downloadRegister} className="btn btn-ink min-h-11">
              {T.download} {format === "csv" ? "spreadsheet" : "register"}
            </button>
            {format === "printable" && (
              <button type="button" onClick={() => printHtml(register)} className="btn btn-outline min-h-11">
                {T.print}
              </button>
            )}
          </div>
        </div>
        <div className="grid content-start gap-3">
          <h3 className="m-0 text-lg font-extrabold">{T.card}</h3>
          <p className="m-0 text-sm text-ink-copy">A4 page a guest fills in by hand. The extra box is only for guests who aren’t British, Irish or Commonwealth citizens.</p>
          <p className="m-0 text-xs font-extrabold tracking-[1px] text-muted uppercase">{T.preview}</p>
          <Preview html={card} title="Check-in card preview" />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={downloadCard} className="btn btn-ink min-h-11">
              {T.download} check-in card
            </button>
            <button type="button" onClick={() => printHtml(card)} className="btn btn-outline min-h-11">
              {T.print}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
