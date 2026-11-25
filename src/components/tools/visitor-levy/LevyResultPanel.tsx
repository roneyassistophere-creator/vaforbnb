"use client";

import { copy } from "@/content/tools/visitorLevy";
import { cn } from "@/lib/cn";
import { formatWeekday } from "@/lib/tools/dates";
import { formatPence, statusText, type Area, type LevyResult, type LevyStatus, type Night } from "@/lib/tools/visitor-levy";
import { CopyButton } from "../CopyButton";
import { pillTones, type PillTone } from "../StatusPill";

const tone: Record<LevyStatus, PillTone> = { inForce: "pass", partly: "notYet", notInForce: "notYet", exempt: "neutral" };
const C = copy.result;

export function LevyStatusPill({ result }: { result: LevyResult }) {
  const t = pillTones[tone[result.status]];
  return (
    <span className="inline-flex min-h-9 items-center gap-2 rounded-full px-3.5 text-sm font-extrabold" style={{ background: t.bg, color: t.fg }}>
      <span aria-hidden="true" className="flex size-5 items-center justify-center rounded-full text-[11px] text-white" style={{ background: t.fg }}>
        {result.status === "inForce" ? "✓" : result.status === "exempt" ? "–" : "!"}
      </span>
      {statusText(result)}
    </span>
  );
}

const nightLook: Record<Night["status"], { box: string; text: (n: Night, i: number, cap: number | null) => string }> = {
  charged: { box: "border-ink bg-white", text: (n) => `Charged ${formatPence(n.levyPence ?? 0)}` },
  capped: { box: "border-line bg-cloud text-muted", text: (_n, _i, cap) => (cap ? `Not charged (after night ${cap})` : "Not charged") },
  notInForce: { box: "border-dashed border-[#C68A00] bg-amber-25 text-[#6B4A00]", text: () => "Not in force yet" },
  exempt: { box: "border-line bg-cloud text-muted", text: () => "Exempt" },
};

function NightStrip({ nights, cap }: { nights: Night[]; cap: number | null }) {
  return (
    <div className="mt-4">
      <h3 className="m-0 mb-2 text-xs font-extrabold tracking-[1.2px] text-muted uppercase">{C.nightsTitle}</h3>
      <ol className="m-0 flex max-h-[260px] list-none gap-2 overflow-x-auto overscroll-contain p-0 pb-2" aria-label="Night by night" tabIndex={0} data-night-strip>
        {nights.map((n, i) => {
          const look = nightLook[n.status];
          return (
            <li key={n.date} className={cn("flex w-[104px] flex-none flex-col gap-1 rounded-[12px] border-[1.5px] px-2.5 py-2 text-[12px] leading-tight", look.box)}>
              <span className="font-extrabold text-ink">Night {i + 1}</span>
              <span className="font-semibold">{formatWeekday(n.date, false)}</span>
              <span className="font-bold">{look.text(n, i, cap)}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Big figure, status, night strip, breakdown, guest total, official link and actions. */
export function LevyResultPanel({
  area,
  result,
  message,
  copyText,
  reference,
  onReference,
  onAdd,
  editing,
  onCancelEdit,
  logMessage,
}: {
  area: Area;
  result: LevyResult | null;
  message: string;
  copyText: () => string;
  reference: string;
  onReference: (v: string) => void;
  onAdd: () => void;
  editing: boolean;
  onCancelEdit: () => void;
  logMessage: string;
}) {
  const r = result;
  const n = r?.nights.length ?? 0;
  return (
    <section aria-labelledby="levy-result" className="rounded-[20px] border border-line bg-white p-5 md:p-6" data-result-panel>
      <h2 id="levy-result" className="m-0 text-xs font-extrabold tracking-[1.2px] text-muted uppercase">
        {C.title} · {area.name}
      </h2>
      <div aria-live="polite" aria-atomic="true">
        <p className="m-0 mt-2 text-[44px] leading-none font-extrabold tracking-[-1.5px] text-ink tabular-nums md:text-[52px]" data-levy-total>
          <span className="sr-only-label">{C.title}: </span>
          {r ? formatPence(r.totalPence) : "—"}
        </p>
        {r ? (
          <p className="m-0 mt-2 text-sm text-ink-copy">
            {formatPence(r.perNightPence)} per night across {n} {n === 1 ? "night" : "nights"} · charged on {r.chargeable.length} {r.chargeable.length === 1 ? "night" : "nights"}
          </p>
        ) : (
          <p className="m-0 mt-2 text-sm text-muted">{message}</p>
        )}
      </div>

      {r && (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            <LevyStatusPill result={r} />
          </div>
          {r.exemptReason && <p className="m-0 mt-3 text-sm font-bold text-ink">{r.exemptReason}</p>}
          <NightStrip nights={r.nights} cap={area.type === "percent" ? area.nightCap : area.maxNightsCharged} />
          {(r.lines.length > 0 || r.notes.length > 0) && (
            <ul className="m-0 mt-3 grid list-none gap-1.5 p-0 text-sm text-ink-copy">
              {r.lines.map((l) => (
                <li key={l} className="font-semibold text-ink tabular-nums">
                  {l}
                </li>
              ))}
              {r.notes.map((l) => (
                <li key={l} className="rounded-[10px] bg-cloud px-3 py-2">
                  {l}
                </li>
              ))}
            </ul>
          )}
          {r.stayPricePence !== null && r.totalPence > 0 && (
            <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-3 rounded-[12px] bg-sand px-4 py-3">
              <span className="text-sm font-bold text-ink">{C.guestPays}</span>
              <span className="text-xl font-extrabold text-ink tabular-nums">{formatPence(r.stayPricePence + r.totalPence)}</span>
              <span className="basis-full text-[13px] text-muted">{C.guestPaysHint}</span>
            </div>
          )}
        </>
      )}

      {area.url && (
        <a href={area.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-brand">
          {area.name} {C.guidance} →<span className="sr-only-label"> (opens in a new tab)</span>
        </a>
      )}

      {r && (
        <div className="mt-2 grid gap-3 border-t border-line pt-4">
          <label className="grid gap-1.5 text-sm font-bold">
            {C.reference}
            <input className="field min-h-11" value={reference} maxLength={80} placeholder={C.referencePlaceholder} onChange={(e) => onReference(e.target.value)} />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onAdd} className="btn btn-ink min-h-11">
              {editing ? C.update : C.add}
            </button>
            {editing && (
              <button type="button" onClick={onCancelEdit} className="btn btn-outline min-h-11">
                {C.cancelEdit}
              </button>
            )}
            <CopyButton label={C.copy} copiedLabel={C.copied} getText={copyText} className="min-h-11" />
          </div>
          <p aria-live="polite" className="m-0 min-h-5 text-sm font-bold text-green">
            {logMessage}
          </p>
        </div>
      )}
    </section>
  );
}
