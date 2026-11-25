"use client";

import { copy } from "@/content/tools/certificateReminders";
import { fillTemplate, numberListFigure, type Figures } from "@/lib/tools/figures";
import { reminderDays, type Settings } from "@/lib/tools/certificates";
import { CopyButton } from "../CopyButton";
import { Toggle } from "../Toggle";

/** Reminder settings, then the calendar download and the other actions. */
export function ActionsPanel({
  settings,
  figures,
  onSettings,
  multiple,
  events,
  onDownload,
  onCsv,
  summary,
  onPrint,
}: {
  settings: Settings;
  figures: Figures;
  onSettings: (s: Partial<Settings>) => void;
  multiple: boolean;
  events: number;
  onDownload: () => void;
  onCsv: () => void;
  summary: () => string;
  onPrint: () => void;
}) {
  const A = copy.actions;
  const options = numberListFigure(figures, "cert.reminderDaysOptions");
  const chosen = reminderDays(figures, settings.remindDays);
  return (
    <section aria-labelledby="cert-actions" className="rounded-[20px] border border-line bg-white p-5 md:p-6">
      <h2 id="cert-actions" className="m-0 mb-4 text-base font-extrabold">
        {A.title}
      </h2>
      <div className="grid gap-3">
        <label className="grid gap-1.5 text-sm font-bold">
          {A.remind}
          <select className="field min-h-12" value={chosen} onChange={(e) => onSettings({ remindDays: Number(e.target.value) })}>
            {[...new Set([chosen, ...options])]
              .sort((a, b) => b - a)
              .map((d) => (
                <option key={d} value={d}>
                  {d} days before
                </option>
              ))}
          </select>
        </label>
        <Toggle label={fillTemplate(A.secondReminder, figures)} checked={settings.secondReminder} onChange={(v) => onSettings({ secondReminder: v })} />
        <Toggle label={A.includeOverdue} hint={A.includeOverdueHint} checked={settings.includeOverdue} onChange={(v) => onSettings({ includeOverdue: v })} />
        {multiple && (
          <fieldset className="m-0 min-w-0 border-none p-0">
            <legend className="mb-2 p-0 text-sm font-bold">{A.scope}</legend>
            <div className="flex flex-wrap gap-2">
              {(["property", "all"] as const).map((v) => (
                <label
                  key={v}
                  className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-line px-4 text-sm font-semibold has-checked:border-ink has-checked:bg-sand has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
                >
                  <input type="radio" name="cert-scope" checked={settings.scope === v} onChange={() => onSettings({ scope: v })} className="size-4 accent-ink" />
                  {v === "property" ? A.scopeOne : A.scopeAll}
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </div>

      <div className="mt-5 border-t border-line pt-5">
        <button type="button" onClick={onDownload} disabled={events === 0} className="btn btn-coral min-h-12 w-full disabled:cursor-not-allowed disabled:opacity-50">
          {A.download}
          {events > 0 && <span className="font-semibold"> ({events} {events === 1 ? "reminder" : "reminders"})</span>}
        </button>
        <p className="m-0 mt-2 text-[13px] leading-[1.5] text-muted">{events === 0 ? A.none : A.works}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={onCsv} className="btn btn-outline min-h-11">
            {A.csv}
          </button>
          <CopyButton label={A.copy} copiedLabel={A.copied} getText={summary} className="min-h-11" />
          <button type="button" onClick={onPrint} className="btn btn-outline min-h-11">
            {A.print}
          </button>
        </div>
      </div>
    </section>
  );
}
