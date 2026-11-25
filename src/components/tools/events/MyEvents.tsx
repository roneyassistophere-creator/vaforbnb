"use client";

import { useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { cn } from "@/lib/cn";
import { formatMedium, formatRange } from "@/lib/tools/dates";
import type { PublicEvent } from "@/lib/tools/events";

/** Starred events, kept on this device only. */
export function MyEvents({
  events,
  missing,
  reminderWeeks,
  weekOptions,
  onReminderWeeks,
  onAddAll,
  onClear,
  onUnstar,
  cityName,
}: {
  events: PublicEvent[];
  missing: number;
  reminderWeeks: number;
  weekOptions: number[];
  onReminderWeeks: (w: number) => void;
  onAddAll: (list: PublicEvent[]) => void;
  onClear: () => void;
  onUnstar: (slug: string) => void;
  cityName: (slug: string) => string;
}) {
  const [confirmClear, setConfirmClear] = useState(false);
  const sorted = [...events].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const dated = sorted.filter((e) => e.dateStatus !== "tba");
  const when = (e: PublicEvent) => (e.dateStatus === "tba" ? "Date to be announced" : e.startDate === e.endDate ? formatMedium(e.startDate) : formatRange(e.startDate, e.endDate, Number(e.startDate.slice(0, 4))));
  const asText = () => sorted.map((e) => `${when(e)}: ${e.name}, ${cityName(e.city)} (${e.demand} demand, our estimate)\n${e.sourceUrl}`).join("\n\n");

  if (!events.length)
    return (
      <div className="grid justify-items-start gap-3 rounded-[18px] border border-line bg-white p-6" data-my-events-empty>
        <h2 className="m-0 text-lg font-extrabold">Nothing to show</h2>
        <p className="m-0 text-[15px] text-ink-copy">The events you starred have ended or been removed.</p>
      </div>
    );

  return (
    <div className="grid gap-4" data-my-events>
      <section className="grid gap-4 rounded-[18px] border border-ink bg-white p-5">
        <fieldset className="m-0 min-w-0 border-none p-0">
          <legend className="mb-2 p-0 text-[15px] font-bold text-ink">Remind me to review prices</legend>
          <div className="flex flex-wrap gap-2">
            {weekOptions.map((w) => (
              <button
                key={w}
                type="button"
                aria-pressed={reminderWeeks === w}
                className={cn("flex min-h-11 items-center rounded-full border-[1.5px] px-4 text-sm font-semibold", reminderWeeks === w ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink")}
                onClick={() => onReminderWeeks(w)}
                data-reminder={w}
              >
                {w} weeks before
              </button>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-coral min-h-12" disabled={!dated.length} onClick={() => onAddAll(dated)} data-add-all>
            Add all to my calendar
          </button>
          <CopyButton getText={asText} label="Copy list" className="btn btn-outline min-h-12" />
          {confirmClear ? (
            <span className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn btn-outline min-h-12" onClick={() => (onClear(), setConfirmClear(false))} data-clear-confirm>
                Yes, clear all
              </button>
              <button type="button" className="min-h-12 px-2 text-sm font-bold underline" onClick={() => setConfirmClear(false)}>
                Keep them
              </button>
            </span>
          ) : (
            <button type="button" className="min-h-12 px-2 text-sm font-bold text-brand underline" onClick={() => setConfirmClear(true)} data-clear>
              Clear
            </button>
          )}
        </div>
        <p className="m-0 text-[13px] text-muted">
          Works with Google, Apple and Outlook calendars. Saved on this device only.
          {sorted.length > dated.length && ` ${sorted.length - dated.length} with dates to be announced can’t be added yet.`}
          {missing > 0 && ` ${missing} starred ${missing === 1 ? "event has" : "events have"} ended or been removed.`}
        </p>
      </section>
      <ul className="m-0 grid list-none gap-2 p-0">
        {sorted.map((e) => (
          <li key={e.slug} className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] bg-cloud-2 px-4 py-2" data-starred={e.slug}>
            <span className="min-w-0">
              <span className="font-bold text-ink">{e.name}</span>
              <span className="block text-[13px] text-ink-copy">
                {when(e)} · {cityName(e.city)}
              </span>
            </span>
            <button type="button" className="min-h-11 px-2 text-sm font-bold text-brand underline" onClick={() => onUnstar(e.slug)} aria-label={`Remove ${e.name} from My events`}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
