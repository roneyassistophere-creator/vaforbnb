"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { copy, storageKey, toolSlug } from "@/content/tools/visitorLevy";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { addDays, formatLong, formatMonthYear, formatWeekday, isValidDate } from "@/lib/tools/dates";
import { deviceStorage } from "@/lib/tools/deviceStorage";
import { downloadText } from "@/lib/tools/download";
import { fillTemplate, formatDate, londonToday, type Figures } from "@/lib/tools/figures";
import {
  calculateLevy,
  chargeableNights,
  cleanStore,
  emptyInputs,
  emptyStore,
  fieldsFor,
  formatPence,
  listAreas,
  logCsv,
  nationNames,
  newId,
  otherChoices,
  rateShort,
  resolveChoice,
  resultText,
  stayNights,
  type Area,
  type LevyInputs,
  type LogEntry,
  type Store,
} from "@/lib/tools/visitor-levy";
import { DateField } from "../DateField";
import { MoneyField } from "../MoneyField";
import { NumberField } from "../NumberField";
import { Toggle } from "../Toggle";
import { LevyLog } from "./LevyLog";
import { LevyResultPanel } from "./LevyResultPanel";
import { useLevyResult } from "./ResultContext";

const chip =
  "flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-line px-4 text-sm font-semibold has-checked:border-ink has-checked:bg-sand has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink";
const card = "rounded-[20px] border border-line bg-white p-5 md:p-6";

export function VisitorLevyCalculator({ figures, today: serverToday }: { figures: Figures; today: string }) {
  const areas = useMemo(() => listAreas(figures), [figures]);
  const [store, setStore] = useState<Store>(() => emptyStore(areas[0]?.id));
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState(serverToday);
  const [saveFailed, setSaveFailed] = useState(false);
  const [reference, setReference] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [logMessage, setLogMessage] = useState("");
  const [undo, setUndo] = useState<{ entry: LogEntry; index: number } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inputsRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const calculated = useRef(new Set<string>());
  const { setShown } = useLevyResult();

  /* ---- Load (this device only) ---- */
  useEffect(() => {
    track("tool_opened", toolSlug);
    const saved = cleanStore(deviceStorage.read(storageKey));
    let param: string | null = null;
    try {
      param = new URLSearchParams(window.location.search).get("area");
    } catch {
      // ignore
    }
    // Restoring once after hydration: the server render has no storage or URL.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(londonToday());
    const next = saved ?? emptyStore(areas[0]?.id);
    if (param && resolveChoice(param, figures).kind !== "unknown") next.areaId = param;
    setStore(next);
    setReady(true);
  }, [areas, figures]);

  useEffect(() => {
    if (!ready) return;
    // Reports whether saving to this device's storage worked (an external system).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaveFailed(!deviceStorage.write(storageKey, store));
  }, [ready, store]);

  useEffect(() => () => clearTimeout(undoTimer.current), []);

  // Mobile: a small levy bar while the inputs are on screen and the big levy figure isn't.
  const hasArea = resolveChoice(store.areaId, figures).kind === "area";
  useEffect(() => {
    const a = inputsRef.current;
    const b = resultRef.current?.querySelector("[data-levy-total]");
    if (!a || !b || typeof IntersectionObserver === "undefined") return;
    let inputsVisible = false;
    let resultVisible = false;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === a) inputsVisible = e.isIntersecting;
        if (e.target === b) resultVisible = e.isIntersecting;
      }
      setShowBar(inputsVisible && !resultVisible);
    });
    io.observe(a);
    io.observe(b);
    return () => io.disconnect();
  }, [hasArea]);

  /* ---- Derived ---- */
  // Memoised: a new area object on every render would re-run the effects below forever.
  const choice = useMemo(() => resolveChoice(store.areaId, figures), [store.areaId, figures]);
  const area: Area | null = choice.kind === "area" ? choice.area : null;
  const inputs = store.inputs;
  const calc = useMemo(() => (area ? calculateLevy(area, inputs, figures) : null), [area, inputs, figures]);
  const result = calc?.ok ? calc.result : null;
  const errors = calc && !calc.ok ? calc.errors : {};

  useEffect(() => {
    setShown(choice.kind === "unknown" ? null : { area, result });
    if (area && result && !calculated.current.has(area.id)) {
      calculated.current.add(area.id);
      track("levy_calculated", toolSlug, { area: area.id });
    }
  }, [area, result, choice.kind, setShown]);

  const nightsN = Number(inputs.nights);
  const stayOk = isValidDate(inputs.checkIn) && Number.isInteger(nightsN) && nightsN >= 1 && nightsN <= 365;
  const checkOut = stayOk ? addDays(inputs.checkIn, nightsN) : null;
  const priceDates = area && stayOk ? chargeableNights(area, stayNights(inputs.checkIn, nightsN)).chargeable : [];
  const rulesChecked = typeof figures.rulesLastChecked?.value === "string" ? formatDate(figures.rulesLastChecked.value) : "";

  /* ---- Updates ---- */
  const set = (patch: Partial<LevyInputs>) => {
    setStore((s) => ({ ...s, inputs: { ...s.inputs, ...patch } }));
    setLogMessage("");
  };
  const pickArea = (id: string) => {
    setStore((s) => ({ ...s, areaId: id }));
    setLogMessage("");
  };

  const saveToLog = () => {
    if (!area || !result) return;
    const entry: LogEntry = {
      id: editingId ?? newId(),
      reference: reference.trim().slice(0, 80),
      areaId: area.id,
      areaName: area.name,
      checkIn: inputs.checkIn,
      nights: result.nights.length,
      guests: area.type === "perPersonNight" ? Number(inputs.guests) : null,
      chargeableNights: result.chargeable.length,
      levyPence: result.totalPence,
      inputs,
    };
    setStore((s) => ({ ...s, log: editingId ? s.log.map((e) => (e.id === editingId ? entry : e)) : [...s.log, entry] }));
    setLogMessage(editingId ? copy.result.updated : copy.result.added);
    if (!editingId) track("log_added", toolSlug, { area: area.id });
    setEditingId(null);
    setReference("");
  };

  const editEntry = (e: LogEntry) => {
    setStore((s) => ({ ...s, areaId: e.areaId, inputs: e.inputs }));
    setEditingId(e.id);
    setReference(e.reference);
    setLogMessage("");
    document.getElementById("levy-tool")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const deleteEntry = (e: LogEntry) => {
    const index = store.log.findIndex((x) => x.id === e.id);
    setStore((s) => ({ ...s, log: s.log.filter((x) => x.id !== e.id) }));
    if (editingId === e.id) setEditingId(null);
    setUndo({ entry: e, index });
    clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), 5000);
  };

  const undoDelete = () => {
    if (!undo) return;
    setStore((s) => {
      const log = [...s.log];
      log.splice(Math.min(undo.index, log.length), 0, undo.entry);
      return { ...s, log };
    });
    setUndo(null);
    clearTimeout(undoTimer.current);
  };

  const downloadCsv = (entries: LogEntry[]) => {
    downloadText(`visitor-levy-log-${today}.csv`, logCsv(entries), "text/csv");
    track("file_downloaded", toolSlug, { type: "csv" });
  };

  const tryExample = () => {
    setStore((s) => ({ ...s, areaId: "edinburgh", inputs: { ...emptyInputs(), checkIn: "2026-08-01", nights: "7", price: "150" } }));
    setEditingId(null);
    setLogMessage("");
  };
  const reset = () => {
    setStore((s) => ({ ...s, inputs: emptyInputs() }));
    setEditingId(null);
    setReference("");
    setLogMessage("");
  };
  const clearAll = () => {
    deviceStorage.remove(storageKey);
    setStore(emptyStore(areas[0]?.id));
    setEditingId(null);
    setReference("");
    setConfirmClear(false);
    setLogMessage(copy.clear.done);
  };

  /* ---- Pieces ---- */
  const P = copy.price;
  const fields = area ? fieldsFor(area) : null;
  const message = calc && !calc.ok ? (calc.missing.length ? fillTemplate(copy.result.empty, figures, { missing: joinAnd(calc.missing) }) : "Check the fields marked in red.") : "";

  const strip = (
    <div className="mb-5">
      <p className="m-0 mb-2 text-sm font-bold text-ink" id="area-strip-label">
        {copy.strip.label}
      </p>
      <div className="flex gap-2.5 overflow-x-auto pb-1 md:flex-wrap" role="group" aria-labelledby="area-strip-label">
        {areas.map((a) => {
          const live = a.start <= today;
          const selected = store.areaId === a.id;
          return (
            <button
              key={a.id}
              type="button"
              aria-pressed={selected}
              onClick={() => pickArea(a.id)}
              className={cn(
                "flex min-h-[76px] min-w-[168px] flex-none cursor-pointer flex-col items-start gap-1 rounded-[16px] border-[1.5px] bg-white px-3.5 py-2.5 text-left hover:border-ink",
                selected ? "border-ink shadow-[0_0_0_2px_#14212B]" : "border-line",
              )}
            >
              <span className="text-[15px] font-extrabold text-ink">{a.name}</span>
              <span className="text-[13px] text-ink-copy">{rateShort(a)}</span>
              <span
                className={cn("rounded-full px-2 py-0.5 text-[11px] font-extrabold", live ? "bg-green-100 text-green" : "bg-amber-25 text-[#6B4A00]")}
              >
                {live ? copy.strip.inForce : `${copy.strip.from} ${formatMonthYear(a.start)}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const groups: { nation: keyof typeof nationNames; items: { id: string; name: string }[] }[] = (["scotland", "wales", "england"] as const).map((nation) => ({
    nation,
    items: [...areas.filter((a) => a.nation === nation), ...otherChoices.filter((o) => o.nation === nation)],
  }));

  const inputsCol = (
    <div ref={inputsRef} className="grid min-w-0 gap-5">
      <div className={card}>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="grid min-w-[220px] flex-1 gap-1.5">
            <label htmlFor="levy-area" className="text-sm font-bold">
              {copy.area.label}
            </label>
            <select id="levy-area" className="field min-h-12" value={store.areaId} onChange={(e) => pickArea(e.target.value)}>
              {groups.map((g) => (
                <optgroup key={g.nation} label={nationNames[g.nation]}>
                  {g.items.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={tryExample} className="btn btn-outline min-h-11">
              {copy.example}
            </button>
            <button type="button" onClick={reset} className="btn btn-outline min-h-11">
              {copy.reset}
            </button>
          </div>
        </div>

        {!area ? (
          <p className="m-0 rounded-[12px] bg-steel-50 px-4 py-3 text-[15px] leading-[1.55] text-ink" role="status">
            {copy.area.other} Rates last checked {rulesChecked}.
          </p>
        ) : (
          <div className="grid gap-5">
            <fieldset className="m-0 grid min-w-0 gap-4 border-none p-0 sm:grid-cols-2 sm:items-start">
              <legend className="mb-3 p-0 text-base font-extrabold">{copy.stay.title}</legend>
              <DateField label={copy.stay.checkIn} value={inputs.checkIn} onChange={(v) => set({ checkIn: v })} error={errors.checkIn} />
              <NumberField
                name="nights"
                label={copy.stay.nights}
                value={inputs.nights}
                onChange={(v) => set({ nights: v })}
                min={1}
                max={365}
                error={errors.nights}
                hint={checkOut ? `${copy.stay.checkOut}: ${formatWeekday(checkOut)}` : undefined}
              />
            </fieldset>

            {fields?.price && (
              <fieldset className="m-0 grid min-w-0 gap-4 border-none p-0">
                <legend className="mb-3 p-0 text-base font-extrabold">{P.title}</legend>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Price mode">
                  {(["same", "byNight"] as const).map((m) => (
                    <label key={m} className={chip}>
                      <input type="radio" name="price-mode" checked={inputs.priceMode === m} onChange={() => set({ priceMode: m })} className="size-4 accent-ink" />
                      {m === "same" ? P.same : P.byNight}
                    </label>
                  ))}
                </div>
                {inputs.priceMode === "same" ? (
                  <MoneyField label={P.perNight} value={inputs.price} onChange={(v) => set({ price: v })} error={errors.price} className="max-w-[260px]" />
                ) : priceDates.length === 0 ? (
                  <p className="m-0 text-sm text-muted">{stayOk ? P.noChargeable : "Add the check-in date and nights first."}</p>
                ) : (
                  <div className="grid gap-3">
                    <p className="m-0 text-[13px] text-muted">{P.byNightHint}</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {priceDates.map((d, i) => (
                        <MoneyField
                          key={d}
                          compact
                          label={formatWeekday(d, false)}
                          value={inputs.prices[i] ?? ""}
                          onChange={(v) => {
                            const prices = [...inputs.prices];
                            prices[i] = v;
                            set({ prices });
                          }}
                        />
                      ))}
                    </div>
                    {errors.prices && (
                      <p className="m-0 text-sm font-bold text-brand" role="alert">
                        {errors.prices}
                      </p>
                    )}
                    {priceDates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => set({ prices: priceDates.map(() => inputs.prices[0] ?? "") })}
                        className="btn btn-outline min-h-11 justify-self-start"
                        disabled={!inputs.prices[0]}
                      >
                        {P.copyFirst}
                      </button>
                    )}
                  </div>
                )}
                <Toggle label={P.vat} hint={fillTemplate(P.vatHint, figures)} checked={inputs.includesVat} onChange={(v) => set({ includesVat: v })} />
                <MoneyField label={P.fees} hint={P.feesHint} value={inputs.fees} onChange={(v) => set({ fees: v })} error={errors.fees} className="max-w-[260px]" />
              </fieldset>
            )}

            {fields?.guests && (
              <fieldset className="m-0 grid min-w-0 gap-4 border-none p-0">
                <legend className="mb-3 p-0 text-base font-extrabold">Guests</legend>
                <div className="max-w-[260px]">
                  <NumberField name="guests" label={copy.guests.label} hint={copy.guests.hint} value={inputs.guests} onChange={(v) => set({ guests: v })} min={1} max={30} error={errors.guests} />
                </div>
                {fields.accommodation && (
                  <fieldset className="m-0 min-w-0 border-none p-0">
                    <legend className="mb-2 p-0 text-[15px] font-bold">{copy.guests.type}</legend>
                    <div className="flex flex-wrap gap-2">
                      {(["standard", "lower"] as const).map((t) => (
                        <label key={t} className={chip}>
                          <input type="radio" name="accommodation" checked={inputs.accommodation === t} onChange={() => set({ accommodation: t })} className="size-4 accent-ink" />
                          {t === "standard" ? copy.guests.standard : copy.guests.lower}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}
              </fieldset>
            )}

            {fields?.exemption && area.exemptBookedPaidBefore && (
              <fieldset className="m-0 min-w-0 border-none p-0">
                <legend className="mb-2 p-0 text-[15px] leading-[1.4] font-bold">{P.exemption.replace("{date}", formatLong(area.exemptBookedPaidBefore))}</legend>
                <div className="flex gap-2">
                  {[false, true].map((v) => (
                    <label key={String(v)} className={chip}>
                      <input type="radio" name="booked-before" checked={inputs.bookedPaidBefore === v} onChange={() => set({ bookedPaidBefore: v })} className="size-4 accent-ink" />
                      {v ? "Yes" : "No"}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </div>
        )}
      </div>
      {saveFailed && (
        <p className="m-0 rounded-[12px] bg-coral-50 px-4 py-3 text-sm font-bold text-brand" role="alert">
          {copy.storageFailed}
        </p>
      )}
    </div>
  );

  return (
    <div data-tool={toolSlug} data-ready={ready ? "" : undefined} id="levy-tool" className="scroll-mt-6">
      {strip}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-start">
        {inputsCol}
        <div ref={resultRef} className="min-w-0 md:sticky md:top-6 md:max-h-[calc(100dvh-3rem)] md:overflow-y-auto md:overscroll-contain">
          {area ? (
            <LevyResultPanel
              area={area}
              result={result}
              message={message}
              copyText={() => (result ? resultText(area, inputs, result, { rulesChecked, disclaimer: copy.disclaimer }) : "")}
              reference={reference}
              onReference={setReference}
              onAdd={saveToLog}
              editing={!!editingId}
              onCancelEdit={() => (setEditingId(null), setReference(""))}
              logMessage={logMessage}
            />
          ) : (
            <section className={card} aria-label="Result">
              <p className="m-0 text-[15px] text-ink-copy">{copy.area.other}</p>
            </section>
          )}
        </div>
      </div>

      <div className="mt-6">
        <LevyLog
          log={store.log}
          open={store.logOpen}
          onToggle={() => setStore((s) => ({ ...s, logOpen: !s.logOpen }))}
          onEdit={editEntry}
          onDelete={deleteEntry}
          onCsv={downloadCsv}
          onClear={() => setStore((s) => ({ ...s, log: [] }))}
          undo={undo?.entry ?? null}
          onUndo={undoDelete}
        />
      </div>

      <div className="mt-4">
        {confirmClear ? (
          <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-coral p-3 text-sm font-bold" role="alert">
            <span className="flex-1">{copy.clear.confirm}</span>
            <button type="button" onClick={clearAll} className="btn btn-coral min-h-11">
              {copy.clear.yes}
            </button>
            <button type="button" onClick={() => setConfirmClear(false)} className="btn btn-outline min-h-11">
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmClear(true)} className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-brand underline underline-offset-2">
            {copy.clear.link}
          </button>
        )}
      </div>

      {/* Mobile: levy bar while the inputs are on screen */}
      {area && showBar && (
        <a
          href="#levy-result"
          className="fixed inset-x-0 bottom-0 z-40 flex min-h-14 items-center justify-between gap-3 border-t border-line bg-ink px-4 text-white no-underline shadow-[0_-6px_20px_rgba(20,33,43,0.15)] md:hidden"
          data-levy-bar
        >
          <span className="text-[15px] font-bold">
            Levy: <span className="text-lg font-extrabold tabular-nums">{result ? formatPence(result.totalPence) : "—"}</span>
          </span>
          <span className="text-sm font-bold text-coral-200">See details ↓</span>
        </a>
      )}
    </div>
  );
}

const joinAnd = (list: string[]) => (list.length > 1 ? `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}` : list[0]);
