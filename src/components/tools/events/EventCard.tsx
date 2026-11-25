"use client";

import { cn } from "@/lib/cn";
import { dayNumber, formatLong } from "@/lib/tools/dates";
import type { Category, PublicEvent, Settings } from "@/lib/tools/events";

const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const DAY = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "SAT 14 MAR", or "14–16 MAR" / "30 MAR–2 APR" for multi-day events. */
export function dateBlock(e: Pick<PublicEvent, "startDate" | "endDate" | "dateStatus">): { top: string; main: string } {
  const [, sm, sd] = e.startDate.split("-").map(Number);
  if (e.dateStatus === "tba") return { top: "DATE TBA", main: MON[sm - 1] };
  const wd = DAY[new Date(`${e.startDate}T12:00:00Z`).getUTCDay()];
  if (e.endDate === e.startDate) return { top: wd, main: `${sd} ${MON[sm - 1]}` };
  const [, em, ed] = e.endDate.split("-").map(Number);
  return { top: wd, main: sm === em ? `${sd}–${ed} ${MON[sm - 1]}` : `${sd} ${MON[sm - 1]}–${ed} ${MON[em - 1]}` };
}

/* Words always carry the meaning; colours meet WCAG AA. */
export const demandTone = {
  high: { label: "High demand (our estimate)", bg: "#FDECEC", fg: "#B8383A" },
  medium: { label: "Medium demand (our estimate)", bg: "#FFF2CC", fg: "#6B4A00" },
  low: { label: "Low demand (our estimate)", bg: "#F2F4F6", fg: "#46525C" },
} as const;

export function EventCard({
  e,
  cityName,
  miles,
  category,
  settings,
  today,
  starred = false,
  onStar,
  onCalendar,
  onPlan,
  onSource,
  preview = false,
}: {
  e: PublicEvent;
  cityName: string;
  miles?: number;
  category?: Category;
  settings: Pick<Settings, "recheckDays">;
  today: string;
  starred?: boolean;
  onStar?: () => void;
  onCalendar?: () => void;
  onPlan?: () => void;
  onSource?: () => void;
  /** Admin preview: shows the card exactly as hosts see it, with the buttons inert. */
  preview?: boolean;
}) {
  const b = dateBlock(e);
  const d = demandTone[e.demand];
  const age = e.lastChecked ? dayNumber(today) - dayNumber(e.lastChecked) : null;
  const where = [e.venue, cityName, miles !== undefined && Number.isFinite(miles) ? (miles === 0 ? "in the city" : `${miles} ${miles === 1 ? "mile" : "miles"} away`) : null].filter(Boolean).join(" · ");
  return (
    <article className="flex gap-3 rounded-[18px] border border-line bg-white p-4 md:gap-4 md:p-5" data-event={e.slug} aria-labelledby={`ev-${e.slug}`}>
      <div className="flex w-[64px] flex-none flex-col items-center justify-center rounded-[14px] bg-sand px-1 py-2 text-center md:w-[74px]" aria-hidden="true">
        <span className="text-[11px] font-extrabold tracking-[0.6px] text-muted">{b.top}</span>
        <span className="text-[15px] leading-[1.15] font-extrabold text-ink md:text-base">{b.main}</span>
      </div>
      <div className="grid min-w-0 flex-1 gap-2">
        <div>
          <h4 id={`ev-${e.slug}`} className="m-0 text-[17px] leading-[1.3] font-extrabold text-ink">
            {e.name}
          </h4>
          <p className="m-0 mt-0.5 text-sm text-ink-copy">
            <span className="sr-only-label">
              {e.dateStatus === "tba" ? `Date to be announced, expected ${MONTH_NAMES[Number(e.startDate.slice(5, 7)) - 1]}` : e.endDate === e.startDate ? formatLong(e.startDate) : `${formatLong(e.startDate)} to ${formatLong(e.endDate)}`}
              {". "}
            </span>
            {where}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {category && <span className="rounded-md bg-fog px-2 py-[3px] text-[12px] font-bold text-ink-copy">{category.name}</span>}
          <span className="rounded-md px-2 py-[3px] text-[12px] font-extrabold" style={{ background: d.bg, color: d.fg }} data-demand={e.demand}>
            {d.label}
          </span>
          {e.dateStatus === "confirmed" ? (
            <span className="rounded-md bg-green-100 px-2 py-[3px] text-[12px] font-extrabold text-green" data-date-status="confirmed">
              Confirmed
            </span>
          ) : e.dateStatus === "expected" ? (
            <span className="rounded-md bg-amber-50 px-2 py-[3px] text-[12px] font-extrabold text-amber" title="Not yet confirmed by the organiser" data-date-status="expected">
              Expected date<span className="sr-only-label"> (not yet confirmed by the organiser)</span>
            </span>
          ) : (
            <span className="rounded-md bg-amber-50 px-2 py-[3px] text-[12px] font-extrabold text-amber" data-date-status="tba">
              Date to be announced
            </span>
          )}
        </div>
        {e.shortDescription && <p className="m-0 text-sm leading-[1.5] text-ink-copy">{e.shortDescription}</p>}
        {category?.tip && <p className="m-0 truncate text-[13px] text-muted" title={category.tip}>{category.tip}</p>}
        <p className="m-0 text-[13px] text-muted">
          Source:{" "}
          <a href={e.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-brand" onClick={onSource} data-source>
            {e.sourceTitle}
            <span className="sr-only-label"> (opens in a new tab)</span>
          </a>
          {e.lastChecked && (
            <>
              {" · "}
              {age !== null && age > settings.recheckDays ? <span>Checked {age} days ago</span> : <span>Checked {formatLong(e.lastChecked)}</span>}
            </>
          )}
        </p>
        <div className="flex flex-wrap gap-2 pt-0.5">
          <button
            type="button"
            onClick={onStar}
            disabled={preview}
            aria-pressed={starred}
            className={cn("btn min-h-11 px-3.5", starred ? "btn-ink" : "btn-outline")}
            aria-label={starred ? `Remove ${e.name} from My events` : `Add ${e.name} to My events`}
            data-star
          >
            <span aria-hidden="true">{starred ? "★" : "☆"}</span> {starred ? "Starred" : "Star"}
          </button>
          {e.dateStatus !== "tba" && (
            <button type="button" onClick={onCalendar} disabled={preview} className="btn btn-outline min-h-11 px-3.5" data-add-calendar>
              Add to calendar
            </button>
          )}
          <button type="button" onClick={onPlan} disabled={preview} className="btn btn-outline min-h-11 px-3.5" data-plan>
            Plan prices
          </button>
        </div>
      </div>
    </article>
  );
}
