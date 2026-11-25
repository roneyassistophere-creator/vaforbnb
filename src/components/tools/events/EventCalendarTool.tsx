"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { pricingHref, storageKey, toolSlug } from "@/content/tools/eventCalendarId";
import { bankHolidaySource } from "@/data/events";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { formatMedium, formatShort, monthName } from "@/lib/tools/dates";
import { deviceStorage } from "@/lib/tools/deviceStorage";
import { downloadText } from "@/lib/tools/download";
import {
  BANK_HOLIDAY,
  eventsIcs,
  groupByMonth,
  lookupTown,
  nearestCity,
  noFilters,
  publicDefaults,
  rangeFor,
  search,
  suggestCities,
  whatThisMeans,
  type City,
  type Filters,
  type Found,
  type FoundHoliday,
  type PublicData,
  type PublicEvent,
  type RangeKind,
} from "@/lib/tools/events";
import { londonToday } from "@/lib/tools/figures";
import { EventCard } from "./EventCard";
import { MonthView } from "./MonthView";
import { EventAlertsForm, SuggestEventForm } from "./HostForms";
import { MyEvents } from "./MyEvents";

/** Where the search is centred: a covered city, or the visitor's own location (never stored or sent). */
type Place = { kind: "city"; city: City } | { kind: "me"; latitude: number; longitude: number; near: City } | null;
type Saved = { v: 1; starred: string[]; reminderWeeks: number; city?: string; distance?: number; range?: RangeKind };
type View = "list" | "month";

export type ListItem = { kind: "event"; startDate: string; e: Found } | { kind: "holiday"; startDate: string; h: FoundHoliday };

const RANGES: { value: RangeKind; label: string }[] = [
  { value: "next30", label: "Next 30 days" },
  { value: "next90", label: "Next 90 days" },
  { value: "thisMonth", label: "This month" },
  { value: "nextMonth", label: "Next month" },
  { value: "custom", label: "Pick dates" },
];

export const monthLabel = (ym: string) => `${monthName(Number(ym.slice(5, 7)))} ${ym.slice(0, 4)}`;
const holidayAsEvent = (h: FoundHoliday): Pick<PublicEvent, "slug" | "name" | "startDate" | "endDate" | "sourceUrl" | "venue"> => ({ slug: `bank-holiday-${h.date}`, name: `${h.name} (bank holiday)`, startDate: h.date, endDate: h.date, sourceUrl: bankHolidaySource, venue: null });

export function HolidayRow({ h, tip, onCalendar }: { h: FoundHoliday; tip?: string | null; onCalendar: () => void }) {
  const wd = new Date(`${h.date}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" });
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-dashed border-line-strong bg-cloud-2 px-4 py-3" data-holiday={h.date}>
      <div className="min-w-0">
        <p className="m-0 font-extrabold text-ink">
          {h.name} <span className="font-semibold text-ink-copy">· {wd} {formatShort(h.date)}</span>
        </p>
        <p className="m-0 text-[13px] text-muted">
          Bank holiday ·{" "}
          <a href={bankHolidaySource} target="_blank" rel="noopener noreferrer" className="font-bold text-brand">
            GOV.UK
          </a>
          {tip ? ` · ${tip}` : ""}
        </p>
      </div>
      <button type="button" className="btn btn-outline min-h-11 px-3.5" onClick={onCalendar} data-add-calendar>
        Add to calendar
      </button>
    </div>
  );
}

/* ---- Town picker (combobox) ----------------------------------------------------------- */

type TownMessage = { text: string; city?: City; town?: string };

function TownPicker({ cities, place, onPick, onMessage }: { cities: City[]; place: Place; onPick: (c: City) => void; onMessage: (m: TownMessage | null) => void }) {
  const id = useId();
  const [q, setQ] = useState(place?.kind === "city" ? place.city.name : "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const options = useMemo(() => (q.trim() ? suggestCities(q, cities.filter((c) => c.covered)) : []), [q, cities]);
  const placeName = place?.kind === "city" ? place.city.name : place?.kind === "me" ? "" : null;
  const [lastPlace, setLastPlace] = useState(placeName);
  if (placeName !== lastPlace) {
    setLastPlace(placeName);
    if (placeName !== null) setQ(placeName);
  }

  const choose = (c: City) => {
    setQ(c.name);
    setOpen(false);
    setActive(-1);
    onMessage(null);
    onPick(c);
  };
  const submit = () => {
    if (active >= 0 && options[active]) return choose(options[active].city);
    if (!q.trim()) return;
    const r = lookupTown(q, cities);
    if (r.kind === "covered") return choose(r.city);
    setOpen(false);
    if (r.kind === "uncovered") onMessage({ text: `We don’t cover ${r.town.name} yet.${r.nearest ? ` The nearest covered city is ${r.nearest.city.name} (${Math.round(r.nearest.miles)} miles).` : ""}`, city: r.nearest?.city, town: r.town.name });
    else onMessage({ text: `We couldn’t find “${q.trim()}”. Try the nearest big town or city, or pick one from the list.`, town: q.trim() });
  };

  return (
    <div className="relative grid gap-1.5">
      <label htmlFor={`${id}-town`} className="text-[15px] font-bold text-ink">
        Your town or city
      </label>
      <input
        id={`${id}-town`}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open && options.length > 0}
        aria-controls={`${id}-list`}
        aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
        autoComplete="off"
        placeholder="Start typing your town"
        className="field min-h-12 text-base"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((a) => Math.min(a + 1, options.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, -1));
          } else if (e.key === "Enter") {
            e.preventDefault();
            submit();
          } else if (e.key === "Escape") setOpen(false);
        }}
        data-town
      />
      {open && options.length > 0 && (
        <ul id={`${id}-list`} role="listbox" className="absolute top-full right-0 left-0 z-20 m-0 mt-1 grid max-h-72 list-none overflow-auto rounded-[14px] border border-ink bg-white p-1 shadow-lg">
          {options.map((o, i) => (
            <li
              key={o.label + o.city.slug}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              className={cn("flex min-h-11 cursor-pointer items-center rounded-[10px] px-3 text-[15px]", i === active ? "bg-sand" : "hover:bg-cloud-2")}
              onMouseDown={(e) => (e.preventDefault(), choose(o.city))}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---- The tool ----------------------------------------------------------------------- */

export function EventCalendarTool({ data, today: serverToday, initialCity }: { data: PublicData; today: string; initialCity?: string }) {
  const router = useRouter();
  const s = data.settings;
  const defaults = publicDefaults(s);
  const cityBySlug = useMemo(() => new Map(data.cities.map((c) => [c.slug, c])), [data.cities]);
  const catBySlug = useMemo(() => new Map(data.categories.map((c) => [c.slug, c])), [data.categories]);
  const start = initialCity ? cityBySlug.get(initialCity) : undefined;

  const [today, setToday] = useState(serverToday);
  const [place, setPlace] = useState<Place>(start ? { kind: "city", city: start } : null);
  const [distance, setDistance] = useState(defaults.distance);
  const [rangeKind, setRangeKind] = useState<RangeKind>(defaults.range);
  const [custom, setCustom] = useState({ from: serverToday, to: "" });
  const [filters, setFilters] = useState<Filters>(noFilters());
  const [view, setView] = useState<View>("list");
  const [shown, setShown] = useState(s.htmlEventCount);
  const [starred, setStarred] = useState<string[]>([]);
  const [reminderWeeks, setReminderWeeks] = useState(defaults.reminderWeeks);
  const [message, setMessage] = useState<TownMessage | null>(null);
  const [suggestTown, setSuggestTown] = useState("");
  const [locating, setLocating] = useState(false);
  const [mineOpen, setMineOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  // Restore starred events and the last search (on this device only).
  useEffect(() => {
    const saved = deviceStorage.read<Saved>(storageKey);
    /* eslint-disable react-hooks/set-state-in-effect -- one-time restore from device storage after hydration */
    setToday(londonToday());
    if (saved?.v === 1) {
      setStarred(saved.starred ?? []);
      if (saved.reminderWeeks && s.reminderWeeks.includes(saved.reminderWeeks)) setReminderWeeks(saved.reminderWeeks);
      if (!initialCity) {
        const c = saved.city ? cityBySlug.get(saved.city) : undefined;
        if (c?.covered) setPlace({ kind: "city", city: c });
        if (saved.distance && s.distances.includes(saved.distance)) setDistance(saved.distance);
        if (saved.range && saved.range !== "custom") setRangeKind(saved.range);
      }
    }
    loaded.current = true;
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    track("tool_opened", toolSlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    deviceStorage.write(storageKey, { v: 1, starred, reminderWeeks, city: place?.kind === "city" ? place.city.slug : undefined, distance, range: rangeKind } satisfies Saved);
  }, [starred, reminderWeeks, place, distance, rangeKind]);

  const range = rangeFor(rangeKind, today, s, custom);
  const center = place?.kind === "city" ? place.city : place?.kind === "me" ? place : null;
  const nation = place?.kind === "city" ? place.city.nation : place?.kind === "me" ? place.near.nation : "england";
  const result = search(data, { center: center ?? { latitude: 54, longitude: -2 }, nation, distance: center ? distance : Number.POSITIVE_INFINITY, range, filters, today }, s);
  const items: ListItem[] = [...result.events.map((e): ListItem => ({ kind: "event", startDate: e.startDate, e })), ...result.bankHolidays.map((h): ListItem => ({ kind: "holiday", startDate: h.date, h }))].sort(
    (a, b) => a.startDate.localeCompare(b.startDate) || (a.kind === "holiday" ? -1 : 1),
  );
  const visible = items.slice(0, shown);
  const placeLabel = place?.kind === "city" ? place.city.name : place?.kind === "me" ? "your location" : null;
  const holidayTip = catBySlug.get(BANK_HOLIDAY)?.tip;

  const toggleStar = (slug: string) => {
    setStarred((xs) => {
      const on = !xs.includes(slug);
      if (on) track("event_starred", toolSlug);
      return on ? [...xs, slug] : xs.filter((x) => x !== slug);
    });
  };
  const addToCalendar = (list: Pick<PublicEvent, "slug" | "name" | "startDate" | "endDate" | "sourceUrl" | "venue">[], file: string) => {
    downloadText(file, eventsIcs(list, reminderWeeks, new Date()), "text/calendar");
    track("calendar_added", toolSlug, { count: list.length });
  };
  const plan = () => {
    track("plan_prices_clicked", toolSlug);
    router.push(pricingHref);
  };
  const pickCity = (c: City) => {
    setPlace({ kind: "city", city: c });
    setShown(s.htmlEventCount);
    track("search_made", toolSlug, { area: c.slug });
  };
  const useMyLocation = () => {
    if (!("geolocation" in navigator)) return setMessage({ text: "Your browser can’t share your location. Type your town instead." });
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const point = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        const n = nearestCity(point, data.cities.filter((c) => c.covered));
        if (!n) return setMessage({ text: "We couldn’t match your location to a city we cover. Type your town instead." });
        setPlace({ kind: "me", ...point, near: n.city });
        setMessage(n.miles > 50 ? { text: `The nearest city we cover is ${n.city.name}, about ${Math.round(n.miles)} miles away.`, city: n.city } : null);
        if (n.miles > distance) setDistance(s.distances.find((d) => d >= n.miles) ?? s.distances[s.distances.length - 1]);
        track("search_made", toolSlug, { area: n.city.slug, type: "location" });
      },
      () => {
        setLocating(false);
        setMessage({ text: "We couldn’t get your location. Type your town instead." });
      },
      { maximumAge: 600_000, timeout: 10_000 },
    );
  };
  const clearFilters = () => setFilters(noFilters());
  const filtered = filters.categories.length > 0 || filters.highOnly || filters.confirmedOnly;
  const widen = center ? s.distances.find((d) => d > distance) : undefined;

  const alertCity = place?.kind === "city" ? place.city : place?.kind === "me" ? place.near : undefined;
  const card = (e: Found) => (
    <EventCard
      key={e.slug}
      e={e}
      cityName={cityBySlug.get(e.city)?.name ?? ""}
      miles={center ? e.miles : undefined}
      category={catBySlug.get(e.category)}
      settings={s}
      today={today}
      starred={starred.includes(e.slug)}
      onStar={() => toggleStar(e.slug)}
      onCalendar={() => addToCalendar([e], `${e.slug}.ics`)}
      onPlan={plan}
      onSource={() => track("source_clicked", toolSlug, { area: e.city, type: e.category })}
    />
  );
  const holidayRow = (h: FoundHoliday) => <HolidayRow key={`bh-${h.date}-${h.name}`} h={h} tip={holidayTip} onCalendar={() => addToCalendar([holidayAsEvent(h)], `bank-holiday-${h.date}.ics`)} />;

  const chip = "flex min-h-11 items-center gap-2 rounded-full border-[1.5px] px-4 text-sm font-semibold";
  const chipOn = "border-ink bg-ink text-white";
  const chipOff = "border-line bg-white text-ink hover:border-ink";

  return (
    <div className="grid min-w-0 gap-5" data-tool data-ready={ready ? "" : undefined}>
      {/* SEARCH */}
      <section aria-label="Search events" className="grid gap-5 rounded-[22px] border border-line bg-white p-5 md:p-7">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <TownPicker cities={data.cities} place={place} onPick={pickCity} onMessage={setMessage} />
          <button type="button" className="btn btn-outline min-h-12" onClick={useMyLocation} disabled={locating} data-locate>
            <span aria-hidden="true">📍</span> {locating ? "Finding you…" : place?.kind === "me" ? `Near ${place.near.name}` : "Use my location"}
          </button>
        </div>
        {place?.kind === "me" && <p className="m-0 -mt-2 text-[13px] text-muted">Your location is used on this device only. It isn’t saved or sent anywhere.</p>}
        {message && (
          <div className="-mt-1 flex flex-wrap items-center gap-3 rounded-[14px] bg-amber-25 px-4 py-3 text-sm font-semibold text-ink-copy" role="status" data-town-message>
            <span>{message.text}</span>
            {message.city && (
              <button type="button" className="btn btn-outline min-h-11 px-3" onClick={() => message.city && (pickCity(message.city), setMessage(null))} data-show-nearest>
                Show {message.city.name} events
              </button>
            )}
            {message.town && (
              <a href="#suggest" className="btn btn-outline min-h-11 px-3" onClick={() => setSuggestTown(message.town ?? "")} data-ask-add>
                Ask us to add {message.town}
              </a>
            )}
          </div>
        )}
        <div className="grid gap-5 md:grid-cols-[auto_minmax(0,1fr)]">
          <fieldset className="m-0 min-w-0 border-none p-0" disabled={!center}>
            <legend className="mb-2 p-0 text-[15px] font-bold text-ink">Distance</legend>
            <div className="flex flex-wrap gap-2">
              {s.distances.map((d) => (
                <button key={d} type="button" aria-pressed={distance === d} className={cn(chip, distance === d ? chipOn : chipOff, !center && "opacity-50")} onClick={() => setDistance(d)} data-distance={d}>
                  {d} miles
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="m-0 min-w-0 border-none p-0">
            <legend className="mb-2 p-0 text-[15px] font-bold text-ink">Dates</legend>
            <div className="flex flex-wrap gap-2">
              {RANGES.map((r) => (
                <button key={r.value} type="button" aria-pressed={rangeKind === r.value} className={cn(chip, rangeKind === r.value ? chipOn : chipOff)} onClick={() => (setRangeKind(r.value), setShown(s.htmlEventCount))} data-range={r.value}>
                  {r.label}
                </button>
              ))}
            </div>
            {rangeKind === "custom" && (
              <div className="mt-3 flex flex-wrap gap-3">
                <label className="grid gap-1 text-sm font-bold">
                  From
                  <input type="date" className="field min-h-11" min={today} value={custom.from} onChange={(e) => setCustom({ ...custom, from: e.target.value })} />
                </label>
                <label className="grid gap-1 text-sm font-bold">
                  To
                  <input type="date" className="field min-h-11" min={custom.from || today} value={custom.to} onChange={(e) => setCustom({ ...custom, to: e.target.value })} />
                </label>
              </div>
            )}
          </fieldset>
        </div>
      </section>

      {/* FILTERS */}
      <section aria-label="Filter events" className="grid gap-2.5">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
          {data.categories.map((c) => {
            const on = filters.categories.includes(c.slug);
            const n = result.counts[c.slug] ?? 0;
            return (
              <button
                key={c.slug}
                type="button"
                aria-pressed={on}
                className={cn(chip, "flex-none", on ? chipOn : chipOff, !n && !on && "text-muted")}
                onClick={() => setFilters({ ...filters, categories: on ? filters.categories.filter((x) => x !== c.slug) : [...filters.categories, c.slug] })}
                data-category={c.slug}
              >
                {c.name} <span className={cn("rounded-full px-1.5 text-[12px] tabular-nums", on ? "bg-white/20" : "bg-fog")}>{n}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" aria-pressed={filters.highOnly} className={cn(chip, filters.highOnly ? chipOn : chipOff)} onClick={() => setFilters({ ...filters, highOnly: !filters.highOnly })} data-high-only>
            High demand only
          </button>
          <button type="button" aria-pressed={filters.confirmedOnly} className={cn(chip, filters.confirmedOnly ? chipOn : chipOff)} onClick={() => setFilters({ ...filters, confirmedOnly: !filters.confirmedOnly })} data-confirmed-only>
            Confirmed dates only
          </button>
          {filtered && (
            <button type="button" className="min-h-11 px-2 text-sm font-bold text-brand underline" onClick={clearFilters} data-clear-filters>
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* SUMMARY + VIEW TOGGLE */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-lg font-extrabold text-ink" aria-live="polite" data-summary>
            {result.total} {result.total === 1 ? "event" : "events"} {placeLabel ? `near ${placeLabel}` : "across the UK"} {rangeWords(rangeKind, range)}
            {result.high > 0 && <span className="text-brand"> · {result.high} high demand</span>}
          </p>
          <p className="m-0 text-[13px] text-muted">
            {formatMedium(range.from)} to {formatMedium(range.to)}
            {placeLabel ? ` · within ${distance} miles` : " · bank holidays shown for England and Wales until you pick a town"}
            {result.bankHolidays.length > 0 && ` · ${result.bankHolidays.length} bank ${result.bankHolidays.length === 1 ? "holiday" : "holidays"}`}
          </p>
        </div>
        <div role="group" aria-label="View" className="flex rounded-full border border-line bg-white p-1">
          {(
            [
              ["list", "List"],
              ["month", "Month calendar"],
            ] as [View, string][]
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              className={cn("min-h-11 rounded-full px-4 text-sm font-bold", view === v ? "bg-ink text-white" : "text-ink hover:bg-cloud-2")}
              onClick={() => {
                setView(v);
                track("view_changed", toolSlug, { type: v });
              }}
              data-view={v}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* THIS WEEK */}
      {result.thisWeek.length > 0 && (
        <section aria-labelledby="this-week" className="rounded-[18px] bg-coral-25 p-4" data-this-week>
          <h2 id="this-week" className="m-0 mb-2 text-[15px] font-extrabold text-ink">
            This week
          </h2>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {result.thisWeek.map((e) => (
              <li key={e.slug}>
                <a href={`#ev-${e.slug}`} onClick={() => setView("list")} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-3.5 text-sm font-bold text-ink no-underline hover:text-brand">
                  <span className="text-muted tabular-nums">{formatShort(e.startDate)}</span> {e.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* MY EVENTS (only once something is starred) */}
      {starred.length > 0 && (
        <details className="group rounded-[18px] border border-ink bg-white" open={mineOpen} onToggle={(e) => setMineOpen(e.currentTarget.open)} data-my-events-panel>
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 font-extrabold text-ink">
            <span>
              <span aria-hidden="true">★</span> My events ({starred.length})
            </span>
            <span className="text-sm font-bold text-brand">
              <span className="group-open:hidden">Show</span>
              <span className="hidden group-open:inline">Hide</span>
            </span>
          </summary>
          <div className="border-t border-line p-4 md:p-5">
            <MyEvents
              events={data.events.filter((e) => starred.includes(e.slug))}
              missing={starred.filter((x) => !data.events.some((e) => e.slug === x)).length}
              reminderWeeks={reminderWeeks}
              weekOptions={s.reminderWeeks}
              onReminderWeeks={setReminderWeeks}
              onAddAll={(list) => addToCalendar(list, "my-events.ics")}
              onClear={() => setStarred([])}
              onUnstar={toggleStar}
              cityName={(slug) => cityBySlug.get(slug)?.name ?? ""}
            />
          </div>
        </details>
      )}

      {/* RESULTS */}
      {view === "list" && (
        <div className="grid gap-6" data-list>
          {items.length === 0 ? (
            <div className="grid justify-items-start gap-3 rounded-[18px] border border-line bg-white p-6" data-empty>
              <h2 className="m-0 text-lg font-extrabold">{data.events.length ? "No events found for these dates" : "We’re still adding events"}</h2>
              <p className="m-0 text-[15px] text-ink-copy">
                {!data.events.length ? "Check back soon, or sign up below to hear about big events near you." : filtered ? "Try clearing the filters." : "Try a wider distance or longer date range."}
              </p>
              <div className="flex flex-wrap gap-2">
                {filtered && (
                  <button type="button" className="btn btn-outline min-h-11" onClick={clearFilters}>
                    Clear filters
                  </button>
                )}
                {!filtered && widen && (
                  <button type="button" className="btn btn-outline min-h-11" onClick={() => setDistance(widen)}>
                    Search {widen} miles
                  </button>
                )}
                {!filtered && rangeKind !== "next90" && (
                  <button type="button" className="btn btn-outline min-h-11" onClick={() => setRangeKind("next90")} data-try-90>
                    Next 90 days
                  </button>
                )}
              </div>
            </div>
          ) : (
            groupByMonth(visible).map((g) => (
              <section key={g.month} aria-labelledby={`m-${g.month}`} className="grid gap-3">
                <h3 id={`m-${g.month}`} className="m-0 text-[13px] font-extrabold tracking-[0.8px] text-muted uppercase">
                  {monthLabel(g.month)}
                </h3>
                {g.items.map((it) => (it.kind === "event" ? card(it.e) : holidayRow(it.h)))}
              </section>
            ))
          )}
          {items.length > shown && (
            <button type="button" className="btn btn-outline min-h-12 justify-self-center" onClick={() => setShown(shown + s.htmlEventCount)} data-show-more>
              Show {Math.min(s.htmlEventCount, items.length - shown)} more ({items.length - shown} left)
            </button>
          )}
        </div>
      )}

      {view === "month" && <MonthView items={items} range={range} today={today} renderEvent={card} renderHoliday={holidayRow} />}

      {/* WHAT THIS MEANS + NEXT STEP */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="rounded-[20px] border border-line bg-white p-6" data-what-this-means>
          <h2 className="h2 mb-2 text-[22px]">What this means</h2>
          <p className="m-0 text-base leading-[1.7] text-ink-copy">{whatThisMeans(result, today, s)}</p>
        </div>
        <div className="grid content-start gap-3 rounded-[20px] bg-ink p-6 text-white" data-next-step>
          <p className="m-0 text-[12px] font-extrabold tracking-[1px] text-white/70 uppercase">Next step</p>
          <p className="m-0 text-xl leading-[1.3] font-extrabold">Plan your prices around these events</p>
          <p className="m-0 text-sm leading-[1.6] text-white/80">Our pricing team sets event-night prices and minimum stays, and keeps checking them as dates get closer.</p>
          <a href={pricingHref} onClick={() => track("plan_prices_clicked", toolSlug, { type: "next-step" })} className="btn btn-coral min-h-12 justify-self-start">
            Pricing optimisation
          </a>
        </div>
      </div>

      {/* SUGGEST + ALERTS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section id="suggest" aria-labelledby="suggest-h" className="scroll-mt-4 rounded-[20px] border border-line bg-white p-6">
          <h2 id="suggest-h" className="m-0 mb-1 text-xl font-extrabold">
            Know an event we’ve missed? Tell us.
          </h2>
          <p className="m-0 mb-4 text-sm text-ink-copy">We check every suggestion against the official source before adding it.</p>
          <SuggestEventForm key={suggestTown} town={suggestTown} />
        </section>
        <section aria-labelledby="alerts-h" className="rounded-[20px] border border-line bg-cloud-2 p-6">
          <h2 id="alerts-h" className="m-0 mb-1 text-xl font-extrabold">
            Get a monthly email of big events in {alertCity?.name ?? "your city"}
          </h2>
          <p className="m-0 mb-4 text-sm text-ink-copy">Optional. One email a month, and you can unsubscribe at any time.</p>
          <EventAlertsForm cities={data.cities} defaultCity={alertCity?.slug} />
        </section>
      </div>
    </div>
  );
}

/** "in the next 90 days", "this month", "from 1 Dec to 9 Dec". */
function rangeWords(kind: RangeKind, r: { from: string; to: string }) {
  if (kind === "next30") return "in the next 30 days";
  if (kind === "next90") return "in the next 90 days";
  if (kind === "thisMonth") return "this month";
  if (kind === "nextMonth") return "next month";
  return `from ${formatShort(r.from)} to ${formatShort(r.to)}`;
}
