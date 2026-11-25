"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { copy, storageKey, toolSlug } from "@/content/tools/londonNights";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { deviceStorage } from "@/lib/tools/deviceStorage";
import { makeHandoff, writeHandoff } from "@/lib/tools/handoff";
import { downloadText } from "@/lib/tools/download";
import { formatDate, londonToday, type Figures } from "@/lib/tools/figures";
import {
  activeProperty,
  addBooking,
  addProperty,
  addedMessage,
  bookingsCsv,
  cleanStore,
  countNights,
  deleteBooking,
  deleteProperty,
  draftToBooking,
  emptyStore,
  exampleBookings,
  formatRange,
  makeBackup,
  nightsBetween,
  platformName,
  renameProperty,
  restoreBooking,
  summaryText,
  updateBooking,
  type Booking,
  type Draft,
  type Store,
} from "@/lib/tools/london-nights";
import { BookingForm } from "./BookingForm";
import { BookingsList } from "./BookingsList";
import { PropertyPicker } from "../PropertyPicker";
import { FilesPanel } from "./FilesPanel";
import { NightsCalendar, NightsResultPanel } from "./NightsResult";
import { useLondonNightsResult } from "./ResultContext";

type Removed = { propertyId: string; index: number; booking: Booking };

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "property";

export function LondonNightsCounter({ figures }: { figures: Figures }) {
  const [store, setStore] = useState<Store>(emptyStore);
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [undo, setUndo] = useState<Removed | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { setShown } = useLondonNightsResult();

  /* ---- Load (this device only) ---- */
  useEffect(() => {
    track("tool_opened", toolSlug);
    const t = londonToday();
    const saved = cleanStore(deviceStorage.read(storageKey));
    // Restoring once after hydration: the server render has no storage or "today".
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(t);
    setYear(Number(t.slice(0, 4)));
    if (saved) setStore(saved);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    // Reports whether saving to this device's storage worked (an external system).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaveFailed(!deviceStorage.write(storageKey, store));
  }, [ready, store]);

  useEffect(() => () => clearTimeout(undoTimer.current), []);

  /* ---- Derived ---- */
  const property = activeProperty(store);
  const bookings = property.bookings;
  const result = useMemo(() => (year && today ? countNights(bookings, year, figures, today) : null), [bookings, year, today, figures]);

  useEffect(() => {
    setShown(result ? { result, hasBookings: bookings.length > 0 } : null);
  }, [result, bookings.length, setShown]);

  // Shared device format: tell other tools (the long-stay discount calculator) this is a London property. Only a flag, never bookings.
  const hasRealBookings = bookings.some((b) => !b.example);
  useEffect(() => {
    if (hasRealBookings) writeHandoff(makeHandoff("london-flag", toolSlug, { london: true }));
  }, [hasRealBookings]);

  const rulesChecked = typeof figures.rulesLastChecked?.value === "string" ? formatDate(figures.rulesLastChecked.value) : "";

  /* ---- Actions ---- */
  const save = (b: Booking, isEdit: boolean) => {
    setStore((s) => (isEdit ? updateBooking(s, property.id, b) : addBooking(s, property.id, b)));
    setEditing(null);
    setMessage(addedMessage(b, nightsBetween(b.checkIn, b.checkOut), platformName(b), isEdit ? "Updated" : "Added"));
    if (!isEdit) track("booking_added", toolSlug);
  };

  const remove = (b: Booking) => {
    const { store: next, removed } = deleteBooking(store, property.id, b.id);
    if (!removed) return;
    setStore(next);
    if (editing?.id === b.id) setEditing(null);
    setUndo(removed);
    setMessage("");
    clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), 5000);
  };

  const doUndo = () => {
    if (!undo) return;
    setStore((s) => restoreBooking(s, undo));
    setUndo(null);
    clearTimeout(undoTimer.current);
    setMessage("Booking restored.");
  };

  const importDrafts = (drafts: Draft[]) => {
    setStore((s) => drafts.reduce((acc, d) => addBooking(acc, property.id, draftToBooking(d)), s));
    setMessage(`Imported ${drafts.length} ${drafts.length === 1 ? "booking" : "bookings"}.`);
    track("import_used", toolSlug);
  };

  const tryExample = () => {
    if (!year) return;
    setStore((s) => exampleBookings(year).reduce((acc, b) => addBooking(acc, property.id, b), s));
    setMessage("Example bookings loaded.");
  };
  const clearExample = () =>
    setStore((s) => ({ ...s, properties: s.properties.map((p) => (p.id === property.id ? { ...p, bookings: p.bookings.filter((b) => !b.example) } : p)) }));

  const downloadCsv = () => {
    if (!result) return;
    downloadText(`${slug(property.name)}-${result.year}-nights.csv`, bookingsCsv(bookings, result, property.name), "text/csv");
    track("file_downloaded", toolSlug, { type: "csv" });
  };
  const backup = () => {
    downloadText(`london-90-night-counter-backup-${today ?? "data"}.json`, makeBackup(store, today ?? ""), "application/json");
    track("file_downloaded", toolSlug, { type: "backup" });
  };

  const clearAll = () => {
    deviceStorage.remove(storageKey);
    setStore(emptyStore());
    setEditing(null);
    setFilter(null);
    setMessage("All data cleared from this device.");
  };

  const showOverlaps = () => {
    const first = result?.overlaps[0];
    if (!first) return;
    setFilter(null);
    requestAnimationFrame(() => {
      const el = document.getElementById(`booking-${first.a}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.querySelector("button")?.focus({ preventScroll: true });
    });
  };

  /* ---- Quick check ---- */
  const C = copy.quickCheck;
  const quick = (
    <section aria-labelledby="quick-check" className="mb-6 rounded-[20px] border border-line bg-white p-5 md:p-6">
      <h2 id="quick-check" className="m-0 mb-4 text-lg font-extrabold">
        {C.title}
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {(
          [
            ["wholeHome", C.wholeHome, C.wholeHomeNo, "info"],
            ["paysCouncilTax", C.councilTax, C.councilTaxNo, "warn"],
          ] as const
        ).map(([key, q, note, tone]) => (
          <fieldset key={key} className="m-0 min-w-0 border-none p-0">
            <legend className="mb-2 p-0 text-[15px] leading-[1.4] font-bold text-ink">{q}</legend>
            <div className="flex gap-2">
              {[true, false].map((v) => (
                <label
                  key={String(v)}
                  className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-line px-4 text-sm font-semibold has-checked:border-ink has-checked:bg-sand has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
                >
                  <input type="radio" name={key} checked={store[key] === v} onChange={() => setStore((s) => ({ ...s, [key]: v }))} className="size-4 accent-ink" />
                  {v ? "Yes" : "No"}
                </label>
              ))}
            </div>
            {!store[key] && (
              <p className={cn("m-0 mt-3 rounded-[12px] px-4 py-3 text-sm leading-[1.55]", tone === "warn" ? "bg-coral-50 font-semibold text-brand" : "bg-steel-50 text-ink")} role="note">
                {note}
              </p>
            )}
          </fieldset>
        ))}
      </div>
    </section>
  );

  if (!ready || !result || !today || !year) {
    return (
      <div data-tool={toolSlug}>
        {quick}
        <div className="h-[420px] animate-pulse rounded-[20px] border border-line bg-white" aria-busy="true" aria-label="Loading the counter" />
      </div>
    );
  }

  const thisYear = Number(today.slice(0, 4));
  const resultPanel = (
    <NightsResultPanel
      result={result}
      hasBookings={bookings.length > 0}
      summary={() => summaryText(result, { propertyName: property.name, rulesChecked, disclaimer: copy.disclaimer })}
      onShowOverlaps={showOverlaps}
      onDownloadCsv={downloadCsv}
      onBackup={backup}
    />
  );

  return (
    <div data-tool={toolSlug} data-ready>
      {quick}

      {/* Property and year */}
      <div className="mb-5 grid gap-3 rounded-[20px] border border-line bg-white p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:p-6">
        <PropertyPicker
          properties={store.properties}
          activeId={property.id}
          label={copy.property}
          placeholder="For example: Flat 2, Hackney"
          onSelect={(id) => {
            setStore((s) => ({ ...s, activePropertyId: id }));
            setEditing(null);
            setFilter(null);
          }}
          onAdd={(name) => {
            setStore((s) => addProperty(s, name));
            setEditing(null);
            setFilter(null);
          }}
          onRename={(name) => setStore((s) => renameProperty(s, property.id, name))}
          onDelete={() => {
            setStore((s) => deleteProperty(s, property.id));
            setEditing(null);
          }}
          deleteText={`Delete “${property.name}” and its ${bookings.length} ${bookings.length === 1 ? "booking" : "bookings"} from this device?`}
        />
        <label className="grid gap-1.5 text-sm font-bold md:self-start">
          {copy.year}
          <select className="field min-h-12 md:w-32" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[thisYear - 1, thisYear, thisYear + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>

      {saveFailed && (
        <p className="mb-4 rounded-[12px] bg-coral-50 px-4 py-3 text-sm font-bold text-brand" role="alert">
          {copy.files.storageFailed}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-start">
        {/* Right on desktop (sticky), first on mobile */}
        <div className="order-1 grid gap-5 md:sticky md:top-6 md:order-2 md:max-h-[calc(100dvh-3rem)] md:overflow-y-auto md:overscroll-contain md:pb-1">
          {resultPanel}
          <div className="hidden md:block">
            <NightsCalendar result={result} bookings={bookings} today={today} />
          </div>
        </div>

        {/* Left on desktop */}
        <div className="order-2 grid min-w-0 gap-6 md:order-1">
          <div className="rounded-[20px] border border-line bg-white p-5 md:p-6">
            <BookingForm editing={editing} bookings={bookings} onSave={save} onCancelEdit={() => setEditing(null)} />
            <div aria-live="polite" className="mt-3 min-h-6 text-sm font-bold text-green">
              {message}
              {undo && (
                <span className="flex flex-wrap items-center gap-3 font-bold text-ink">
                  Deleted {formatRange(undo.booking.checkIn, undo.booking.checkOut)} ({platformName(undo.booking)}).
                  <button type="button" onClick={doUndo} className="btn btn-outline min-h-11">
                    {copy.list.undo}
                  </button>
                </span>
              )}
            </div>
          </div>

          <BookingsList
            bookings={bookings}
            result={result}
            year={year}
            filter={filter}
            onFilter={setFilter}
            onEdit={(b) => {
              setEditing(b);
              setMessage("");
              document.getElementById("checker")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            onDelete={remove}
            onTryExample={tryExample}
            onClearExample={clearExample}
          />

          <FilesPanel bookings={bookings} propertyName={property.name} onImport={importDrafts} onRestore={(s) => (setStore(s), setMessage("Backup restored."))} onClearAll={clearAll} />
        </div>

        {/* Calendar last on mobile */}
        <div className="order-3 md:hidden">
          <NightsCalendar result={result} bookings={bookings} today={today} />
        </div>
      </div>
    </div>
  );
}
