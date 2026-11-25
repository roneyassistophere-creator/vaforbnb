"use client";

import { useState } from "react";
import { SliderField } from "@/components/tools/SliderField";
import { Toggle } from "@/components/tools/Toggle";
import { cn } from "@/lib/cn";
import { money } from "@/lib/tools/format";
import { airbnbFee, applyShape, CHANNELS, copyJanuary, MONTHS, type ChannelId, type Content, type Errors, type Inputs, type Result } from "@/lib/tools/profit";
import { Sparkline } from "./Charts";
import { Chips, Num, Section } from "./Fields";

type Set = (patch: Partial<Inputs>) => void;
const perMonth = (n: number) => `${money(n, 0)}/mo`;
const has = (e: Errors, ...prefixes: string[]) => Object.keys(e).some((k) => prefixes.some((p) => k === p || k.startsWith(`${p}.`)));

const CHANNEL_LABEL: Record<ChannelId, string> = { airbnb: "Airbnb", booking: "Booking.com", direct: "Direct", other: "Other" };

/** The input sections (left column). Results update live as the host types. */
export function ProfitInputs({ inp, set, errors, r, c }: { inp: Inputs; set: Set; errors: Errors; r: Result; c: Content }) {
  const [open, setOpen] = useState<Record<string, boolean>>({ pricing: true, channels: true, costs: true, bills: true });
  const toggle = (k: string) => (v: boolean) => setOpen((o) => (o[k] === v ? o : { ...o, [k]: v }));
  const err = (k: string) => errors[k];

  return (
    <div className="grid min-w-0 gap-3" data-inputs>
      {inp.mode === "quick" ? (
        <Section id="pricing" title="Pricing and demand" subtotal={perMonth(r.monthly.booking)} complete={!has(errors, "rate", "occupancy", "avgStay", "cleaningFee", "ownerNights")} open={open.pricing} onToggle={toggle("pricing")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Num id="p-rate" label="Average nightly rate" prefix="£" value={inp.rate} onChange={(rate) => set({ rate })} hint="Your average price per night, before platform fees." error={err("rate")} />
            <Num id="p-stay" label="Average length of stay" suffix="nights" value={inp.avgStay} onChange={(avgStay) => set({ avgStay })} hint="Decimals are fine, e.g. 2.5." error={err("avgStay")} />
          </div>
          <SliderField label="Occupancy" hint="The share of available nights that are booked." value={String(inp.occupancy)} onChange={(v) => set({ occupancy: v === "" ? 0 : Number(v) })} min={0} max={100} step={0.5} unit="%" name="p-occ" error={err("occupancy")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Num id="p-clean" label="Cleaning fee charged to guests per stay" prefix="£" value={inp.cleaningFee} onChange={(cleaningFee) => set({ cleaningFee })} hint="Leave at 0 if your price already includes cleaning." error={err("cleaningFee")} />
            <Num id="p-owner" label="Owner-blocked nights per year" suffix="nights" value={inp.ownerNights} onChange={(ownerNights) => set({ ownerNights })} hint="Nights you use it yourself or block for maintenance." error={err("ownerNights")} />
          </div>
        </Section>
      ) : (
        <MonthTable inp={inp} set={set} errors={errors} r={r} c={c} open={open.pricing ?? true} onToggle={toggle("pricing")} />
      )}

      <Section id="channels" title="Booking channels and fees" subtotal={perMonth(r.monthly.platformFees)} complete={!has(errors, "shares", "share", "simpleFee", "airbnbCustom", "bookingFee", "directFee", "directFixed", "otherFee")} open={open.channels} onToggle={toggle("channels")}>
        <Toggle label="Simple: one average platform fee" checked={inp.feeMode === "simple"} onChange={(v) => set({ feeMode: v ? "simple" : "channels" })} hint="Use this if you don’t know your channel mix." />
        {inp.feeMode === "simple" ? (
          <Num id="f-simple" label="Average platform fee" suffix="%" value={inp.simpleFee} onChange={(simpleFee) => set({ simpleFee })} hint="Applied to the guest booking value, including the cleaning fee." error={err("simpleFee")} className="sm:max-w-[260px]" />
        ) : (
          <ChannelTable inp={inp} set={set} errors={errors} c={c} f={r.fees.f} />
        )}
      </Section>

      <Section id="mgmt" title="Management or co-host" optional subtotal={inp.mgmt.kind === "none" ? undefined : perMonth(r.monthly.management)} complete={!has(errors, "mgmt")} open={!!open.mgmt} onToggle={toggle("mgmt")}>
        <Chips
          legend="How are you charged?"
          name="m-kind"
          value={inp.mgmt.kind}
          onChange={(kind) => set({ mgmt: { ...inp.mgmt, kind } })}
          options={[
            { value: "none", label: "No management" },
            { value: "percent", label: "A percentage" },
            { value: "fixed", label: "A fixed monthly fee" },
          ]}
        />
        {inp.mgmt.kind === "percent" && (
          <div className="grid gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
            <Num id="m-pct" label="Management fee" suffix="%" value={inp.mgmt.percent} onChange={(percent) => set({ mgmt: { ...inp.mgmt, percent } })} error={err("mgmt.percent")} />
            <Chips
              legend="Charged on"
              name="m-basis"
              value={inp.mgmt.basis}
              onChange={(basis) => set({ mgmt: { ...inp.mgmt, basis } })}
              options={[
                { value: "room", label: "Room revenue only" },
                { value: "roomCleaning", label: "Room revenue + cleaning fees" },
              ]}
            />
          </div>
        )}
        {inp.mgmt.kind === "fixed" && <Num id="m-fixed" label="Fixed management fee a month" prefix="£" value={inp.mgmt.fixed} onChange={(fixed) => set({ mgmt: { ...inp.mgmt, fixed } })} error={err("mgmt.fixed")} className="sm:max-w-[260px]" />}
      </Section>

      <Section id="costs" title="Costs per stay and per night" subtotal={perMonth(r.monthly.variable)} complete={!has(errors, "turnover", "consumables", "running")} open={open.costs} onToggle={toggle("costs")}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Num id="c-turn" label="Turnover cost per stay" prefix="£" value={inp.turnover} onChange={(turnover) => set({ turnover })} hint="Cleaning and laundry." error={err("turnover")} />
          <Num id="c-cons" label="Consumables per stay" prefix="£" value={inp.consumables} onChange={(consumables) => set({ consumables })} hint="Toiletries, tea and coffee, toilet roll." error={err("consumables")} />
          <Num id="c-run" label="Running cost per occupied night" prefix="£" value={inp.running} onChange={(running) => set({ running })} hint="Extra energy and water when guests are in. Standing charges go in bills." error={err("running")} />
        </div>
      </Section>

      <Section id="bills" title="Monthly and annual bills" subtotal={perMonth(r.fixed.bills)} complete={!has(errors, "monthly", "annual")} open={open.bills} onToggle={toggle("bills")}>
        <Bills inp={inp} set={set} errors={errors} />
      </Section>

      <Section id="reserve" title="Reserve and set-up costs" optional subtotal={r.monthly.reserve > 0 ? perMonth(r.monthly.reserve) : undefined} complete={!has(errors, "reserve", "setupCosts", "cashInvested")} open={!!open.reserve} onToggle={toggle("reserve")}>
        <Chips
          legend="Maintenance and replacement reserve"
          hint={`Many hosts set aside around ${c.model.reserveHintPercent}% (an assumption: change it to suit you). Starts at 0.`}
          name="r-kind"
          value={inp.reserve.kind}
          onChange={(kind) => set({ reserve: { ...inp.reserve, kind } })}
          options={[
            { value: "percent", label: "% of booking value" },
            { value: "fixed", label: "£ a month" },
          ]}
        />
        {inp.reserve.kind === "percent" ? (
          <Num id="r-pct" label="Reserve" suffix="%" value={inp.reserve.percent} onChange={(percent) => set({ reserve: { ...inp.reserve, percent } })} error={err("reserve.percent")} className="sm:max-w-[220px]" />
        ) : (
          <Num id="r-fixed" label="Reserve a month" prefix="£" value={inp.reserve.fixed} onChange={(fixed) => set({ reserve: { ...inp.reserve, fixed } })} error={err("reserve.fixed")} className="sm:max-w-[220px]" />
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Num id="r-setup" label="One-off set-up costs" prefix="£" value={inp.setupCosts} onChange={(setupCosts) => set({ setupCosts })} hint="Furniture, photography, safety kit. Used for payback, not monthly profit." error={err("setupCosts")} />
          <Num id="r-cash" label="Cash invested" prefix="£" value={inp.cashInvested} onChange={(cashInvested) => set({ cashInvested })} hint="Deposit plus set-up. Used for your cash return." error={err("cashInvested")} />
        </div>
      </Section>

      <Section id="vat" title="VAT and tax estimate" optional complete open={!!open.vat} onToggle={toggle("vat")}>
        <Toggle label="I’m VAT registered" checked={inp.vatRegistered} onChange={(vatRegistered) => set({ vatRegistered })} hint={inp.vatRegistered ? `Your prices are treated as including VAT at ${Math.round(c.vatRate * 100)}%.` : undefined} />
        <Toggle label="Show a tax estimate" checked={inp.tax.on} onChange={(on) => set({ tax: { ...inp.tax, on } })} hint="Set your nation, band and ownership in the Tax estimate tab." />
      </Section>
    </div>
  );
}

function ChannelTable({ inp, set, errors, c, f }: { inp: Inputs; set: Set; errors: Errors; c: Content; f: number }) {
  const total = CHANNELS.reduce((t, k) => t + (Number.isFinite(inp.shares[k]) ? inp.shares[k] : 0), 0);
  /** Auto-balance: the last row takes whatever is left. */
  const setShare = (k: ChannelId, v: number) => {
    const next = { ...inp.shares, [k]: v };
    if (k !== "other") {
      const rest = 100 - CHANNELS.filter((x) => x !== "other").reduce((t, x) => t + (Number.isFinite(next[x]) ? next[x] : 0), 0);
      next.other = Math.max(0, Math.round(rest * 100) / 100);
    }
    set({ shares: next });
  };
  return (
    <div className="grid gap-4">
      {CHANNELS.map((k) => (
        <div key={k} className="grid gap-3 rounded-[14px] bg-cloud-2 p-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-start" data-channel={k}>
          <Num id={`ch-${k}`} label={`${CHANNEL_LABEL[k]} share`} suffix="%" value={inp.shares[k]} onChange={(v) => setShare(k, v)} error={errors[`share.${k}`]} hint={k === "other" ? "Fills to 100% automatically." : undefined} />
          {k === "airbnb" && (
            <div className="grid gap-3">
              <Chips
                legend="Airbnb fee model"
                name="ch-airbnb-model"
                value={inp.airbnbModel}
                onChange={(airbnbModel) => set({ airbnbModel, airbnbCustom: airbnbModel === "custom" ? Math.round(airbnbFee(inp, c) * 10000) / 100 : inp.airbnbCustom })}
                options={[
                  { value: "host-only", label: `Host-only fee ${(c.fees.airbnbHostOnly * 100).toFixed(1)}%` },
                  { value: "split", label: `Split fee ${(c.fees.airbnbSplit * 100).toFixed(1)}%` },
                  { value: "custom", label: "Custom" },
                ]}
              />
              {inp.airbnbModel === "custom" && <Num id="ch-airbnb-fee" label="Airbnb fee" suffix="%" value={inp.airbnbCustom} onChange={(airbnbCustom) => set({ airbnbCustom })} error={errors.airbnbCustom} className="max-w-[200px]" />}
            </div>
          )}
          {k === "booking" && <Num id="ch-booking-fee" label="Booking.com commission" suffix="%" value={inp.bookingFee} onChange={(bookingFee) => set({ bookingFee })} hint="Check your contract." error={errors.bookingFee} className="sm:max-w-[240px]" />}
          {k === "direct" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Num id="ch-direct-fee" label="Card fee" suffix="%" value={inp.directFee} onChange={(directFee) => set({ directFee })} error={errors.directFee} />
              <Num id="ch-direct-fixed" label="Fixed fee per booking" prefix="£" value={inp.directFixed} onChange={(directFixed) => set({ directFixed })} error={errors.directFixed} />
            </div>
          )}
          {k === "other" && <Num id="ch-other-fee" label="Other channel fee" suffix="%" value={inp.otherFee} onChange={(otherFee) => set({ otherFee })} error={errors.otherFee} className="sm:max-w-[240px]" />}
        </div>
      ))}
      <p className={cn("m-0 text-sm font-bold", Math.abs(total - 100) > 0.01 ? "text-brand" : "text-ink-copy")} role="status" data-share-total>
        {errors.shares ?? `Shares add up to 100%. Average platform fee: ${(f * 100).toFixed(2)}% of the guest booking value (cleaning fee included).`}
      </p>
    </div>
  );
}

function Bills({ inp, set, errors }: { inp: Inputs; set: Set; errors: Errors }) {
  const m = inp.monthly;
  const a = inp.annual;
  const setM = (patch: Partial<Inputs["monthly"]>) => set({ monthly: { ...m, ...patch } });
  const setA = (patch: Partial<Inputs["annual"]>) => set({ annual: { ...a, ...patch } });
  const interest = m.mortgageInterest ?? m.mortgagePayment;
  const monthly: [keyof Inputs["monthly"], string, string?][] = [
    ["rent", "Rent", "Rent-to-rent."],
    ["energy", "Energy standing charges and base use"],
    ["broadband", "Broadband and TV"],
    ["councilTax", "Council tax or business rates"],
    ["software", "Software", "Channel manager, pricing tool, smart locks."],
    ["serviceCharge", "Service charge"],
    ["other", "Other monthly"],
  ];
  const annual: [keyof Inputs["annual"], string, string?][] = [
    ["insurance", "Insurance"],
    ["groundRent", "Ground rent"],
    ["licence", "Licence or registration fees"],
    ["safety", "Safety certificates", "Gas, EICR, PAT, fire risk assessment."],
    ["tvLicence", "TV licence"],
    ["accountant", "Accountant fees"],
    ["other", "Other annual"],
  ];
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Num id="b-mortgage" label="Mortgage payment a month" prefix="£" value={m.mortgagePayment} onChange={(mortgagePayment) => setM({ mortgagePayment })} error={errors["monthly.mortgagePayment"]} />
        <Num
          id="b-interest"
          label="Of which interest"
          prefix="£"
          value={interest}
          onChange={(v) => setM({ mortgageInterest: v })}
          hint="Starts at the full payment (interest-only). Only interest counts against profit; the rest is capital."
          error={errors["monthly.mortgageInterest"]}
        />
      </div>
      <fieldset className="m-0 grid gap-4 border-none p-0 sm:grid-cols-2">
        <legend className="mb-3 p-0 text-[13px] font-extrabold tracking-[0.6px] text-muted uppercase">Monthly</legend>
        {monthly.map(([k, label, hint]) => (
          <Num key={k} id={`b-${k}`} label={label} prefix="£" value={(m[k] as number) ?? 0} onChange={(v) => setM({ [k]: v })} hint={hint} error={errors[`monthly.${k}`]} />
        ))}
      </fieldset>
      <fieldset className="m-0 grid gap-4 border-none p-0 sm:grid-cols-2">
        <legend className="mb-3 p-0 text-[13px] font-extrabold tracking-[0.6px] text-muted uppercase">Yearly (we divide by 12)</legend>
        {annual.map(([k, label, hint]) => (
          <Num key={k} id={`b-a-${k}`} label={`${label} a year`} prefix="£" value={a[k]} onChange={(v) => setA({ [k]: v })} hint={hint} error={errors[`annual.${k}`]} />
        ))}
      </fieldset>
    </div>
  );
}

function MonthTable({ inp, set, errors, r, c, open, onToggle }: { inp: Inputs; set: Set; errors: Errors; r: Result; c: Content; open: boolean; onToggle: (v: boolean) => void }) {
  const year = inp.year - 1;
  const setMonth = (i: number, patch: Partial<Inputs["months"][number]>) => set({ months: inp.months.map((m, k) => (k === i ? { ...m, ...patch } : m)) });
  return (
    <Section id="pricing" title={`Months (${inp.year})`} subtotal={perMonth(r.monthly.booking)} complete={!has(errors, "month", "avgStay", "cleaningFee")} open={open} onToggle={onToggle}>
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <label htmlFor="d-year" className="text-[15px] font-bold">
            Year
          </label>
          <select id="d-year" className="field min-h-11" value={inp.year} onChange={(e) => set({ year: Number(e.target.value) })}>
            {[year, year + 1, year + 2].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="btn btn-outline min-h-11" onClick={() => set(copyJanuary(inp))} data-copy-january>
          Copy January to all
        </button>
      </div>
      <div className="grid gap-2">
        <p className="m-0 text-[15px] font-bold">Apply a shape</p>
        <p className="m-0 -mt-1 text-[13px] text-muted">Scales your Quick rate ({money(inp.rate)}) and occupancy ({inp.occupancy}%). Example shape: replace with your own figures.</p>
        <div className="flex flex-wrap gap-2">
          {c.shapes.map((s) => (
            <button key={s.id} type="button" className="btn btn-outline min-h-11" onClick={() => set({ months: applyShape(inp, s).months })} data-shape={s.id}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-1">
        <span className="flex items-center gap-2 text-[13px] font-bold">
          Rate <Sparkline values={inp.months.map((m) => m.rate)} label={`Rate from ${money(Math.min(...inp.months.map((m) => m.rate)))} to ${money(Math.max(...inp.months.map((m) => m.rate)))}`} />
        </span>
        <span className="flex items-center gap-2 text-[13px] font-bold">
          Occupancy <Sparkline values={inp.months.map((m) => m.occupancy)} label={`Occupancy from ${Math.min(...inp.months.map((m) => m.occupancy))}% to ${Math.max(...inp.months.map((m) => m.occupancy))}%`} />
        </span>
      </div>
      <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <table className="w-full min-w-[520px] border-collapse text-sm" data-month-table>
          <caption className="sr-only-label">Rate, occupancy, owner nights and average stay for each month of {inp.year}</caption>
          <thead className="text-[12px] tracking-[0.5px] text-muted uppercase">
            <tr>
              <th scope="col" className="px-1 py-2 text-left">
                Month
              </th>
              <th scope="col" className="px-1 py-2 text-left">
                Rate £
              </th>
              <th scope="col" className="px-1 py-2 text-left">
                Occupancy %
              </th>
              <th scope="col" className="px-1 py-2 text-left">
                Owner nights
              </th>
              <th scope="col" className="px-1 py-2 text-left">
                Stay (optional)
              </th>
            </tr>
          </thead>
          <tbody>
            {inp.months.map((m, i) => (
              <tr key={i} className="border-t border-line" data-month={i}>
                <th scope="row" className="px-1 py-1.5 text-left font-bold">
                  {MONTHS[i].slice(0, 3)}
                  {r.lossMonths.includes(i) && <span className="ml-1 text-[11px] font-extrabold text-brand">loss</span>}
                </th>
                <td className="px-1 py-1.5">
                  <Num id={`m-${i}-rate`} label={`${MONTHS[i]} nightly rate`} hideLabel value={m.rate} onChange={(rate) => setMonth(i, { rate })} error={errors[`month.${i}.rate`]} />
                </td>
                <td className="px-1 py-1.5">
                  <Num id={`m-${i}-occ`} label={`${MONTHS[i]} occupancy %`} hideLabel value={m.occupancy} onChange={(occupancy) => setMonth(i, { occupancy })} error={errors[`month.${i}.occupancy`]} />
                </td>
                <td className="px-1 py-1.5">
                  <Num id={`m-${i}-owner`} label={`${MONTHS[i]} owner-blocked nights`} hideLabel value={m.ownerNights} onChange={(ownerNights) => setMonth(i, { ownerNights })} error={errors[`month.${i}.ownerNights`]} />
                </td>
                <td className="px-1 py-1.5">
                  <Num
                    id={`m-${i}-stay`}
                    label={`${MONTHS[i]} average stay (nights, optional)`}
                    hideLabel
                    value={m.avgStay ?? Number.NaN}
                    placeholder={String(inp.avgStay)}
                    onChange={(v) => setMonth(i, { avgStay: Number.isFinite(v) && v > 0 ? v : null })}
                    error={errors[`month.${i}.avgStay`]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Num id="d-stay" label="Average length of stay (all months)" suffix="nights" value={inp.avgStay} onChange={(avgStay) => set({ avgStay })} hint="Used for any month without its own." error={errors.avgStay} />
        <Num id="d-clean" label="Cleaning fee charged to guests per stay" prefix="£" value={inp.cleaningFee} onChange={(cleaningFee) => set({ cleaningFee })} hint="Shared with Quick mode." error={errors.cleaningFee} />
      </div>
    </Section>
  );
}
