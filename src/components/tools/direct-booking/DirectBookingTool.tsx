"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { Chips, Num } from "@/components/tools/profit/Fields";
import { SliderField } from "@/components/tools/SliderField";
import { Toggle } from "@/components/tools/Toggle";
import { isLive, toolById, toolLink } from "@/content/tools/catalog";
import { directWebsitesHref, scenariosKey, storageKey, toolSlug } from "@/content/tools/directBookingId";
import { copy } from "@/content/tools/directBookingCopy";
import { toolPath as profitPath } from "@/content/tools/profitId";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { deviceStorage } from "@/lib/tools/deviceStorage";
import type { Figures } from "@/lib/tools/figures";
import { money, percent } from "@/lib/tools/format";
import { makeHandoff, readHandoffData, writeHandoff } from "@/lib/tools/handoff";
import {
  addScenario,
  bookingsFromOccupancy,
  CHANNEL_LABEL,
  cleanScenarios,
  compareScenarios,
  defaultInputs,
  exampleInputs,
  importFromProfit,
  makeItWork,
  mixForProfit,
  perBooking,
  perYear,
  PLATFORMS,
  readContent,
  reachShare,
  removeScenario,
  renameScenario,
  share,
  summaryText,
  validateBooking,
  validateYear,
  versus,
  whatThisMeans,
  type ChannelId,
  type Inputs,
  type PlatformId,
  type Scenario,
} from "@/lib/tools/direct-booking";
import { KeepBars, StackedFees } from "./Charts";
import { useInKit } from "./Context";

type Saved = { v: 1; inputs: Inputs; example: boolean; yearOpen: boolean; importedAt: string };
const VERDICT_CLS = { worth: "bg-green-100 text-green", marginal: "bg-amber-50 text-amber", notYet: "bg-coral-50 text-brand" } as const;

export function DirectBookingTool({ figures }: { figures: Figures }) {
  const c = useMemo(() => readContent(figures), [figures]);
  const router = useRouter();
  const inKit = useInKit();
  const [inp, setInp] = useState<Inputs>(() => defaultInputs(c));
  const [example, setExample] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [importedAt, setImportedAt] = useState("");
  const [imported, setImported] = useState<{ fields: string[]; prev: Inputs } | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [scName, setScName] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const s = deviceStorage.read<Saved>(storageKey);
    let next = s?.v === 1 && s.inputs && typeof s.inputs.rate === "number" ? { ...defaultInputs(c), ...s.inputs, shares: { ...defaultInputs(c).shares, ...s.inputs.shares }, running: { ...defaultInputs(c).running, ...s.inputs.running } } : defaultInputs(c);
    let at = typeof s?.importedAt === "string" ? s.importedAt : "";
    let imp: { fields: string[]; prev: Inputs } | null = null;
    const h = readHandoffData("profit-inputs", (x) => x);
    if (h && h.createdAt !== at) {
      const r = importFromProfit(next, h.data, c);
      if (r.fields.length) {
        imp = { fields: r.fields, prev: next };
        next = r.inputs;
      }
      at = h.createdAt;
    }
    /* eslint-disable react-hooks/set-state-in-effect -- one-time restore from device storage after hydration */
    setInp(next);
    setExample(s?.example === true && !imp);
    setYearOpen(s?.yearOpen === true || !!imp);
    setImported(imp);
    setImportedAt(at);
    setScenarios(cleanScenarios(deviceStorage.read(scenariosKey), c.model.maxScenarios));
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    track("tool_opened", toolSlug);
  }, [c]);
  useEffect(() => {
    if (ready) deviceStorage.write(storageKey, { v: 1, inputs: inp, example, yearOpen, importedAt } satisfies Saved);
  }, [ready, inp, example, yearOpen, importedAt]);
  useEffect(() => {
    if (ready) deviceStorage.write(scenariosKey, scenarios);
  }, [ready, scenarios]);

  const set = (patch: Partial<Inputs>) => {
    setInp((x) => ({ ...x, ...patch }));
    setExample(false);
  };

  const errA = validateBooking(inp);
  const errB = validateYear(inp);
  const okA = Object.keys(errA).length === 0;
  const okB = okA && Object.keys(errB).length === 0;
  const pb = okA ? perBooking(inp, c) : null;
  const y = okB && pb ? perYear(inp, c, pb) : null;
  const fix = okB ? makeItWork(inp, c) : null;
  const vs = pb ? versus(pb) : undefined;

  const lastVerdict = useRef("");
  useEffect(() => {
    if (!ready || !y || !yearOpen || lastVerdict.current === y.verdict) return;
    lastVerdict.current = y.verdict;
    track("result_shown", toolSlug, { band: y.verdict });
    if (inKit) track("kit_step_completed", toolSlug, { type: "growing" });
  }, [ready, y, yearOpen, inKit]);

  const value = inp.rate * inp.nights + inp.cleaningFee;
  const yearChannels: ChannelId[] = [...inp.channels, "direct"];
  const setShare = (id: ChannelId, v: number) => {
    const next = { ...inp.shares, [id]: v };
    if (id !== "direct") next.direct = Math.max(0, Math.round((100 - inp.channels.reduce((t, k) => t + (Number.isFinite(next[k]) ? next[k] : 0), 0)) * 100) / 100);
    set({ shares: next });
  };
  const toggleChannel = (id: PlatformId, on: boolean) => {
    const channels = PLATFORMS.filter((p) => (p === id ? on : inp.channels.includes(p)));
    if (!channels.length) return;
    const shares = { ...inp.shares };
    if (!on) {
      shares.direct = Math.min(100, shares.direct + shares[id]);
      shares[id] = 0;
    }
    set({ channels, shares });
  };
  const openYear = () => {
    setYearOpen(true);
    track("year_view_opened", toolSlug);
  };
  const toProfit = () => {
    if (!y) return;
    writeHandoff(makeHandoff("direct-booking-mix", toolSlug, mixForProfit(inp, y)));
    track("handoff_clicked", toolSlug, { type: "short-let-profit-calculator" });
    router.push(profitPath);
  };
  const linen = toolById("linen-and-supplies-calculator");
  const profitLive = isLive(toolById("short-let-profit-calculator"));

  return (
    <div className="grid min-w-0 gap-6" data-tool={toolSlug} data-ready={ready ? "" : undefined}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn btn-outline min-h-11"
          onClick={() => {
            setInp(exampleInputs(c));
            setExample(true);
            openYear();
          }}
          data-example
        >
          Try an example
        </button>
        <button
          type="button"
          className="min-h-11 px-2 text-sm font-bold underline underline-offset-2"
          onClick={() => {
            setInp(defaultInputs(c));
            setExample(false);
          }}
          data-reset
        >
          Reset
        </button>
      </div>
      {example && (
        <p className="m-0 rounded-[14px] bg-amber-25 px-4 py-3 text-sm font-semibold text-ink-copy" data-example-banner>
          {c.example.note}
        </p>
      )}
      {imported && (
        <p className="m-0 flex flex-wrap items-center gap-2 rounded-[14px] bg-green-25 px-4 py-3 text-sm font-semibold text-ink" role="status" data-imported>
          Imported from Profit calculator: {imported.fields.join(", ")}.
          <button
            type="button"
            className="min-h-11 px-1 font-bold underline"
            onClick={() => {
              setInp(imported.prev);
              setImported(null);
            }}
          >
            Undo
          </button>
        </p>
      )}

      {/* SECTION A: ONE BOOKING */}
      <section aria-labelledby="one-booking" className="grid gap-5 rounded-[22px] border border-line bg-white p-5 md:p-7" data-section-a>
        <h2 id="one-booking" className="m-0 text-[24px] font-extrabold">
          One booking
        </h2>
        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="grid min-w-0 content-start gap-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <Num id="a-rate" label="Nightly rate" prefix="£" value={inp.rate} onChange={(rate) => set({ rate })} error={errA.rate} />
              <div className="grid content-start gap-1.5">
                <Num id="a-nights" label="Nights" value={inp.nights} onChange={(nights) => set({ nights })} error={errA.nights} />
                <div className="flex gap-1.5">
                  <button type="button" className="btn btn-outline min-h-11 flex-1 px-0" aria-label="One night fewer" onClick={() => set({ nights: Math.max(1, Math.round(inp.nights) - 1) })}>
                    −
                  </button>
                  <button type="button" className="btn btn-outline min-h-11 flex-1 px-0" aria-label="One more night" onClick={() => set({ nights: Math.round(inp.nights) + 1 })}>
                    +
                  </button>
                </div>
              </div>
              <Num id="a-clean" label="Cleaning fee charged" prefix="£" value={inp.cleaningFee} onChange={(cleaningFee) => set({ cleaningFee })} error={errA.cleaningFee} />
            </div>
            <p className="m-0 text-[15px] font-extrabold" data-booking-value>
              Booking value {Number.isFinite(value) ? money(value) : "—"}
            </p>

            <fieldset className="m-0 min-w-0 border-none p-0">
              <legend className="mb-2 p-0 text-[15px] font-bold">Platforms to compare with Direct</legend>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((id) => (
                  <label key={id} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-line bg-white px-4 text-sm font-semibold has-checked:border-ink has-checked:bg-sand">
                    <input type="checkbox" className="size-4 accent-ink" checked={inp.channels.includes(id)} onChange={(e) => toggleChannel(id, e.target.checked)} data-channel={id} />
                    {CHANNEL_LABEL[id]}
                  </label>
                ))}
              </div>
            </fieldset>

            {inp.channels.includes("airbnb") && (
              <div className="grid gap-3 rounded-[14px] bg-cloud-2 p-4">
                <Chips
                  legend="Airbnb fee setting"
                  name="a-airbnb"
                  value={inp.airbnbModel}
                  onChange={(airbnbModel) => set({ airbnbModel })}
                  options={[
                    { value: "host-only", label: `Host-only fee ${percent(c.fees.airbnbHostOnly)}` },
                    { value: "split", label: `Split fee ${percent(c.fees.airbnbSplitHost)}` },
                    { value: "custom", label: "Custom %" },
                  ]}
                />
                {inp.airbnbModel === "split" && <Num id="a-guest" label="Guest service fee" suffix="%" value={inp.guestFee} onChange={(guestFee) => set({ guestFee })} hint="Paid by the guest on top of your price. Approximate." error={errA.guestFee} className="sm:max-w-[240px]" />}
                {inp.airbnbModel === "custom" && <Num id="a-custom" label="Airbnb host fee" suffix="%" value={inp.airbnbCustom} onChange={(airbnbCustom) => set({ airbnbCustom })} error={errA.airbnbCustom} className="sm:max-w-[240px]" />}
              </div>
            )}
            {inp.channels.includes("booking") && (
              <div className="grid gap-3 rounded-[14px] bg-cloud-2 p-4 sm:grid-cols-2">
                <Num id="a-booking" label="Booking.com commission" suffix="%" value={inp.bookingFee} onChange={(bookingFee) => set({ bookingFee })} hint="Check your contract." error={errA.bookingFee} />
                <Num id="a-booking-pay" label="Payments fee (optional)" suffix="%" value={inp.bookingPaymentsFee} onChange={(bookingPaymentsFee) => set({ bookingPaymentsFee })} error={errA.bookingPaymentsFee} />
              </div>
            )}
            {(inp.channels.includes("vrbo") || inp.channels.includes("other")) && (
              <div className="grid gap-3 rounded-[14px] bg-cloud-2 p-4 sm:grid-cols-2">
                {inp.channels.includes("vrbo") && <Num id="a-vrbo" label="Vrbo fee" suffix="%" value={inp.vrboFee} onChange={(vrboFee) => set({ vrboFee })} error={errA.vrboFee} />}
                {inp.channels.includes("other") && <Num id="a-other" label="Other platform fee" suffix="%" value={inp.otherFee} onChange={(otherFee) => set({ otherFee })} error={errA.otherFee} />}
              </div>
            )}
            <Toggle label="Platform charges VAT on its fee" checked={inp.vatOnFee} onChange={(vatOnFee) => set({ vatOnFee })} hint={`Check your fee invoices. Adds ${percent(c.vatRate, 0)} to the host fee.`} />

            <fieldset className="m-0 grid min-w-0 gap-4 border-none p-0">
              <legend className="mb-3 p-0 text-[15px] font-bold">Direct booking costs per booking</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <Num id="a-card" label="Card payment fee" suffix="%" value={inp.cardPercent} onChange={(cardPercent) => set({ cardPercent })} error={errA.cardPercent} />
                <Num id="a-card-fixed" label="Fixed fee per payment" prefix="£" value={inp.cardFixed} onChange={(cardFixed) => set({ cardFixed })} error={errA.cardFixed} />
                <Num id="a-damage" label="Damage protection per booking (optional)" prefix="£" value={inp.damage} onChange={(damage) => set({ damage })} error={errA.damage} />
                <div className="grid content-start gap-2">
                  <Chips
                    legend="Booking system fee (optional)"
                    name="a-system-kind"
                    value={inp.systemKind}
                    onChange={(systemKind) => set({ systemKind })}
                    options={[
                      { value: "fixed", label: "£ per booking" },
                      { value: "percent", label: "% of booking" },
                    ]}
                  />
                  <Num id="a-system" label="Booking system fee" hideLabel prefix={inp.systemKind === "fixed" ? "£" : undefined} suffix={inp.systemKind === "percent" ? "%" : undefined} value={inp.systemFee} onChange={(systemFee) => set({ systemFee })} error={errA.systemFee} />
                </div>
              </div>
              <Num id="a-discount" label="Offer direct guests a discount" suffix="%" value={inp.discount} onChange={(discount) => set({ discount })} hint="Optional. Many hosts pass part of the saving on to direct guests." error={errA.discount} className="sm:max-w-[260px]" />
            </fieldset>
          </div>

          {/* RESULT CARDS */}
          <div className="grid min-w-0 content-start gap-4 lg:sticky lg:top-4" aria-live="polite" data-result-a>
            {!pb ? (
              <p className="m-0 rounded-[14px] bg-amber-25 px-4 py-3 text-sm font-bold" data-no-result>
                Fix the fields marked in red to see your result.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {pb.platforms.map((p) => (
                    <article key={p.id} className="grid content-start gap-1 rounded-[16px] border border-line bg-white p-4" data-card={p.id}>
                      <h3 className="m-0 text-[15px] font-extrabold">{p.label}</h3>
                      <p className="m-0 text-[22px] font-extrabold tabular-nums" data-keep-value>
                        You keep {money(p.payout)}
                      </p>
                      <p className="m-0 text-sm text-ink-copy tabular-nums" data-fee>
                        Fees {money(p.fee)}
                        {p.vat > 0 && <span className="block text-[12px] text-muted">incl. VAT {money(p.vat)}</span>}
                      </p>
                      <p className="m-0 text-sm text-ink-copy tabular-nums">
                        Guest pays {money(p.guestPays)}
                        {p.guestApprox ? " (approximate)" : ""}
                      </p>
                    </article>
                  ))}
                  <article className="grid content-start gap-1 rounded-[16px] border-2 border-green bg-green-25 p-4" data-card="direct">
                    <h3 className="m-0 text-[15px] font-extrabold">Direct</h3>
                    <p className="m-0 text-[22px] font-extrabold tabular-nums" data-keep-value>
                      You keep {money(pb.direct.payout)}
                    </p>
                    <p className="m-0 text-sm text-ink-copy tabular-nums">Costs {money(pb.direct.costs)}</p>
                    <p className="m-0 text-sm text-ink-copy tabular-nums">Guest pays {money(pb.direct.guestPays)}</p>
                    {vs && (
                      <p className={cn("m-0 mt-1 text-sm font-extrabold tabular-nums", vs.saving >= 0 ? "text-green" : "text-brand")} data-saving>
                        {vs.saving >= 0 ? "+" : "−"}
                        {money(Math.abs(vs.saving))} per booking vs {vs.label}
                        <span className="block font-bold">
                          {vs.saving >= 0 ? "+" : "−"}
                          {money(Math.abs(vs.saving * 10))} per 10 bookings
                        </span>
                      </p>
                    )}
                  </article>
                </div>
                <ul className="m-0 grid list-none gap-1.5 p-0 text-sm leading-[1.55]" data-discount-lines>
                  {pb.platforms.map((p) => (
                    <li key={p.id} data-discount={p.id}>
                      {p.breakEvenDiscount.ok ? `You could offer direct guests up to ${percent(p.breakEvenDiscount.value)} off and still keep more than on ${p.label}.` : `${p.label}: ${p.breakEvenDiscount.message}.`}
                    </li>
                  ))}
                  {pb.parity && (
                    <li data-guest-compare>
                      Guests pay {money(pb.platforms.find((p) => p.guestApprox)!.guestPays)} on Airbnb vs {money(pb.direct.guestPays)} direct, so direct guests save {money(pb.platforms.find((p) => p.guestApprox)!.guestPays - pb.direct.guestPays)}. At price parity ({money(pb.parity.price)} direct), you’d keep {money(pb.parity.payout)}.
                    </li>
                  )}
                </ul>
                <KeepBars items={[...pb.platforms.map((p) => ({ id: p.id, label: p.label, value: p.payout })), { id: "direct", label: "Direct", value: pb.direct.payout, highlight: true }]} />
              </>
            )}
          </div>
        </div>
      </section>

      {/* SECTION B: YOUR YEAR */}
      {!yearOpen ? (
        <button type="button" className="btn btn-coral min-h-14 justify-self-start px-6 text-base" onClick={openYear} data-open-year>
          See your yearly fees
        </button>
      ) : (
        <section aria-labelledby="your-year" className="grid gap-5 rounded-[22px] border border-line bg-white p-5 md:p-7" data-section-b>
          <h2 id="your-year" className="m-0 text-[24px] font-extrabold">
            Your year
          </h2>
          <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="grid min-w-0 content-start gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Num id="b-bookings" label="Bookings per year" value={inp.bookings} onChange={(bookings) => set({ bookings })} error={errB.bookings} />
                <Num
                  id="b-value"
                  label="Average booking value"
                  prefix="£"
                  value={inp.avgValue ?? value}
                  onChange={(v) => set({ avgValue: v })}
                  hint={inp.avgValue === null ? "Same as One booking." : <button type="button" className="font-bold text-ink underline" onClick={() => set({ avgValue: null })}>Use One booking’s value</button>}
                  error={errB.avgValue}
                />
              </div>
              <details className="rounded-[14px] bg-cloud-2 p-4">
                <summary className="min-h-11 cursor-pointer font-bold">Work it out from my occupancy</summary>
                <div className="mt-2 flex flex-wrap items-end gap-3">
                  <Num id="b-occ" label="Occupancy" suffix="%" value={inp.occupancy} onChange={(occupancy) => set({ occupancy })} className="w-[150px]" />
                  <Num id="b-stay" label="Average stay" suffix="nights" value={inp.avgStay} onChange={(avgStay) => set({ avgStay })} className="w-[170px]" />
                  <button type="button" className="btn btn-outline min-h-11" onClick={() => set({ bookings: bookingsFromOccupancy(inp.occupancy, inp.avgStay, c) })} data-use-helper>
                    Use {bookingsFromOccupancy(inp.occupancy, inp.avgStay, c)} bookings
                  </button>
                </div>
              </details>

              <fieldset className="m-0 grid min-w-0 gap-3 border-none p-0">
                <legend className="mb-2 p-0 text-[15px] font-bold">Your bookings now, by channel</legend>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {yearChannels.map((id) => (
                    <Num key={id} id={`b-share-${id}`} label={`${CHANNEL_LABEL[id]} share`} suffix="%" value={inp.shares[id]} onChange={(v) => setShare(id, v)} error={errB[`share.${id}`]} hint={id === "direct" ? "Fills to 100%." : undefined} />
                  ))}
                </div>
                <p className={cn("m-0 text-sm font-bold", errB.shares ? "text-brand" : "text-ink-copy")} role="status" data-share-total>
                  {errB.shares ?? "Shares add up to 100%."}
                </p>
              </fieldset>

              <SliderField label="Target direct share" hint={`Now ${inp.shares.direct}% direct. The extra bookings come from your platforms.`} value={String(inp.target)} onChange={(v) => set({ target: v === "" ? 0 : Number(v) })} min={0} max={100} step={1} unit="%" name="b-target" error={errB.target} />
              <Toggle label="Take them from the highest-fee channel first" checked={inp.fromHighest} onChange={(fromHighest) => set({ fromHighest })} hint="Otherwise they come from each platform in proportion." />
              <Chips
                legend="Do you already run direct bookings?"
                name="b-already"
                value={inp.alreadyDirect ? "yes" : "no"}
                onChange={(v) => set({ alreadyDirect: v === "yes" })}
                hint={inp.alreadyDirect ? "Your running costs are already paid, so they don’t reduce the saving." : "The running costs below count as new costs."}
                options={[
                  { value: "no", label: "No" },
                  { value: "yes", label: "Yes" },
                ]}
              />
              <fieldset className="m-0 grid gap-4 border-none p-0 sm:grid-cols-2">
                <legend className="mb-3 p-0 text-[15px] font-bold">Running costs of direct bookings</legend>
                <Num id="b-system" label="Booking system or channel manager (a month)" prefix="£" value={inp.running.system} onChange={(v) => set({ running: { ...inp.running, system: v } })} error={errB["running.system"]} />
                <Num id="b-hosting" label="Website hosting and domain (a year)" prefix="£" value={inp.running.hosting} onChange={(v) => set({ running: { ...inp.running, hosting: v } })} error={errB["running.hosting"]} />
                <Num id="b-marketing" label="Marketing (a month)" prefix="£" value={inp.running.marketing} onChange={(v) => set({ running: { ...inp.running, marketing: v } })} error={errB["running.marketing"]} />
                <Num id="b-other" label="Other (a year)" prefix="£" value={inp.running.other} onChange={(v) => set({ running: { ...inp.running, other: v } })} error={errB["running.other"]} />
              </fieldset>
              <Num id="b-build" label="Website build (one-off, optional)" prefix="£" value={inp.websiteBuild} onChange={(websiteBuild) => set({ websiteBuild })} hint="Used for the payback time." error={errB.websiteBuild} className="sm:max-w-[280px]" />
            </div>

            <div className="grid min-w-0 content-start gap-4 lg:sticky lg:top-4" aria-live="polite" data-result-b>
              {!y ? (
                <p className="m-0 rounded-[14px] bg-amber-25 px-4 py-3 text-sm font-bold" data-no-result>
                  Fix the fields marked in red to see your year.
                </p>
              ) : (
                <>
                  <p className="m-0 text-[24px] leading-[1.25] font-extrabold tabular-nums" data-year-headline>
                    You pay about {money(y.platformFeesNow, 0)} a year in platform fees
                  </p>
                  <StackedFees rows={y.rows} />
                  <ul className="m-0 grid list-none gap-2 p-0 text-[15px] leading-[1.55]" data-year-lines>
                    <li>
                      Moving from {share(y.currentShare)}% to {share(y.targetShare)}% direct = <strong>{Math.round(y.extra * 10) / 10} more direct bookings</strong> a year.
                    </li>
                    <li data-net>
                      Gross saving {money(y.gross, 0)} − new direct costs {money(y.newCosts, 0)} = <strong>net saving {money(y.net, 0)} a year</strong>.
                      {inp.alreadyDirect && y.runningCosts > 0 && <span className="block text-sm text-muted">Your running costs of {money(y.runningCosts, 0)} a year are already being paid.</span>}
                    </li>
                    <li data-break-even>{y.breakEven.ok ? (y.newCosts > 0 ? `Break-even: ${y.breakEven.bookings} direct bookings a year cover your direct running costs.` : "No new running costs to cover.") : y.breakEven.message + "."}</li>
                    {y.payback && <li data-payback>Website payback: {y.payback.text}.</li>}
                  </ul>
                  <p className={cn("m-0 self-start rounded-full px-4 py-1.5 text-[15px] font-extrabold", VERDICT_CLS[y.verdict])} data-verdict={y.verdict}>
                    {c.wording.verdict[y.verdict]}
                  </p>
                  {fix && (
                    <div className="rounded-[14px] bg-sand p-4 text-sm leading-[1.6]" data-make-it-work>
                      <p className="m-0 font-extrabold">What would make it work?</p>
                      <p className="m-0">Break even on running costs: {reachShare(fix.breakEvenShare)}.</p>
                      {fix.paybackShare && (
                        <p className="m-0">
                          Website paid back within {c.model.worthItMonths} months: {reachShare(fix.paybackShare)}.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ACTIONS + SCENARIOS */}
      {pb && (
        <section className="grid gap-3 rounded-[18px] border border-line bg-white p-4" aria-label="Save and share" data-actions>
          <div className="flex flex-wrap items-end gap-2">
            <CopyButton getText={() => summaryText(inp, pb, y, c)} label="Copy summary" className="btn btn-outline min-h-11" onCopied={() => track("copied", toolSlug)} />
            <div className="grid gap-1.5">
              <label htmlFor="sc-name" className="text-sm font-bold">
                Scenario name
              </label>
              <input id="sc-name" className="field min-h-11" value={scName} maxLength={40} onChange={(e) => setScName(e.target.value)} placeholder={`Scenario ${scenarios.length + 1}`} />
            </div>
            <button
              type="button"
              className="btn btn-outline min-h-11"
              disabled={scenarios.length >= c.model.maxScenarios}
              onClick={() => {
                const r = addScenario(scenarios, scName, inp, c.model.maxScenarios);
                if (r.full) return;
                setScenarios(r.list);
                setSelected((s) => (s.length < c.model.compareMax ? [...s, r.list[r.list.length - 1].id] : s));
                setScName("");
                track("scenario_saved", toolSlug, { count: r.list.length });
              }}
              data-save-scenario
            >
              Save scenario
            </button>
            {y && profitLive && (
              <button type="button" className="btn btn-outline min-h-11" onClick={toProfit} data-to-profit>
                Open in Profit calculator →
              </button>
            )}
          </div>
          {scenarios.length > 0 && (
            <ul className="m-0 grid list-none gap-2 p-0" data-scenario-list>
              {scenarios.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-2 rounded-[12px] bg-cloud-2 px-3 py-1.5" data-scenario={s.name}>
                  <label className="flex min-h-11 items-center gap-2">
                    <input type="checkbox" className="size-5" checked={selected.includes(s.id)} disabled={!selected.includes(s.id) && selected.length >= c.model.compareMax} onChange={(e) => setSelected(e.target.checked ? [...selected, s.id] : selected.filter((x) => x !== s.id))} />
                    <span className="sr-only-label">Compare {s.name}</span>
                  </label>
                  <input aria-label={`Rename ${s.name}`} className="field min-h-11 min-w-0 flex-1" defaultValue={s.name} onBlur={(e) => setScenarios((l) => renameScenario(l, s.id, e.target.value))} />
                  <button type="button" className="btn btn-outline min-h-11 px-3" onClick={() => setInp({ ...defaultInputs(c), ...s.inputs })}>
                    Load
                  </button>
                  <button type="button" className="min-h-11 px-2 text-sm font-bold text-brand underline" onClick={() => (setScenarios((l) => removeScenario(l, s.id)), setSelected((x) => x.filter((i) => i !== s.id)))}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
          {selected.length > 1 && (
            <div className="-mx-4 overflow-x-auto px-4">
              <table className="w-full min-w-[420px] border-collapse text-sm" data-compare>
                <thead>
                  <tr>
                    <th />
                    {scenarios
                      .filter((s) => selected.includes(s.id))
                      .map((s) => (
                        <th key={s.id} className="py-2 pl-4 text-right font-extrabold">
                          {s.name}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {compareScenarios(scenarios.filter((s) => selected.includes(s.id)), c).map((r) => (
                    <tr key={r.label} className={cn("border-t border-line", r.differs && "bg-amber-25")} data-differs={r.differs ? "" : undefined}>
                      <th scope="row" className="py-1.5 text-left">
                        {r.label}
                        {r.differs && <span className="sr-only-label"> (differs)</span>}
                      </th>
                      {r.values.map((v, i) => (
                        <td key={i} className="py-1.5 pl-4 text-right whitespace-nowrap tabular-nums">
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* BEFORE YOU GO DIRECT */}
      <section aria-labelledby="checklist-h" className="grid gap-4 rounded-[22px] bg-white p-5 md:p-7" data-checklist>
        <div>
          <h2 id="checklist-h" className="h2 m-0 mb-1 text-[24px]">
            Before you go direct
          </h2>
          <p className="m-0 text-sm text-ink-copy">
            What direct bookings need. Grow them through your own website, social media and search, never by moving a platform’s guests off the platform (
            <a href={c.offPlatformUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-brand">
              Airbnb’s off-platform policy
            </a>
            ).
          </p>
        </div>
        <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2">
          {c.checklist.map((i) => (
            <li key={i.id} className="grid content-start gap-1 rounded-[16px] border border-line p-4" data-check={i.id}>
              <p className="m-0 flex items-start gap-2 font-extrabold">
                <span aria-hidden="true" className="text-green">
                  ✓
                </span>
                {i.title}
              </p>
              <p className="m-0 text-sm leading-[1.55] text-ink-copy">{i.text}</p>
              {i.href.startsWith("http") ? (
                <a href={i.href} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-brand">
                  {i.label} →
                </a>
              ) : (
                <Link href={i.href} className="text-sm font-bold text-brand">
                  {i.label} →
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* WHAT THIS MEANS + NEXT STEP */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="rounded-[20px] border border-line bg-white p-6 md:p-8">
          <h2 className="h2 mb-2 text-[24px]">What this means</h2>
          <p className="m-0 text-base leading-[1.7] text-ink-copy" aria-live="polite" data-what-this-means>
            {y ? whatThisMeans(inp, y, c) : pb && vs ? `At your figures, a direct booking keeps ${money(pb.direct.payout)} against ${money(vs.payout)} on ${vs.label}. Open “Your year” to see whether that covers the costs of running direct bookings. ${c.wording.whatThisMeans.always}` : c.wording.whatThisMeans.always}
          </p>
        </div>
        {inKit ? (
          <div className="flex flex-col rounded-[20px] bg-ink p-6 text-white md:p-8" data-next-step="kit">
            <p className="eyebrow text-coral-200">{copy.kit.eyebrow}</p>
            <h2 className="m-0 mb-2 text-[22px] leading-[1.2] font-extrabold text-white">{copy.kit.title}</h2>
            <p className="m-0 mb-5 flex-1 text-[15px] leading-[1.6] text-white/85">{copy.kit.text}</p>
            <div>
              <Link href={linen ? `${toolLink(linen)}${isLive(linen) ? "?kit=growing" : ""}` : "/free-tools"} className="btn btn-coral" onClick={() => track("next_step_clicked", toolSlug, { type: "kit" })} data-kit-next>
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
              <Link href={directWebsitesHref} className="btn btn-coral" onClick={() => track("next_step_clicked", toolSlug, { type: "service" })}>
                {copy.nextStep.cta} →
              </Link>
            </div>
          </div>
        )}
      </div>

      <p className="m-0 text-[13px] text-muted">
        Your figures stay on this device.{" "}
        {confirmClear ? (
          <>
            <button
              type="button"
              className="inline-flex min-h-11 items-center font-bold text-brand underline"
              onClick={() => {
                deviceStorage.remove(storageKey);
                deviceStorage.remove(scenariosKey);
                setScenarios([]);
                setSelected([]);
                setInp(defaultInputs(c));
                setYearOpen(false);
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
    </div>
  );
}
