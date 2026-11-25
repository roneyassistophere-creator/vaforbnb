"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { copy, storageKey, toolSlug } from "@/content/tools/certificateReminders";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { deviceStorage } from "@/lib/tools/deviceStorage";
import { downloadText } from "@/lib/tools/download";
import { formatLong } from "@/lib/tools/dates";
import { fillTemplate, formatDate, londonToday, numberListFigure, type Figures } from "@/lib/tools/figures";
import {
  activeProperty,
  addProperty,
  buildAllSchedules,
  buildCalendarFile,
  buildSchedule,
  calendarFileName,
  cleanStore,
  deleteCustom,
  deleteProperty,
  emptyStore,
  eventCount,
  googleLinkFor,
  itemByParam,
  itemsFor,
  monthsText,
  nationLabels,
  newId,
  patMonths,
  renameProperty,
  scheduleCsv,
  setDate,
  summaryText,
  tagFor,
  updateProperty,
  upsertCustom,
  withExample,
  withoutExample,
  type CustomItem,
  type ItemKey,
  type Nation,
  type PropertyData,
  type ScheduleRow,
  type Settings,
  type Site,
  type Store,
} from "@/lib/tools/certificates";
import { DateField } from "../DateField";
import { PropertyPicker } from "../PropertyPicker";
import { ActionsPanel } from "./Actions";
import { CheckCard } from "./CheckCard";
import { CustomForm } from "./CustomForm";
import { useCertificateResult } from "./ResultContext";
import { DueTable, SummaryPanel, Timeline } from "./Results";

const fileSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "property";
const chip =
  "flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-line px-4 text-sm font-semibold has-checked:border-ink has-checked:bg-sand has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink";
const linkBtn = "min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold underline underline-offset-2";

export function CertificateReminders({ figures, site }: { figures: Figures; site: Site }) {
  const [store, setStore] = useState<Store>(emptyStore);
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [customMode, setCustomMode] = useState<"new" | string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [message, setMessage] = useState("");
  const counted = useRef(new Set<string>());
  const { setShown } = useCertificateResult();

  /* ---- Load (this device only) ---- */
  useEffect(() => {
    track("tool_opened", toolSlug);
    const t = londonToday();
    const saved = cleanStore(deviceStorage.read(storageKey));
    let param: string | null = null;
    try {
      param = new URLSearchParams(window.location.search).get("item");
    } catch {
      // ignore
    }
    // Restoring once after hydration: the server render has no storage, URL or "today".
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(t);
    if (saved) setStore(saved);
    if (param && itemByParam(param)) setHighlight(itemByParam(param)!.param);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    // Reports whether saving to this device's storage worked (an external system).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaveFailed(!deviceStorage.write(storageKey, store));
  }, [ready, store]);

  // ?item=gas: scroll to that check and highlight it.
  useEffect(() => {
    if (!ready || !highlight) return;
    const el = document.getElementById(`item-${highlight}`);
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus({ preventScroll: true });
    });
    const t = setTimeout(() => setHighlight(null), 6000);
    return () => clearTimeout(t);
  }, [ready, highlight]);

  /* ---- Derived ---- */
  const property = activeProperty(store);
  const settings = store.settings;
  const multiple = store.properties.length > 1;
  const rows = useMemo(() => (today ? buildSchedule(property, figures, today, settings.remindDays) : []), [property, figures, today, settings.remindDays]);
  const allRows = useMemo(() => (today ? buildAllSchedules(store.properties, figures, today, settings.remindDays) : []), [store.properties, figures, today, settings.remindDays]);
  const scopeAll = multiple && settings.scope === "all";
  const fileRows = scopeAll ? allRows : rows;

  useEffect(() => {
    setShown(today ? { rows, figures } : null);
  }, [rows, figures, today, setShown]);

  const rulesChecked = typeof figures.rulesLastChecked?.value === "string" ? formatDate(figures.rulesLastChecked.value) : "";
  const rowFor = (key: string) => rows.find((r) => r.key === key);

  /* ---- Updates ---- */
  const update = (fn: (p: PropertyData) => PropertyData) => setStore((s) => updateProperty(s, property.id, fn));
  const setSettings = (patch: Partial<Settings>) => setStore((s) => ({ ...s, settings: { ...s.settings, ...patch } }));

  const setItemDate = (key: ItemKey, iso: string) => {
    if (iso && !counted.current.has(key)) {
      counted.current.add(key);
      track("item_added", toolSlug, { type: key });
    }
    update((p) => setDate(p, key, iso));
  };

  const saveCustom = (c: Omit<CustomItem, "id">) => {
    const editing = customMode && customMode !== "new" ? customMode : null;
    update((p) => upsertCustom(p, { ...c, id: editing ?? newId("c") }));
    if (!editing) track("item_added", toolSlug, { type: "custom" });
    setMessage(editing ? `Updated “${c.name}”.` : `Added “${c.name}”.`);
    setCustomMode(null);
  };

  /* ---- Files ---- */
  const download = (list: ScheduleRow[], name: string | null, s: Settings = settings) => {
    if (!today) return;
    downloadText(calendarFileName(name, today), buildCalendarFile(list, s, new Date(), figures, site), "text/calendar");
    track("file_downloaded", toolSlug, { type: "ics" });
  };
  const downloadCsv = () => {
    if (!today) return;
    downloadText(`vaforbnb-due-dates-${scopeAll ? "all-properties" : fileSlug(property.name)}-${today}.csv`, scheduleCsv(fileRows), "text/csv");
    track("file_downloaded", toolSlug, { type: "csv" });
  };
  const summary = () =>
    summaryText(fileRows, { title: `Holiday let checks: ${scopeAll ? "all properties" : property.name}`, rulesChecked, disclaimer: copy.disclaimer });

  const clearAll = () => {
    deviceStorage.remove(storageKey);
    setStore(emptyStore());
    setConfirmClear(false);
    setCustomMode(null);
    setMessage(copy.clear.done);
  };

  if (!ready || !today) {
    return <div data-tool={toolSlug} className="h-[520px] animate-pulse rounded-[20px] border border-line bg-white" aria-busy="true" aria-label="Loading the reminder builder" />;
  }

  /* ---- Pieces ---- */
  const C = copy.checks;
  const defs = itemsFor(property, figures);
  const hasExample = store.properties.some((p) => p.example);
  const patOptions = numberListFigure(figures, "cert.pat.monthsOptions");

  const cardProps = (key: string) => {
    const row = rowFor(key);
    return {
      row,
      googleHref: row?.due ? googleLinkFor(row, settings, figures, today, site) : null,
      onDownload: row?.due ? () => download([row], property.name, { ...settings, includeOverdue: true }) : undefined,
    };
  };

  const setup = (
    <div className="mb-5 grid gap-4 rounded-[20px] border border-line bg-white p-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_auto] md:items-start md:p-6">
      <PropertyPicker
        properties={store.properties}
        activeId={property.id}
        onSelect={(id) => (setStore((s) => ({ ...s, activePropertyId: id })), setCustomMode(null))}
        onAdd={(name) => (setStore((s) => addProperty(s, name)), setCustomMode(null))}
        onRename={(name) => setStore((s) => renameProperty(s, property.id, name))}
        onDelete={() => setStore((s) => deleteProperty(s, property.id))}
        deleteText={`Delete “${property.name}” and its dates from this device?`}
      />
      <label className="grid gap-1.5 text-sm font-bold">
        {copy.setup.nation}
        <select className="field min-h-12" value={property.nation} onChange={(e) => update((p) => ({ ...p, nation: e.target.value as Nation }))}>
          {(Object.keys(nationLabels) as Nation[]).map((n) => (
            <option key={n} value={n}>
              {nationLabels[n]}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="m-0 min-w-0 border-none p-0">
        <legend className="mb-1.5 p-0 text-sm font-bold">{copy.setup.gas}</legend>
        <div className="flex gap-2">
          {[true, false].map((v) => (
            <label key={String(v)} className={chip}>
              <input type="radio" name="has-gas" checked={property.hasGas === v} onChange={() => update((p) => ({ ...p, hasGas: v }))} className="size-4 accent-ink" />
              {v ? "Yes" : "No"}
            </label>
          ))}
        </div>
        {!property.hasGas && <p className="m-0 mt-2 max-w-[260px] text-[13px] text-muted">{copy.setup.gasNo}</p>}
      </fieldset>
    </div>
  );

  const checks = (
    <section aria-labelledby="cert-checks" className="grid min-w-0 gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="cert-checks" className="m-0 text-xl font-extrabold">
            {C.title}
          </h2>
          <p className="m-0 mt-1 text-sm text-ink-copy">{C.intro}</p>
        </div>
        {!hasExample && (
          <button type="button" onClick={() => setStore((s) => withExample(s, today))} className="btn btn-outline min-h-11">
            {copy.example.button}
          </button>
        )}
      </div>

      {property.example && (
        <p className="m-0 flex flex-wrap items-center gap-3 rounded-[12px] bg-amber-25 px-4 py-3 text-sm font-bold text-ink" role="status">
          {copy.example.banner}
          <button type="button" onClick={() => setStore(withoutExample)} className={cn(linkBtn, "text-brand")}>
            {copy.example.clear}
          </button>
        </p>
      )}

      {defs.map((def) => {
        const tag = tagFor(def, property, figures)!;
        const props = cardProps(def.key);
        return (
          <CheckCard
            key={def.key}
            id={`item-${def.param}`}
            title={def.name}
            tag={tag}
            hint={def.hint}
            highlighted={highlight === def.param}
            rulesHref={`${site.rulesPath}#${def.anchor}`}
            {...props}
          >
            <DateField label={def.dateLabel} value={property.dates[def.key] ?? ""} onChange={(v) => setItemDate(def.key, v)} error={props.row?.error} />
            {def.key === "gas" && (
              <details className="group rounded-[12px] border border-line px-3.5" open={!!property.gasPrevDue}>
                <summary className="flex min-h-11 cursor-pointer items-center text-sm font-bold text-ink">{C.gasEarly}</summary>
                <div className="pb-3.5">
                  <DateField
                    label={C.gasPrevDue}
                    hint={fillTemplate(C.gasPrevDueHint, figures)}
                    value={property.gasPrevDue ?? ""}
                    onChange={(v) => update((p) => ({ ...p, gasPrevDue: v || undefined }))}
                  />
                </div>
              </details>
            )}
            {def.key === "eicr" && <DateField label={C.eicrNext} value={property.eicrNext ?? ""} onChange={(v) => update((p) => ({ ...p, eicrNext: v || undefined }))} />}
            {def.key === "pat" && (
              <label className="grid max-w-[260px] gap-1.5 text-sm font-bold">
                {C.patEvery}
                <select className="field min-h-12" value={patMonths(property, figures)} onChange={(e) => update((p) => ({ ...p, patMonths: Number(e.target.value) }))}>
                  {patOptions.map((m) => (
                    <option key={m} value={m}>
                      {monthsText(m)}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </CheckCard>
        );
      })}

      {property.custom.map((c) =>
        customMode === c.id ? (
          <CustomForm key={c.id} initial={c} today={today} onSave={saveCustom} onCancel={() => setCustomMode(null)} />
        ) : (
          <CheckCard
            key={c.id}
            id={`item-${c.id}`}
            title={c.name}
            tag="own"
            hint={c.mode === "interval" && c.months ? `Every ${monthsText(c.months)}.` : "Due on a fixed date."}
            {...cardProps(c.id)}
            headerActions={
              confirmDelete === c.id ? (
                <span className="flex flex-wrap items-center gap-2 text-sm font-bold" role="alert">
                  Delete “{c.name}”?
                  <button type="button" className="btn btn-coral min-h-11" onClick={() => (update((p) => deleteCustom(p, c.id)), setConfirmDelete(null), setMessage(`Deleted “${c.name}”.`))}>
                    Yes, delete
                  </button>
                  <button type="button" className="btn btn-outline min-h-11" onClick={() => setConfirmDelete(null)}>
                    Cancel
                  </button>
                </span>
              ) : (
                <>
                  <button type="button" className={cn(linkBtn, "text-ink")} onClick={() => setCustomMode(c.id)} aria-label={`Edit ${c.name}`}>
                    Edit
                  </button>
                  <button type="button" className={cn(linkBtn, "text-brand")} onClick={() => setConfirmDelete(c.id)} aria-label={`Delete ${c.name}`}>
                    Delete
                  </button>
                </>
              )
            }
          >
            {c.mode === "interval" ? (
              <DateField label={copy.custom.last} value={c.last ?? ""} onChange={(v) => update((p) => upsertCustom(p, { ...c, last: v || undefined }))} error={rowFor(c.id)?.error} />
            ) : (
              <DateField label={copy.custom.due} value={c.due ?? ""} onChange={(v) => update((p) => upsertCustom(p, { ...c, due: v || undefined }))} />
            )}
          </CheckCard>
        ),
      )}

      {customMode === "new" ? (
        <CustomForm today={today} onSave={saveCustom} onCancel={() => setCustomMode(null)} />
      ) : (
        <button
          type="button"
          onClick={() => (setCustomMode("new"), setMessage(""))}
          className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-line-strong bg-transparent text-[15px] font-bold text-ink hover:border-ink"
        >
          <span aria-hidden="true">+</span> {copy.custom.add}
        </button>
      )}
      <p aria-live="polite" className="m-0 min-h-5 text-sm font-bold text-green">
        {message}
      </p>

      <div className="border-t border-line pt-3">
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
          <button type="button" onClick={() => setConfirmClear(true)} className={cn(linkBtn, "text-brand")}>
            {copy.clear.link}
          </button>
        )}
      </div>
    </section>
  );

  const tableTitle = scopeAll ? "Due dates: all properties" : `Due dates: ${property.name}`;

  return (
    <div data-tool={toolSlug} data-ready>
      {setup}
      {saveFailed && (
        <p className="mb-4 rounded-[12px] bg-coral-50 px-4 py-3 text-sm font-bold text-brand" role="alert">
          {copy.storageFailed}
        </p>
      )}

      {/* Mobile: summary, checks, timeline, actions. Desktop: checks left, the rest right (sticky). */}
      <div className="flex flex-col gap-5 md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-start">
        <div className="order-2 min-w-0 md:order-1">{checks}</div>
        <div className="contents md:sticky md:top-6 md:order-2 md:grid md:max-h-[calc(100dvh-3rem)] md:gap-5 md:overflow-y-auto md:overscroll-contain md:pb-1">
          <div className="order-1">
            <SummaryPanel rows={rows} propertyName={property.name} />
          </div>
          <div className="order-3 min-w-0">
            <Timeline rows={rows} today={today} />
          </div>
          <div className="order-4">
            <ActionsPanel
              settings={settings}
              figures={figures}
              onSettings={setSettings}
              multiple={multiple}
              events={eventCount(fileRows, settings)}
              onDownload={() => download(fileRows, scopeAll ? null : property.name)}
              onCsv={downloadCsv}
              summary={summary}
              onPrint={() => window.print()}
            />
          </div>
        </div>
      </div>

      {/* Due dates table */}
      <section aria-labelledby="cert-table" className="mt-8">
        <h2 id="cert-table" className="h2 mb-4">
          {tableTitle}
        </h2>
        <DueTable rows={fileRows} caption={tableTitle} />
      </section>

      {/* Print view: logo, date and the table only */}
      <div data-print-area className="hidden print:block">
        <div className="mb-4 flex items-center justify-between">
          <Logo />
          <span className="text-sm">Printed {formatLong(today)}</span>
        </div>
        <h2 className="m-0 mb-3 text-xl font-extrabold">{tableTitle}</h2>
        <DueTable rows={fileRows} caption={tableTitle} compact />
        <p className="mt-4 text-xs">
          Rules last checked {rulesChecked}. {copy.disclaimer}
        </p>
      </div>
    </div>
  );
}
