"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { Num } from "@/components/tools/profit/Fields";
import { YearCalendar, type DayKindStyle } from "@/components/tools/YearCalendar";
import { cn } from "@/lib/cn";
import { formatMedium } from "@/lib/tools/dates";
import { money } from "@/lib/tools/format";
import {
  adrText,
  beforeAfter,
  kpis,
  pct1,
  revparBreakdown,
  signedMoney,
  signedPct,
  signedPts,
  summarySentence,
  validateQuick,
  type BookingResult,
  type Comparison,
  type Content,
  type Kpis,
  type QuickIn,
  type TargetGap,
} from "@/lib/tools/booking-performance";

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "▲ +10.0 pts up" / "▼ −£10.00 down" (arrow and word, not colour alone). */
function Delta({ value, text, vs }: { value: number; text: string; vs: string }) {
  if (Math.abs(value) < 1e-9) return <span className="text-[12px] font-bold text-muted">No change {vs}</span>;
  const up = value > 0;
  return (
    <span className={cn("text-[12px] font-bold", up ? "text-green" : "text-brand")} data-delta>
      <span aria-hidden="true">{up ? "▲" : "▼"} </span>
      {text} {up ? "up" : "down"} {vs}
    </span>
  );
}

/* ---- KPI tiles ------------------------------------------------------------------------- */

export function Tiles({ k, cmp, vs = "vs last year" }: { k: Kpis | null; cmp: Comparison | null; vs?: string }) {
  if (!k)
    return (
      <p className="m-0 rounded-[14px] bg-amber-25 px-4 py-3 text-sm font-bold" data-no-result>
        Fix the fields marked in red to see your numbers.
      </p>
    );
  const extra = [k.netRevpar !== null ? `Net RevPAR ${money(k.netRevpar)}` : "", k.trevpar !== null ? `TRevPAR ${money(k.trevpar)}` : "", k.alos !== null ? `Avg stay ${k.alos.toFixed(1)} nights` : ""].filter(Boolean);
  return (
    <section aria-label="Your numbers" className="grid gap-3 rounded-[22px] border border-ink bg-white p-5" data-tiles>
      <div className="grid grid-cols-3 gap-2" aria-live="polite" aria-atomic="true">
        {(
          [
            ["occupancy", "Occupancy", pct1(k.occupancy), cmp ? <Delta value={cmp.occPoints} text={signedPts(cmp.occPoints)} vs={vs} /> : null],
            ["adr", "ADR", adrText(k), cmp?.adr ? <Delta value={cmp.adr.abs} text={signedMoney(cmp.adr.abs)} vs={vs} /> : null],
            ["revpar", "RevPAR", money(k.revpar), cmp ? <Delta value={cmp.revpar.abs} text={signedMoney(cmp.revpar.abs)} vs={vs} /> : null],
          ] as [string, string, string, ReactNode][]
        ).map(([id, label, value, delta]) => (
          <div key={id} className="grid content-start gap-0.5 rounded-[14px] bg-cloud-2 p-3" data-tile={id}>
            <span className="text-[12px] font-bold text-ink-copy">{label}</span>
            <span className="text-[20px] leading-[1.15] font-extrabold tabular-nums md:text-[24px]" data-value>
              {value}
            </span>
            {delta}
          </div>
        ))}
      </div>
      {extra.length > 0 && (
        <p className="m-0 text-[13px] font-semibold text-ink-copy tabular-nums" data-extra>
          {extra.join(" · ")}
        </p>
      )}
    </section>
  );
}

export function MobileBar({ k }: { k: Kpis }) {
  return (
    <div className="sticky top-0 z-20 -mx-4 border-b border-ink bg-white px-4 py-2 text-center text-[14px] font-extrabold tabular-nums shadow-[0_6px_16px_rgba(20,33,43,0.08)] lg:hidden" data-mobile-bar>
      Occ {pct1(k.occupancy)} · ADR {adrText(k)} · RevPAR {money(k.revpar)}
    </div>
  );
}

/* ---- Tabs ---------------------------------------------------------------------------- */

export type TabId = "overview" | "compare" | "charts" | "calendar" | "portfolio";
const LABEL: Record<TabId, string> = { overview: "Overview", compare: "Compare", charts: "Charts", calendar: "Calendar", portfolio: "Portfolio" };

export function Tabs({ tabs, active, onChange, children }: { tabs: TabId[]; active: TabId; onChange: (t: TabId) => void; children: ReactNode }) {
  const onKey = (e: KeyboardEvent, i: number) => {
    const n = e.key === "ArrowRight" ? (i + 1) % tabs.length : e.key === "ArrowLeft" ? (i - 1 + tabs.length) % tabs.length : -1;
    if (n < 0) return;
    e.preventDefault();
    onChange(tabs[n]);
    document.getElementById(`bp-tab-${tabs[n]}`)?.focus();
  };
  return (
    <div className="grid min-w-0 gap-4">
      <div role="tablist" aria-label="Results" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        {tabs.map((t, i) => (
          <button key={t} id={`bp-tab-${t}`} type="button" role="tab" aria-selected={active === t} aria-controls={`bp-panel-${t}`} tabIndex={active === t ? 0 : -1} onKeyDown={(e) => onKey(e, i)} onClick={() => onChange(t)} className={cn("min-h-11 flex-none rounded-full border-[1.5px] px-4 text-sm font-bold", active === t ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink")} data-tab={t}>
            {LABEL[t]}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`bp-panel-${active}`} aria-labelledby={`bp-tab-${active}`} className="min-w-0" data-panel={active}>
        {children}
      </div>
    </div>
  );
}

const Card = ({ children, className }: { children: ReactNode; className?: string }) => <div className={cn("grid min-w-0 gap-4 rounded-[18px] border border-line bg-white p-5", className)}>{children}</div>;
const H3 = ({ children }: { children: ReactNode }) => <h3 className="m-0 text-lg font-extrabold">{children}</h3>;

/* Overview ------------------------------------------------------------------------------ */

export function Overview({ k, bookings }: { k: Kpis; bookings: BookingResult | null }) {
  const rows: [string, string][] = [
    ["Nights in the period", String(k.periodNights)],
    ["Blocked by you", String(k.blocked)],
    ["Available nights", String(k.available)],
    ["Booked nights", String(k.booked)],
    ["Accommodation revenue", money(k.revenue)],
  ];
  if (k.alos !== null) rows.push(["Average length of stay", `${k.alos.toFixed(2)} nights`]);
  if (bookings?.leadTime != null) rows.push(["Average lead time", `${bookings.leadTime.toFixed(1)} days`]);
  return (
    <div className="grid gap-4">
      <p className="m-0 rounded-[18px] bg-sand px-5 py-4 text-[16px] leading-[1.6] font-semibold" data-summary>
        {summarySentence(k)}
      </p>
      <Card>
        <H3>Details</H3>
        <table className="w-full border-collapse text-sm" data-details>
          <tbody>
            {rows.map(([a, b]) => (
              <tr key={a} className="border-t border-line">
                <th scope="row" className="py-1.5 text-left font-normal text-ink-copy">
                  {a}
                </th>
                <td className="py-1.5 text-right font-bold tabular-nums">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings && bookings.channelMix.length > 0 && (
          <div className="-mx-5 overflow-x-auto px-5">
            <table className="w-full min-w-[380px] border-collapse text-sm" data-channel-mix>
              <caption className="mb-1 text-left text-[13px] font-extrabold tracking-[0.6px] text-muted uppercase">Channel mix</caption>
              <thead className="text-[12px] text-muted uppercase">
                <tr>
                  <th className="py-1.5 text-left">Channel</th>
                  <th className="py-1.5 pl-4 text-right">Nights</th>
                  <th className="py-1.5 pl-4 text-right">Revenue</th>
                  <th className="py-1.5 pl-4 text-right">Share</th>
                </tr>
              </thead>
              <tbody>
                {bookings.channelMix.map((c) => (
                  <tr key={c.channel} className="border-t border-line">
                    <th scope="row" className="py-1.5 text-left">
                      {c.channel}
                    </th>
                    <td className="py-1.5 pl-4 text-right tabular-nums">{c.nights}</td>
                    <td className="py-1.5 pl-4 text-right tabular-nums">{money(c.revenue)}</td>
                    <td className="py-1.5 pl-4 text-right tabular-nums">{pct1(c.revenueShare)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

/* Compare ------------------------------------------------------------------------------- */

export function Compare({ k, before, cmp, target, ba, setBa, c, onVerdict }: { k: Kpis; before: Kpis | null; cmp: Comparison | null; target: TargetGap | null; ba: { before: QuickIn; after: QuickIn }; setBa: (v: { before: QuickIn; after: QuickIn }) => void; c: Content; onVerdict: (v: string) => void }) {
  const br = before ? revparBreakdown(k, before) : null;
  const errB = validateQuick(ba.before, "b.");
  const errA = validateQuick(ba.after, "a.");
  const okBA = !Object.keys(errB).length && !Object.keys(errA).length && ba.before.booked + ba.after.booked > 0;
  const res = okBA ? beforeAfter(kpis(ba.before), kpis(ba.after), c) : null;
  const w = c.wording.beforeAfter;
  const pill = res ? (res.verdict === "worked" ? w.worked.replace("{x}", money(res.delta)).replace("{y}", res.pct === null ? "–" : (res.pct * 100).toFixed(1)) : res.verdict === "didnt" ? w.didnt : w.none) : "";
  const period = (which: "before" | "after", label: string) => {
    const v = ba[which];
    const e = which === "before" ? errB : errA;
    const p = which === "before" ? "b." : "a.";
    const upd = (patch: Partial<QuickIn>) => {
      const next = { ...ba, [which]: { ...v, ...patch } };
      setBa(next);
      if (!Object.keys(validateQuick(next.before)).length && !Object.keys(validateQuick(next.after)).length) onVerdict(beforeAfter(kpis(next.before), kpis(next.after), c).verdict);
    };
    return (
      <fieldset className="m-0 grid min-w-0 gap-3 rounded-[14px] bg-cloud-2 p-3">
        <legend className="mb-2 p-0 text-sm font-extrabold">{label}</legend>
        <div className="grid grid-cols-2 gap-3">
          <Num id={`${p}nights`} label="Nights" value={v.nights} onChange={(nights) => upd({ nights })} error={e[`${p}nights`]} />
          <Num id={`${p}booked`} label="Booked" value={v.booked} onChange={(booked) => upd({ booked })} error={e[`${p}booked`]} />
          <Num id={`${p}blocked`} label="Blocked" value={v.blocked} onChange={(blocked) => upd({ blocked })} error={e[`${p}blocked`] ?? e[`${p}available`]} />
          <Num id={`${p}revenue`} label="Revenue" prefix="£" value={v.revenue} onChange={(revenue) => upd({ revenue })} error={e[`${p}revenue`]} />
        </div>
      </fieldset>
    );
  };
  return (
    <div className="grid gap-4">
      {before && cmp && br ? (
        <Card>
          <H3>This period vs last year</H3>
          <div className="-mx-5 overflow-x-auto px-5">
            <table className="w-full min-w-[420px] border-collapse text-sm" data-yoy>
              <thead className="text-[12px] text-muted uppercase">
                <tr>
                  <th className="py-1.5 text-left" />
                  <th className="py-1.5 pl-4 text-right">Now</th>
                  <th className="py-1.5 pl-4 text-right">Last year</th>
                  <th className="py-1.5 pl-4 text-right">Change</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-line">
                  <th scope="row" className="py-1.5 text-left">Occupancy</th>
                  <td className="py-1.5 pl-4 text-right tabular-nums">{pct1(k.occupancy)}</td>
                  <td className="py-1.5 pl-4 text-right tabular-nums">{pct1(before.occupancy)}</td>
                  <td className="py-1.5 pl-4 text-right font-bold tabular-nums whitespace-nowrap">{signedPts(cmp.occPoints)}</td>
                </tr>
                <tr className="border-t border-line">
                  <th scope="row" className="py-1.5 text-left">ADR</th>
                  <td className="py-1.5 pl-4 text-right tabular-nums">{adrText(k)}</td>
                  <td className="py-1.5 pl-4 text-right tabular-nums">{adrText(before)}</td>
                  <td className="py-1.5 pl-4 text-right font-bold tabular-nums whitespace-nowrap">{cmp.adr ? `${signedMoney(cmp.adr.abs)} (${signedPct(cmp.adr.pct)})` : "–"}</td>
                </tr>
                <tr className="border-t border-line">
                  <th scope="row" className="py-1.5 text-left">RevPAR</th>
                  <td className="py-1.5 pl-4 text-right tabular-nums">{money(k.revpar)}</td>
                  <td className="py-1.5 pl-4 text-right tabular-nums">{money(before.revpar)}</td>
                  <td className="py-1.5 pl-4 text-right font-bold tabular-nums whitespace-nowrap">{`${signedMoney(cmp.revpar.abs)} (${signedPct(cmp.revpar.pct)})`}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="grid gap-2" data-breakdown>
            <p className="m-0 text-sm font-extrabold">What changed RevPAR</p>
            <Breakdown occ={br.occEffect} price={br.priceEffect} />
            <p className="m-0 text-sm tabular-nums" data-breakdown-text>
              Occupancy effect {signedMoney(br.occEffect)} · Price effect {signedMoney(br.priceEffect)} · Total {signedMoney(br.total)}
            </p>
          </div>
        </Card>
      ) : (
        <p className="m-0 rounded-[14px] bg-cloud-2 px-4 py-3 text-sm">Add last year’s figures to see the change and what drove it.</p>
      )}

      {target && (target.occPoints !== null || target.adr !== null || target.revpar !== null) && (
        <Card>
          <H3>Against your targets</H3>
          <ul className="m-0 grid list-none gap-1.5 p-0 text-sm" data-target>
            {target.occPoints !== null && <li>Occupancy: {signedPts(target.occPoints)} vs target</li>}
            {target.adr !== null && <li>ADR: {signedMoney(target.adr)} vs target</li>}
            {target.revpar !== null && <li>RevPAR: {signedMoney(target.revpar)} vs target</li>}
            {target.revpar !== null && target.revpar < 0 && (target.needOcc || target.needAdr !== null) && (
              <li className="font-bold" data-target-need>
                You need either {target.needOcc ? (target.needOcc.ok ? pct1(target.needOcc.value) : "more than 100%") : "–"} occupancy at your ADR, or {target.needAdr !== null ? money(target.needAdr) : "–"} at your occupancy.
              </li>
            )}
          </ul>
        </Card>
      )}

      <Card>
        <H3>Did my price change work?</H3>
        <p className="m-0 -mt-2 text-sm text-ink-copy">Enter a period before and after the change. The verdict is on RevPAR.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {period("before", "Before the change")}
          {period("after", "After the change")}
        </div>
        {res && (
          <p className={cn("m-0 self-start justify-self-start rounded-full px-4 py-1.5 text-[15px] font-extrabold", res.verdict === "worked" ? "bg-green-100 text-green" : res.verdict === "didnt" ? "bg-coral-50 text-brand" : "bg-fog text-ink-copy")} data-ba-verdict={res.verdict}>
            {pill}
          </p>
        )}
      </Card>
    </div>
  );
}

function Breakdown({ occ, price }: { occ: number; price: number }) {
  const max = Math.max(1, Math.abs(occ) + Math.abs(price));
  const seg = (v: number, label: string) => (
    <div className="grid grid-cols-[8rem_minmax(0,1fr)] items-center gap-2">
      <span className="text-[13px] font-bold">{label}</span>
      <span className="relative h-7">
        <span className="absolute inset-y-0 left-1/2 border-l border-dashed border-line-strong" />
        <span className={cn("absolute inset-y-1 rounded-[4px]", v >= 0 ? "bg-green" : "bg-brand")} style={v >= 0 ? { left: "50%", width: `${(v / max) * 50}%` } : { right: "50%", width: `${(-v / max) * 50}%` }} />
      </span>
    </div>
  );
  return (
    <figure className="m-0 grid gap-1" aria-hidden="true">
      {seg(occ, `Occupancy ${occ >= 0 ? "added" : "took away"}`)}
      {seg(price, `Price ${price >= 0 ? "added" : "took away"}`)}
    </figure>
  );
}

/* Charts -------------------------------------------------------------------------------- */

export function MonthlyCharts({ now, last, label }: { now: (Kpis | null)[]; last: (Kpis | null)[]; label: string }) {
  const W = 640;
  const H = 240;
  const pad = 26;
  const bw = (W - pad * 2) / 12;
  const maxMoney = Math.max(1, ...now.flatMap((k) => (k ? [k.adr ?? 0, k.revpar] : [])));
  const yOcc = (o: number) => H - pad - o * (H - pad * 2);
  const yMoney = (m: number) => H - pad - (m / maxMoney) * (H - pad * 2);
  const line = (f: (k: Kpis) => number | null) =>
    now
      .map((k, i) => (k && f(k) !== null ? `${pad + i * bw + bw / 2},${yMoney(f(k)!)}` : null))
      .filter(Boolean)
      .join(" ");
  return (
    <Card>
      <H3>{label}</H3>
      <figure className="m-0" aria-hidden="true" data-monthly-chart>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <text x="4" y="14" fontSize="11" fill="#5F6B75">Occupancy</text>
          <text x={W - 4} y="14" fontSize="11" fill="#5F6B75" textAnchor="end">ADR / RevPAR £</text>
          <line x1={pad} x2={W - pad} y1={H - pad} y2={H - pad} stroke="#C9CED3" />
          {now.map((k, i) => (
            <g key={i}>
              {last[i] && <rect x={pad + i * bw + bw * 0.12} width={bw * 0.36} y={yOcc(last[i]!.occupancy)} height={H - pad - yOcc(last[i]!.occupancy)} fill="#C9CED3" rx="2" />}
              {k && <rect x={pad + i * bw + bw * 0.5} width={bw * 0.36} y={yOcc(k.occupancy)} height={H - pad - yOcc(k.occupancy)} fill="#14212B" rx="2" />}
              <text x={pad + i * bw + bw / 2} y={H - 8} fontSize="11" textAnchor="middle" fill="#5F6B75">{MON[i].slice(0, 1)}</text>
            </g>
          ))}
          <polyline fill="none" stroke="#F0595A" strokeWidth="2.5" points={line((k) => k.adr)} />
          <polyline fill="none" stroke="#1F6B45" strokeWidth="2.5" strokeDasharray="6 4" points={line((k) => k.revpar)} />
        </svg>
        <figcaption className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
          <span><span className="mr-1 inline-block size-2.5 rounded-[2px] bg-ink" />Occupancy this year</span>
          <span><span className="mr-1 inline-block size-2.5 rounded-[2px] bg-[#C9CED3]" />Occupancy last year</span>
          <span><span className="mr-1 inline-block h-0.5 w-4 bg-coral align-middle" />ADR (right axis)</span>
          <span><span className="mr-1 inline-block h-0.5 w-4 border-t-2 border-dashed border-green align-middle" />RevPAR (right axis)</span>
        </figcaption>
      </figure>
      <div className="-mx-5 overflow-x-auto px-5">
        <table className="w-full min-w-[520px] border-collapse text-sm" data-monthly-table>
          <caption className="sr-only-label">Monthly occupancy, ADR and RevPAR, this year and last year</caption>
          <thead className="text-[12px] text-muted uppercase">
            <tr>
              <th className="py-1.5 text-left">Month</th>
              <th className="py-1.5 pl-3 text-right">Occupancy</th>
              <th className="py-1.5 pl-3 text-right">Last year</th>
              <th className="py-1.5 pl-3 text-right">ADR</th>
              <th className="py-1.5 pl-3 text-right">RevPAR</th>
            </tr>
          </thead>
          <tbody>
            {now.map((k, i) => (
              <tr key={i} className="border-t border-line">
                <th scope="row" className="py-1.5 text-left">{MON[i]}</th>
                <td className="py-1.5 pl-3 text-right tabular-nums">{k ? pct1(k.occupancy) : "–"}</td>
                <td className="py-1.5 pl-3 text-right tabular-nums">{last[i] ? pct1(last[i]!.occupancy) : "–"}</td>
                <td className="py-1.5 pl-3 text-right tabular-nums">{k ? adrText(k) : "–"}</td>
                <td className="py-1.5 pl-3 text-right tabular-nums">{k ? money(k.revpar) : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function WeekCharts({ b }: { b: BookingResult }) {
  const rows = [
    { id: "weekend", label: "Weekends (Fri, Sat nights)", s: b.weekend },
    { id: "weekday", label: "Weekdays", s: b.weekday },
  ];
  const maxAdr = Math.max(1, ...rows.map((r) => r.s.adr ?? 0));
  return (
    <Card>
      <H3>Weekends vs weekdays</H3>
      <figure className="m-0 grid gap-3" aria-hidden="true" data-week-chart>
        {rows.map((r) => (
          <div key={r.id} className="grid gap-1">
            <span className="text-sm font-bold">{r.label}</span>
            <span className="flex items-center gap-2">
              <span className="h-5 rounded-[4px] bg-ink" style={{ width: `${Math.max(1, r.s.occupancy * 70)}%` }} />
              <span className="text-[12px] font-bold tabular-nums">{pct1(r.s.occupancy)} occupancy</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-5 rounded-[4px] bg-coral" style={{ width: `${Math.max(1, ((r.s.adr ?? 0) / maxAdr) * 70)}%` }} />
              <span className="text-[12px] font-bold tabular-nums">{r.s.adr === null ? "–" : money(r.s.adr)} ADR</span>
            </span>
          </div>
        ))}
      </figure>
      <table className="w-full border-collapse text-sm" data-week-table>
        <caption className="sr-only-label">Weekend and weekday occupancy and ADR</caption>
        <thead className="text-[12px] text-muted uppercase">
          <tr>
            <th className="py-1.5 text-left" />
            <th className="py-1.5 pl-3 text-right">Booked / available</th>
            <th className="py-1.5 pl-3 text-right">Occupancy</th>
            <th className="py-1.5 pl-3 text-right">ADR</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-line" data-week={r.id}>
              <th scope="row" className="py-1.5 text-left">{r.id === "weekend" ? "Weekends" : "Weekdays"}</th>
              <td className="py-1.5 pl-3 text-right tabular-nums">{r.s.booked} / {r.s.available}</td>
              <td className="py-1.5 pl-3 text-right tabular-nums">{pct1(r.s.occupancy)}</td>
              <td className="py-1.5 pl-3 text-right tabular-nums">{r.s.adr === null ? "–" : money(r.s.adr)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/* Calendar ----------------------------------------------------------------------------- */

const KINDS: Record<string, DayKindStyle> = {
  booked: { label: "Booked", cell: "bg-ink text-white" },
  blocked: { label: "Blocked by you", cell: "bg-[repeating-linear-gradient(45deg,#E6E8EB_0,#E6E8EB_3px,#fff_3px,#fff_6px)] text-ink", swatch: "bg-[repeating-linear-gradient(45deg,#C9CED3_0,#C9CED3_3px,#fff_3px,#fff_6px)]" },
  gap: { label: "Gap night", cell: "bg-coral text-ink", dot: true },
  overlap: { label: "Possible double booking", cell: "bg-amber-50 text-ink ring-2 ring-brand ring-inset", dot: true },
};

export function CalendarTab({ b, period }: { b: BookingResult; period: { start: string; end: string } }) {
  const y1 = Number(period.start.slice(0, 4));
  const last = b.days ? Object.keys(b.days).sort().pop() ?? period.start : period.start;
  const endNight = period.end > period.start ? last : period.start;
  const years = Array.from(new Set([y1, Number(endNight.slice(0, 4))]));
  const monthsFor = (y: number) => {
    const out: number[] = [];
    const [sy, sm] = [Number(period.start.slice(0, 4)), Number(period.start.slice(5, 7))];
    const lastNight = new Date(`${period.end}T12:00:00Z`);
    lastNight.setUTCDate(lastNight.getUTCDate() - 1);
    const [ey, em] = [lastNight.getUTCFullYear(), lastNight.getUTCMonth() + 1];
    for (let m = 1; m <= 12; m++) if ((y > sy || (y === sy && m >= sm)) && (y < ey || (y === ey && m <= em))) out.push(m);
    return out;
  };
  const marks = Object.fromEntries(Object.entries(b.days).filter(([, v]) => v.kind !== "free"));
  return (
    <Card>
      <H3>Calendar</H3>
      <p className="m-0 -mt-2 text-sm text-ink-copy" data-gap-summary>
        {b.gaps.count ? `${b.gaps.count} gap${b.gaps.count === 1 ? "" : "s"}, ${b.gaps.nights} nights: ${b.gaps.runs.map((r) => (r.length === 1 ? formatMedium(r[0]) : `${formatMedium(r[0])} to ${formatMedium(r[r.length - 1])}`)).join("; ")}` : "No short gaps between bookings."}
      </p>
      {years.map((y) => (
        <div key={y} data-calendar-year={y}>
          {years.length > 1 && <p className="m-0 mb-2 font-extrabold">{y}</p>}
          <YearCalendar year={y} months={monthsFor(y)} marks={marks} kinds={KINDS} label={`Nights in ${y}`} />
        </div>
      ))}
    </Card>
  );
}

/* Portfolio ---------------------------------------------------------------------------- */

type SortKey = "name" | "available" | "booked" | "revenue" | "occupancy" | "adr" | "revpar";

export function PortfolioTab({ rows, total }: { rows: { id: string; name: string; kpis: Kpis }[]; total: Kpis }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "revpar", dir: -1 });
  const val = (k: Kpis, key: SortKey) => (key === "adr" ? (k.adr ?? -1) : key === "name" ? 0 : (k[key] as number));
  const sorted = [...rows].sort((a, b) => (sort.key === "name" ? a.name.localeCompare(b.name) * sort.dir : (val(a.kpis, sort.key) - val(b.kpis, sort.key)) * sort.dir));
  const th = (key: SortKey, label: string, right = true) => (
    <th scope="col" aria-sort={sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : "none"} className={cn("py-1", right && "text-right")}>
      <button type="button" className={cn("min-h-11 px-1 text-[12px] font-bold text-muted uppercase", right && "pl-3")} onClick={() => setSort((s) => ({ key, dir: s.key === key ? (-s.dir as 1 | -1) : -1 }))}>
        {label}
        {sort.key === key ? (sort.dir === 1 ? " ↑" : " ↓") : ""}
      </button>
    </th>
  );
  const cells = (k: Kpis) => [String(k.available), String(k.booked), money(k.revenue), pct1(k.occupancy), adrText(k), money(k.revpar)];
  return (
    <Card>
      <H3>Portfolio</H3>
      <div className="-mx-5 overflow-x-auto px-5">
        <table className="w-full min-w-[560px] border-collapse text-sm" data-portfolio>
          <thead>
            <tr>
              {th("name", "Property", false)}
              {th("available", "Available")}
              {th("booked", "Booked")}
              {th("revenue", "Revenue")}
              {th("occupancy", "Occupancy")}
              {th("adr", "ADR")}
              {th("revpar", "RevPAR")}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id} className="border-t border-line" data-property-row={r.name}>
                <th scope="row" className="py-1.5 text-left">{r.name}</th>
                {cells(r.kpis).map((v, i) => (
                  <td key={i} className="py-1.5 pl-3 text-right tabular-nums whitespace-nowrap">{v}</td>
                ))}
              </tr>
            ))}
            <tr className="border-t-2 border-ink bg-sand font-extrabold" data-portfolio-total>
              <th scope="row" className="py-2 text-left">Total</th>
              {cells(total).map((v, i) => (
                <td key={i} className="py-2 pl-3 text-right tabular-nums whitespace-nowrap">{v}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="m-0 text-[13px] text-muted">The total is worked out from the sums, not by averaging percentages.</p>
    </Card>
  );
}
