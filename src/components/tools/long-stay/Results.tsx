"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { copy, rulesHref } from "@/content/tools/longStay";
import { cn } from "@/lib/cn";
import { money, percent } from "@/lib/tools/format";
import { breakEvenDiscountText, breakEvenOccupancyText, compareStays, headline, parseForm, turnoversText, type Better, type Content, type Inputs, type Result, type Scenario, type SensitivityRow } from "@/lib/tools/long-stay";
import { CopyButton } from "../CopyButton";

const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (m, k: string) => (k in v ? String(v[k]) : m));

/* Words always carry the result; colour only supports it (AA contrast). */
export const tone: Record<Better, { bg: string; fg: string; icon: string }> = {
  long: { bg: "#E3F2EA", fg: "#1F6B45", icon: "↑" },
  short: { bg: "#FFF2CC", fg: "#6B4A00", icon: "↓" },
  same: { bg: "#F2F4F6", fg: "#46525C", icon: "≈" },
};

export function Headline({ r, compact }: { r: Result; compact?: boolean }) {
  const t = tone[r.better];
  return (
    <p className={cn("m-0 inline-flex items-center gap-2 rounded-full font-extrabold", compact ? "min-h-9 px-3 text-sm" : "min-h-12 px-5 text-lg")} style={{ background: t.bg, color: t.fg }} data-headline={r.better}>
      <span aria-hidden="true" className={cn("flex items-center justify-center rounded-full text-white", compact ? "size-5 text-[11px]" : "size-6 text-sm")} style={{ background: t.fg }}>
        {t.icon}
      </span>
      {headline(r)}
    </p>
  );
}

function Card({ title, rows, net }: { title: string; rows: [string, string][]; net: number }) {
  return (
    <div className="grid content-start gap-1.5 rounded-[16px] bg-cloud-2 p-4">
      <p className="m-0 text-[13px] font-extrabold tracking-[0.6px] text-muted uppercase">{title}</p>
      {rows.map(([k, v]) => (
        <p key={k} className="m-0 flex justify-between gap-2 text-sm text-ink-copy">
          <span>{k}</span>
          <span className="font-bold text-ink tabular-nums">{v}</span>
        </p>
      ))}
      <p className="m-0 mt-1 flex justify-between gap-2 border-t border-line pt-2 text-[15px] font-extrabold text-ink">
        <span>{copy.result.net}</span>
        <span className="tabular-nums">{money(net)}</span>
      </p>
    </div>
  );
}

export function ResultPanel({ i, r, copyText, onSave, saveMsg, full }: { i: Inputs | null; r: Result | null; copyText: () => string; onSave: (name: string) => void; saveMsg: string; full: boolean }) {
  const [name, setName] = useState("");
  if (!i || !r)
    return (
      <div className="rounded-[20px] border border-line bg-white p-5 md:p-6" data-result>
        <p className="m-0 text-[15px] font-bold text-brand" role="status">
          {copy.result.invalid}
        </p>
      </div>
    );
  const save = (e: FormEvent) => {
    e.preventDefault();
    onSave(name);
    setName("");
  };
  return (
    <section className="grid gap-4 rounded-[20px] border border-line bg-white p-5 md:p-6" aria-label={copy.result.heading} data-result>
      <Headline r={r} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Card
          title={copy.result.short}
          rows={[
            [copy.result.nightsBooked, r.shortNights.toFixed(1)],
            [copy.result.stays, r.shortStays.toFixed(1)],
          ]}
          net={r.shortNet}
        />
        <Card
          title={copy.result.long}
          rows={[
            [copy.result.nights, String(i.periodNights)],
            [copy.result.guestRate, `${money(r.guestNightly)} a night`],
          ]}
          net={r.longNet}
        />
      </div>
      <ul className="m-0 grid list-none gap-1.5 p-0 text-[15px] leading-[1.55] text-ink-copy">
        <li data-break-even-discount>{breakEvenDiscountText(r)}</li>
        <li data-break-even-occupancy>{breakEvenOccupancyText(r)}</li>
        <li data-turnovers>{turnoversText(r)}</li>
        <li className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-ink">{copy.threshold[r.thresholdLabel]}</span>
          {r.highlighted && <span className="rounded-md bg-green-100 px-2 py-[3px] text-[12px] font-extrabold text-green">✓ {copy.discount.badge}</span>}
        </li>
      </ul>
      {r.notes.length > 0 && (
        <ul className="m-0 grid list-none gap-2 p-0" data-notes>
          {r.notes.map((n) => (
            <li key={n} className="rounded-[12px] bg-amber-25 px-3.5 py-2.5 text-sm leading-[1.55] text-ink-copy" data-note={n}>
              {copy.notes[n]}{" "}
              {(n === "london90" || n === "londonCounts" || n === "tenancy") && (
                <Link href={n === "tenancy" ? rulesHref.tenancy : rulesHref.london} className="font-bold text-brand">
                  {copy.notes.rulesLink} →
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
      {full && (
        <div className="grid gap-3 border-t border-line pt-3">
          <CopyButton getText={copyText} label={copy.result.copy} copiedLabel="Copied" className="min-h-11 justify-self-start" />
          <form onSubmit={save} className="flex flex-wrap items-end gap-2">
            <div className="grid min-w-[180px] flex-1 gap-1.5">
              <label htmlFor="ls-scenario-name" className="text-sm font-bold text-ink">
                {copy.scenarios.nameLabel}
              </label>
              <input id="ls-scenario-name" type="text" className="field min-h-11" value={name} maxLength={40} placeholder={copy.scenarios.namePlaceholder} onChange={(e) => setName(e.target.value)} autoComplete="off" />
            </div>
            <button type="submit" className="btn btn-outline min-h-11" data-save-scenario>
              {copy.result.save}
            </button>
          </form>
          {saveMsg && (
            <p className="m-0 text-sm font-bold text-green" role="status">
              {saveMsg}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

/** Two horizontal bars on the same £ scale, labelled, with a thin line at the long-stay net at the break-even discount. */
export function Chart({ r }: { r: Result }) {
  const max = Math.max(r.shortNet, r.longNet, r.longNetAtBreakEven, 1);
  const w = (v: number) => `${Math.max(0, (v / max) * 100)}%`;
  const alt = fill(copy.chart.alt, { short: money(r.shortNet, 0), long: money(r.longNet, 0) });
  const bars: [string, number, string][] = [
    [copy.result.short, r.shortNet, r.better === "short" ? "#B8383A" : "#9AA6AF"],
    [copy.result.long, r.longNet, r.better === "long" ? "#1F6B45" : "#9AA6AF"],
  ];
  return (
    <figure className="m-0 grid gap-3" data-chart>
      <figcaption className="text-[15px] font-extrabold text-ink">{copy.chart.heading}</figcaption>
      <div className="relative grid gap-3" role="img" aria-label={alt}>
        {bars.map(([label, v, c]) => (
          <div key={label} className="grid gap-1">
            <p className="m-0 flex justify-between text-sm font-bold text-ink-copy" aria-hidden="true">
              <span>{label}</span>
              <span className="tabular-nums">{money(v, 0)}</span>
            </p>
            <div className="h-7 rounded-[8px] bg-fog">
              <div className="h-full rounded-[8px] transition-[width]" style={{ width: w(v), background: c }} data-bar={label} />
            </div>
          </div>
        ))}
        {r.breakEvenDiscount.edge === "none" && (
          <div className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-ink" style={{ left: w(r.longNetAtBreakEven) }} aria-hidden="true" data-break-even-line />
        )}
      </div>
      <p className="m-0 text-[13px] text-muted">
        {alt}
        {r.breakEvenDiscount.edge === "none" && (
          <>
            {" "}
            <span aria-hidden="true">│</span> {copy.chart.breakEven}: {money(r.longNetAtBreakEven, 0)} ({percent(r.breakEvenDiscount.value)}).
          </>
        )}
      </p>
    </figure>
  );
}

export function SensitivityTable({ rows }: { rows: SensitivityRow[] }) {
  return (
    <div className="grid gap-2">
      <h3 className="m-0 text-[15px] font-extrabold text-ink">{copy.table.heading}</h3>
      <div className="max-w-full overflow-x-auto rounded-[14px] border border-line" tabIndex={0} role="region" aria-label={copy.table.heading} data-table-scroll>
        <table className="w-full min-w-[460px] border-collapse text-left text-sm">
          <thead className="bg-cloud-2 text-[12px] tracking-[0.6px] text-muted uppercase">
            <tr>
              <th className="px-3 py-2.5 font-extrabold">{copy.table.discount}</th>
              <th className="px-3 py-2.5 text-right font-extrabold">{copy.table.longNet}</th>
              <th className="px-3 py-2.5 text-right font-extrabold">{copy.table.difference}</th>
              <th className="px-3 py-2.5 font-extrabold">{copy.table.better}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.discount} className={cn("border-t border-line", row.own && "bg-coral-50 font-bold")} data-row={Math.round(row.discount * 1000) / 10} data-own={row.own ? "" : undefined}>
                <th scope="row" className="px-3 py-2.5 font-bold text-ink">
                  {percent(row.discount)}
                  {row.own && <span className="ml-1.5 text-[12px] font-extrabold text-brand">({copy.table.yours})</span>}
                </th>
                <td className="px-3 py-2.5 text-right tabular-nums">{money(row.longNet)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{money(row.difference)}</td>
                <td className="px-3 py-2.5">
                  <span className="rounded-md px-2 py-[2px] text-[12px] font-extrabold" style={{ background: tone[row.better].bg, color: tone[row.better].fg }}>
                    {copy.table[row.better]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Saved scenarios: up to 3 side by side (inputs and key results), with load and delete. */
export function Scenarios({ list, content, onLoad, onDelete }: { list: Scenario[]; content: Content; onLoad: (s: Scenario) => void; onDelete: (id: string) => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const max = content.settings.compareMax;
  const shown = (picked.length ? list.filter((s) => picked.includes(s.id)) : list.slice(-max)).slice(0, max);
  return (
    <section className="grid gap-3 rounded-[20px] border border-line bg-white p-5 md:p-6" aria-label={copy.scenarios.heading} data-scenarios>
      <h3 className="m-0 text-lg font-extrabold text-ink">{copy.scenarios.heading}</h3>
      {!list.length ? (
        <p className="m-0 text-sm text-muted">{copy.scenarios.empty}</p>
      ) : (
        <>
          <fieldset className="m-0 border-none p-0">
            <legend className="mb-1.5 p-0 text-sm font-bold text-ink">{fill(copy.scenarios.compare, { n: max })}</legend>
            <div className="flex flex-wrap gap-2">
              {list.map((s) => {
                const on = shown.some((x) => x.id === s.id);
                return (
                  <label key={s.id} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-line bg-white px-4 text-sm font-semibold has-checked:border-ink has-checked:bg-sand">
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={!on && shown.length >= max}
                      onChange={() => setPicked((p) => (on ? shown.filter((x) => x.id !== s.id).map((x) => x.id) : [...(p.length ? p : shown.map((x) => x.id)), s.id].slice(-max)))}
                      className="size-4 accent-ink"
                    />
                    {s.name}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <ol className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-3" data-compare>
            {shown.map((s) => {
              const { inputs } = parseForm(s.form, content);
              const r = inputs ? compareStays(inputs, content) : null;
              return (
                <li key={s.id} className="grid content-start gap-2 rounded-[16px] border border-line p-4" data-scenario={s.name}>
                  <p className="m-0 text-[15px] font-extrabold text-ink">{s.name}</p>
                  {inputs && r && (
                    <>
                      <Headline r={r} compact />
                      <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px] text-ink-copy">
                        <dt>Rate</dt>
                        <dd className="m-0 text-right font-bold tabular-nums">{money(inputs.nightlyRate)}</dd>
                        <dt>Period</dt>
                        <dd className="m-0 text-right font-bold tabular-nums">{inputs.periodNights} nights</dd>
                        <dt>Discount</dt>
                        <dd className="m-0 text-right font-bold tabular-nums">{percent(inputs.discount)}</dd>
                        <dt>Occupancy</dt>
                        <dd className="m-0 text-right font-bold tabular-nums">{percent(inputs.occupancy)}</dd>
                        <dt>Short net</dt>
                        <dd className="m-0 text-right font-bold tabular-nums">{money(r.shortNet)}</dd>
                        <dt>Long net</dt>
                        <dd className="m-0 text-right font-bold tabular-nums">{money(r.longNet)}</dd>
                        <dt>Break-even</dt>
                        <dd className="m-0 text-right font-bold tabular-nums">{percent(r.breakEvenDiscount.value)}</dd>
                      </dl>
                    </>
                  )}
                  <div className="mt-1 flex flex-wrap gap-2">
                    <button type="button" className="btn btn-outline min-h-11 flex-1" onClick={() => onLoad(s)}>
                      {copy.scenarios.load}
                    </button>
                    <button type="button" className="btn btn-outline min-h-11" onClick={() => onDelete(s.id)} aria-label={`${copy.scenarios.remove}: ${s.name}`}>
                      {copy.scenarios.remove}
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
          {list.length >= content.settings.maxScenarios && <p className="m-0 text-[13px] text-muted">{fill(copy.scenarios.full, { n: content.settings.maxScenarios })}</p>}
        </>
      )}
    </section>
  );
}
