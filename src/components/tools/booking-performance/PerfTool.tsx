"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { LeadPdfModal } from "@/components/tools/LeadPdfModal";
import { PropertyPicker } from "@/components/tools/PropertyPicker";
import { isLive, toolById, toolLink } from "@/content/tools/catalog";
import { pricingHref, storageKey, toolSlug } from "@/content/tools/bookingPerformanceId";
import { copy } from "@/content/tools/bookingPerformanceCopy";
import { toolPath as profitPath } from "@/content/tools/profitId";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { deviceStorage } from "@/lib/tools/deviceStorage";
import { downloadText } from "@/lib/tools/download";
import { londonToday, type Figures } from "@/lib/tools/figures";
import { money } from "@/lib/tools/format";
import { makeHandoff, readHandoffData, writeHandoff } from "@/lib/tools/handoff";
import {
  adrText,
  compare,
  fromBookings,
  fromSums,
  insights as buildInsights,
  kpiCsv,
  kpis,
  monthly,
  newProperty,
  nightsCsv,
  pct1,
  portfolio,
  quickInput,
  readContent,
  restore,
  summaryText,
  validateBookings,
  validateMonths,
  validateQuick,
  vsTarget,
  whatThisMeans,
  withExample,
  type BookingResult,
  type Kpis,
  type Mode,
  type Property,
  type Saved,
} from "@/lib/tools/booking-performance";
import { useInKit } from "./Context";
import { downloadPerfPdf } from "./exports";
import { ListInputs, MonthlyInputs, QuickInputs } from "./Inputs";
import { CalendarTab, Compare, MobileBar, MonthlyCharts, Overview, PortfolioTab, Tabs, Tiles, WeekCharts, type TabId } from "./Results";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const ok = (e: object) => Object.keys(e).length === 0;
const withFee = (k: Kpis, fee: number): Kpis => ({ ...k, netRevpar: fee > 0 && fee < 100 ? k.revpar * (1 - fee / 100) : null });

type Computed = { k: Kpis | null; before: Kpis | null; errors: Record<string, string | undefined>; months: (Kpis | null)[]; lastMonths: (Kpis | null)[]; bookings: BookingResult | null; label: string; partial: boolean };

/** Everything for one property in one mode. */
function compute(p: Property, mode: Mode, c: ReturnType<typeof readContent>): Computed {
  if (mode === "quick") {
    const qi = quickInput(p.quick);
    const ly = { ...p.quick.lastYear, cleaning: 0, feePercent: 0, bookings: 0 };
    const errors = { ...validateQuick(qi), ...(p.quick.compareOn ? validateQuick(ly, "ly.") : {}) };
    const good = ok(errors);
    return { k: good ? kpis(qi) : null, before: good && p.quick.compareOn ? kpis(ly) : null, errors, months: [], lastMonths: [], bookings: null, label: `${qi.nights} nights`, partial: false };
  }
  if (mode === "monthly") {
    const m = p.monthly;
    const errors = { ...validateMonths(m.thisYear, m.year, "m"), ...validateMonths(m.lastYear, m.year - 1, "l") };
    if (!ok(errors)) return { k: null, before: null, errors, months: [], lastMonths: [], bookings: null, label: String(m.year), partial: false };
    const now = monthly(m.thisYear, m.year);
    const last = monthly(m.lastYear, m.year - 1);
    // Like for like: last year's months that match the months filled in this year.
    const pairs = now.months.flatMap((k, i) => (k && last.months[i] ? [last.months[i]!] : []));
    const before = pairs.length && pairs.length === now.filled ? fromSums(pairs) : null;
    return { k: now.total ? withFee(now.total, p.quick.feePercent) : null, before, errors, months: now.months, lastMonths: last.months, bookings: null, label: now.partial ? `${m.year}, year to date (${now.filled} ${now.filled === 1 ? "month" : "months"})` : String(m.year), partial: now.partial };
  }
  const l = p.list;
  const errors = validateBookings(l.bookings, { start: l.start, end: l.end }, l.blocks);
  if (!ok(errors)) return { k: null, before: null, errors, months: [], lastMonths: [], bookings: null, label: "", partial: false };
  const b = fromBookings(l.bookings, l.blocks, { start: l.start, end: l.end }, c);
  const errs = b.kpis.available === 0 ? { available: "Every night is blocked. There’s nothing to measure." } : {};
  return { k: ok(errs) ? withFee(b.kpis, p.quick.feePercent) : null, before: null, errors: errs, months: [], lastMonths: [], bookings: b, label: `${l.start} to ${l.end}`, partial: false };
}

export function PerfTool({ figures }: { figures: Figures }) {
  const c = useMemo(() => readContent(figures), [figures]);
  const router = useRouter();
  const inKit = useInKit();
  const [state, setState] = useState<Saved>(() => ({ v: 1, mode: "quick", activeId: "p1", properties: [newProperty("p1", "My property", c)], example: false }));
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<TabId>("overview");
  const [modal, setModal] = useState(false);
  const [imported, setImported] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const saved = restore(deviceStorage.read(storageKey), c);
    let next = saved ?? { v: 1 as const, mode: "quick" as Mode, activeId: "p1", properties: [newProperty("p1", "My property", c)], example: false };
    if (!saved) {
      // Booking list: this month, on the visitor's device.
      const t = londonToday();
      const start = `${t.slice(0, 7)}-01`;
      const d = new Date(`${start}T12:00:00Z`);
      d.setUTCMonth(d.getUTCMonth() + 1);
      next = { ...next, properties: next.properties.map((p) => ({ ...p, list: { ...p.list, start, end: d.toISOString().slice(0, 10) }, quick: { ...p.quick, start, end: d.toISOString().slice(0, 10) } })) };
    }
    // Shared device format: the platform fee from the profit calculator, if not already set.
    const h = readHandoffData("profit-inputs", (x) => x);
    const fee = h && typeof (h.data as { platformFeePercent?: unknown })?.platformFeePercent === "number" ? (h.data as { platformFeePercent: number }).platformFeePercent : null;
    let note = "";
    if (fee !== null && fee > 0 && fee < 100) {
      const active = next.properties.find((p) => p.id === next.activeId);
      if (active && !active.quick.feePercent) {
        next = { ...next, properties: next.properties.map((p) => (p.id === active.id ? { ...p, quick: { ...p.quick, feePercent: fee } } : p)) };
        note = `Imported from Profit calculator: platform fee ${fee}% (for net RevPAR).`;
      }
    }
    /* eslint-disable react-hooks/set-state-in-effect -- one-time restore from device storage after hydration */
    setState(next);
    setImported(note);
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    track("tool_opened", toolSlug, { type: next.mode });
  }, [c]);
  useEffect(() => {
    if (ready) deviceStorage.write(storageKey, state);
  }, [ready, state]);

  const p = state.properties.find((x) => x.id === state.activeId) ?? state.properties[0];
  const setP = (patch: Partial<Property>) => setState((s) => ({ ...s, example: false, properties: s.properties.map((x) => (x.id === p.id ? { ...x, ...patch } : x)) }));
  const mode = state.mode;
  const r = compute(p, mode, c);
  const k = r.k;
  const cmp = k && r.before ? compare(k, r.before) : null;
  const hasTarget = p.targets.occupancy !== null || p.targets.adr !== null || p.targets.revpar !== null;
  const target = k && hasTarget ? vsTarget(k, p.targets) : null;
  const ins = k ? buildInsights({ k, before: r.before, cmp, target, targetAdr: p.targets.adr, bookings: r.bookings }, c) : [];
  const multi = state.properties.length > 1;
  const port = multi
    ? portfolio(
        state.properties.flatMap((x) => {
          const kx = compute(x, mode, c).k;
          return kx ? [{ id: x.id, name: x.name, kpis: kx }] : [];
        }),
      )
    : null;

  const tabs: TabId[] = ["overview", "compare", ...(mode !== "quick" ? (["charts"] as TabId[]) : []), ...(mode === "list" ? (["calendar"] as TabId[]) : []), ...(multi ? (["portfolio"] as TabId[]) : [])];
  const activeTab = tabs.includes(tab) ? tab : "overview";

  const lastStatus = useRef("");
  useEffect(() => {
    const s = k ? "result" : "";
    if (!ready || !s || lastStatus.current === `${mode}`) return;
    lastStatus.current = mode;
    track("result_shown", toolSlug, { type: mode });
    if (inKit) track("kit_step_completed", toolSlug, { type: "growing" });
  }, [ready, k, mode, inKit]);

  const switchMode = (m: Mode) => {
    if (m === mode) return;
    setState((s) => ({ ...s, mode: m }));
    track("mode_switched", toolSlug, { type: m });
  };
  const toProfit = () => {
    if (!k || k.adr === null) return;
    writeHandoff(makeHandoff("booking-performance", toolSlug, { nightlyRate: Math.round(k.adr * 100) / 100, occupancyPercent: Math.round(k.occupancy * 1000) / 10 }));
    track("handoff_clicked", toolSlug, { type: "short-let-profit-calculator" });
    router.push(profitPath);
  };
  const csv = () => {
    if (!k) return;
    if (mode === "list" && r.bookings) downloadText(`booking-nights-${londonToday()}.csv`, nightsCsv(r.bookings), "text/csv");
    else if (mode === "monthly") downloadText(`monthly-performance-${p.monthly.year}.csv`, kpiCsv([...r.months.flatMap((m, i) => (m ? [{ label: `${MONTHS[i]} ${p.monthly.year}`, k: m }] : [])), { label: r.partial ? "Year to date" : "Year", k }]), "text/csv");
    else downloadText(`performance-${londonToday()}.csv`, kpiCsv([{ label: "This period", k }, ...(r.before ? [{ label: "Last year", k: r.before }] : [])]), "text/csv");
    track("file_downloaded", toolSlug, { type: "csv" });
  };
  const dsb = toolById("direct-booking-savings");
  const profitLive = isLive(toolById("short-let-profit-calculator"));

  return (
    <div className="grid min-w-0 gap-6" data-tool={toolSlug} data-ready={ready ? "" : undefined}>
      {ready && k && <MobileBar k={k} />}
      <div className="grid gap-4">
        <PropertyPicker
          properties={state.properties.map((x) => ({ id: x.id, name: x.name }))}
          activeId={p.id}
          onSelect={(id) => setState((s) => ({ ...s, activeId: id }))}
          onAdd={(name) => {
            const id = `p${Date.now().toString(36)}`;
            setState((s) => ({ ...s, activeId: id, properties: [...s.properties, newProperty(id, name.trim() || `Property ${s.properties.length + 1}`, c)] }));
          }}
          onRename={(name) => setP({ name: name.trim() || p.name })}
          onDelete={() =>
            setState((s) => {
              if (s.properties.length < 2) return { ...s, properties: [newProperty(p.id, "My property", c)] };
              const rest = s.properties.filter((x) => x.id !== p.id);
              return { ...s, properties: rest, activeId: rest[0].id };
            })
          }
          deleteText={`Delete “${p.name}” and its figures from this device?`}
        />
        <div role="radiogroup" aria-label="Mode" className="grid grid-cols-3 gap-1 rounded-[18px] border border-line bg-white p-1.5 md:max-w-[640px]">
          {(
            [
              ["quick", "Quick"],
              ["monthly", "Monthly tracker"],
              ["list", "Booking list"],
            ] as [Mode, string][]
          ).map(([m, label]) => (
            <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => switchMode(m)} className={cn("min-h-12 rounded-[14px] px-2 text-[14px] font-extrabold md:text-base", mode === m ? "bg-ink text-white" : "text-ink hover:bg-cloud-2")} data-mode={m}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn btn-outline min-h-11" onClick={() => setState((s) => ({ ...s, example: true, properties: s.properties.map((x) => (x.id === p.id ? withExample(x, mode, c) : x)) }))} data-example>
            Try an example
          </button>
          <button type="button" className="min-h-11 px-2 text-sm font-bold underline underline-offset-2" onClick={() => setP({ ...newProperty(p.id, p.name, c), list: { ...newProperty(p.id, p.name, c).list, start: p.list.start, end: p.list.end } })} data-reset>
            Reset
          </button>
        </div>
        {state.example && (
          <p className="m-0 rounded-[14px] bg-amber-25 px-4 py-3 text-sm font-semibold text-ink-copy" data-example-banner>
            {c.examples.note}
          </p>
        )}
        {imported && (
          <p className="m-0 rounded-[14px] bg-green-25 px-4 py-3 text-sm font-semibold" role="status" data-imported>
            {imported}
          </p>
        )}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <div className="min-w-0 rounded-[22px] border border-line bg-white p-5 md:p-7">
          {mode === "quick" && <QuickInputs q={p.quick} set={(patch) => setP({ quick: { ...p.quick, ...patch } })} errors={r.errors} targets={p.targets} setTargets={(targets) => setP({ targets })} />}
          {mode === "monthly" && <MonthlyInputs m={p.monthly} set={(patch) => setP({ monthly: { ...p.monthly, ...patch } })} errors={r.errors} targets={p.targets} setTargets={(targets) => setP({ targets })} />}
          {mode === "list" && <ListInputs l={p.list} set={(patch) => setP({ list: { ...p.list, ...patch } })} errors={r.errors} flags={Object.fromEntries((r.bookings?.flags ?? []).map((f) => [f.id, f.message]))} onImported={() => track("import_used", toolSlug, { type: "csv" })} />}
        </div>
        <div className="grid gap-2 lg:sticky lg:top-4">
          <Tiles k={k} cmp={cmp} />
          {k && <p className="m-0 text-center text-[12px] text-muted">{r.label}</p>}
        </div>
      </div>

      {k && (
        <section aria-label="Results" className="grid min-w-0 gap-4" data-results>
          <Tabs
            tabs={tabs}
            active={activeTab}
            onChange={(t) => {
              setTab(t);
              if (t === "compare") track("compare_used", toolSlug, { type: mode });
            }}
          >
            {activeTab === "overview" && <Overview k={k} bookings={r.bookings} />}
            {activeTab === "compare" && <Compare k={k} before={r.before} cmp={cmp} target={target} ba={p.ba} setBa={(ba) => setP({ ba })} c={c} onVerdict={(v) => track("before_after_verdict", toolSlug, { type: v === "didnt" ? "not" : v === "none" ? "no-change" : "worked" })} />}
            {activeTab === "charts" && mode === "monthly" && <MonthlyCharts now={r.months} last={r.lastMonths} label={`${p.monthly.year} vs ${p.monthly.year - 1}`} />}
            {activeTab === "charts" && mode === "list" && r.bookings && <WeekCharts b={r.bookings} />}
            {activeTab === "calendar" && r.bookings && <CalendarTab b={r.bookings} period={{ start: p.list.start, end: p.list.end }} />}
            {activeTab === "portfolio" && port?.total && <PortfolioTab rows={port.rows} total={port.total} />}
          </Tabs>
          <div className="flex flex-wrap items-center gap-2 rounded-[18px] border border-line bg-white p-3" data-actions>
            <CopyButton getText={() => summaryText({ label: `${p.name}, ${r.label}`, k, cmp, before: r.before, ins, bookings: r.bookings })} label="Copy summary" className="btn btn-outline min-h-11" onCopied={() => track("copied", toolSlug)} />
            <button type="button" className="btn btn-outline min-h-11" onClick={csv} data-csv>
              Download CSV
            </button>
            <button type="button" className="btn btn-coral min-h-11" onClick={() => setModal(true)} data-pdf>
              Download PDF report
            </button>
            {profitLive && k.adr !== null && (
              <button type="button" className="btn btn-outline min-h-11" onClick={toProfit} data-to-profit>
                Open in Profit calculator →
              </button>
            )}
          </div>
        </section>
      )}

      {ins.length > 0 && (
        <section aria-labelledby="bp-insights" className="grid gap-3" data-insights>
          <h2 id="bp-insights" className="h2 m-0 text-[24px]">
            Insights from your figures
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {ins.map((i) => (
              <article key={i.id} className={cn("grid content-start gap-2 rounded-[18px] border p-5", i.id === "flags" ? "border-coral-100 bg-coral-25" : "border-line bg-white")} data-insight={i.id}>
                <p className="m-0 text-[15px] leading-[1.6]">{i.text}</p>
                {i.links.length > 0 && (
                  <p className="m-0 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {i.links.map((l) => {
                      const t = toolById(l.tool);
                      return t ? (
                        <Link key={l.tool} href={toolLink(t)} className="font-bold text-brand">
                          {l.label} →
                        </Link>
                      ) : null;
                    })}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* KPI EXPLAINER */}
      <section aria-labelledby="bp-explainer" className="grid gap-3" data-explainer>
        <h2 id="bp-explainer" className="h2 m-0 text-[24px]">
          The three numbers, in plain English
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { id: "occ", t: "Occupancy = how full", ex: k && k.available ? `You sold ${k.booked} of ${k.available} available nights: ${pct1(k.occupancy)}.` : "Booked nights ÷ available nights. Nights you block don’t count against you." },
            { id: "adr", t: "ADR = average price per booked night", ex: k && k.adr !== null ? `${money(k.revenue)} ÷ ${k.booked} booked nights = ${adrText(k)}.` : "Accommodation revenue ÷ booked nights, without cleaning fees." },
            { id: "revpar", t: "RevPAR = revenue per night you could have sold", ex: k && k.available ? `${money(k.revenue)} ÷ ${k.available} available nights = ${money(k.revpar)}.` : "Revenue ÷ available nights, the same as occupancy × ADR." },
          ].map((x) => (
            <div key={x.id} className="grid content-start gap-1.5 rounded-[18px] border border-line bg-white p-5" data-explain={x.id}>
              <p className="m-0 text-[16px] font-extrabold">{x.t}</p>
              <p className="m-0 text-sm leading-[1.55] text-ink-copy">{x.ex}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT THIS MEANS + NEXT STEP */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="rounded-[20px] border border-line bg-white p-6 md:p-8">
          <h2 className="h2 mb-2 text-[24px]">What this means</h2>
          <p className="m-0 text-base leading-[1.7] text-ink-copy" aria-live="polite" data-what-this-means>
            {whatThisMeans(k && k.booked + k.revenue > 0 ? k : null, c)}
          </p>
        </div>
        {inKit ? (
          <div className="flex flex-col rounded-[20px] bg-ink p-6 text-white md:p-8" data-next-step="kit">
            <p className="eyebrow text-coral-200">{copy.kit.eyebrow}</p>
            <h2 className="m-0 mb-2 text-[22px] leading-[1.2] font-extrabold text-white">{copy.kit.title}</h2>
            <p className="m-0 mb-5 flex-1 text-[15px] leading-[1.6] text-white/85">{copy.kit.text}</p>
            <div>
              <Link href={dsb ? `${toolLink(dsb)}${isLive(dsb) ? "?kit=growing" : ""}` : "/free-tools"} className="btn btn-coral" onClick={() => track("next_step_clicked", toolSlug, { type: "kit" })} data-kit-next>
                {copy.kit.cta} →
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col rounded-[20px] bg-coral-50 p-6 md:p-8" data-next-step="service">
            <p className="eyebrow text-brand">{copy.nextStep.eyebrow}</p>
            <h2 className="m-0 mb-2 text-[22px] leading-[1.2] font-extrabold">{copy.nextStep.title}</h2>
            <p className="m-0 mb-5 flex-1 text-[15px] leading-[1.6] text-ink-copy">{copy.nextStep.text}</p>
            <div>
              <Link href={pricingHref} className="btn btn-coral" onClick={() => track("next_step_clicked", toolSlug, { type: "service" })}>
                {copy.nextStep.cta} →
              </Link>
            </div>
          </div>
        )}
      </div>

      <p className="m-0 text-[13px] text-muted">
        Your figures and bookings stay on this device.{" "}
        {confirmClear ? (
          <>
            <button
              type="button"
              className="inline-flex min-h-11 items-center font-bold text-brand underline"
              onClick={() => {
                deviceStorage.remove(storageKey);
                setState({ v: 1, mode: state.mode, activeId: "p1", properties: [newProperty("p1", "My property", c)], example: false });
                setConfirmClear(false);
              }}
              data-clear-confirm
            >
              Yes, clear my data
            </button>{" "}
            <button type="button" className="inline-flex min-h-11 items-center font-bold underline" onClick={() => setConfirmClear(false)}>
              Keep it
            </button>
          </>
        ) : (
          <button type="button" className="inline-flex min-h-11 items-center font-bold text-ink underline" onClick={() => setConfirmClear(true)} data-clear>
            Clear my data
          </button>
        )}
      </p>

      {k && (
        <LeadPdfModal
          open={modal}
          onClose={() => setModal(false)}
          toolSlug={toolSlug}
          copy={copy.pdfModal}
          makePdf={async () => {
            track("file_downloaded", toolSlug, { type: "pdf" });
            await downloadPerfPdf({
              title: `${p.name}, ${r.label}`,
              k,
              before: r.before,
              cmp,
              months: r.months.map((m, i) => ({ label: MONTHS[i].slice(0, 3), k: m })),
              bookings: r.bookings,
              insights: ins,
              disclaimer: copy.disclaimer,
              fileName: `booking-performance-${londonToday()}.pdf`,
              date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
            });
          }}
        />
      )}
    </div>
  );
}
