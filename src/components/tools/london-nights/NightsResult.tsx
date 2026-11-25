"use client";

import { copy } from "@/content/tools/londonNights";
import { formatLong, formatRange, platformName, statusText, type Booking, type NightsResult } from "@/lib/tools/london-nights";
import { CopyButton } from "../CopyButton";
import { ProgressRing } from "../ProgressRing";
import { StatusPill, type PillTone } from "../StatusPill";
import { YearCalendar, type DayKindStyle, type DayMark } from "../YearCalendar";

const C = copy.result;

const tones: Record<NightsResult["status"], PillTone> = { ok: "pass", approaching: "notYet", reached: "notYet", over: "over" };
const ringColour: Record<NightsResult["status"], string> = { ok: "#14212B", approaching: "#C68A00", reached: "#C68A00", over: "#F0595A" };

export function NightsResultPanel({
  result,
  hasBookings,
  summary,
  onShowOverlaps,
  onDownloadCsv,
  onBackup,
}: {
  result: NightsResult;
  hasBookings: boolean;
  summary: () => string;
  onShowOverlaps: () => void;
  onDownloadCsv: () => void;
  onBackup: () => void;
}) {
  const r = result;
  const plural = (n: number, w = "night") => `${n} ${n === 1 ? w : `${w}s`}`;
  return (
    <section aria-labelledby="nights-result" className="rounded-[20px] border border-line bg-white p-5 md:p-6" data-result-panel>
      <h2 id="nights-result" className="m-0 mb-4 text-xs font-extrabold tracking-[1.2px] text-muted uppercase">
        {C.title} · {r.year}
      </h2>
      <div className="flex flex-wrap items-center gap-5">
        <ProgressRing value={r.used} max={r.limit} label={`${r.used} of ${r.limit} nights`} sublabel={`${plural(r.left)} left`} color={ringColour[r.status]} size={150} />
        <div className="grid min-w-[200px] flex-1 gap-2" aria-live="polite" aria-atomic="true">
          <span className="sr-only-label">
            {r.used} of {r.limit} nights used in {r.year}. {statusText(r)}.
          </span>
          <StatusPill tone={tones[r.status]} className="min-h-11 self-start px-4 text-base">
            {statusText(r)}
          </StatusPill>
          <p className="m-0 text-sm text-ink-copy">
            {C.usedSoFar}: <strong className="text-ink">{r.usedSoFar}</strong> · {C.bookedAhead}: <strong className="text-ink">{r.bookedAhead}</strong> · Total:{" "}
            <strong className="text-ink">{r.used}</strong>
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-1.5 text-sm text-ink-copy">
        {r.ninetiethNightDate && (
          <p className="m-0 font-semibold text-ink">
            Your {ordinal(r.limit)} night is {formatLong(r.ninetiethNightDate)}.
            {r.status === "over" && <> Nights after {formatLong(r.ninetiethNightDate)} would need planning permission.</>}
          </p>
        )}
        {r.overlaps.length > 0 && (
          <p className="m-0 text-brand">
            <strong>{plural(r.overlaps.length, "overlap")}</strong> between bookings (shared nights counted once).{" "}
            <button type="button" onClick={onShowOverlaps} className="min-h-11 cursor-pointer border-none bg-transparent p-0 font-bold text-brand underline underline-offset-2">
              {C.show}
            </button>
          </p>
        )}
        {r.longStays.length > 0 && (
          <p className="m-0">
            {plural(r.longStays.length, "long stay")} of {r.longStayMin}+ nights not counted.
          </p>
        )}
        {!hasBookings && <p className="m-0 text-muted">Add your first booking to start the count.</p>}
      </div>

      {hasBookings && (
        <div className="mt-4 flex flex-wrap gap-2">
          <CopyButton label={C.copy} copiedLabel={C.copied} getText={summary} className="min-h-11" />
          <button type="button" onClick={onDownloadCsv} className="btn btn-outline min-h-11">
            {copy.files.downloadCsv}
          </button>
          <button type="button" onClick={onBackup} className="btn btn-outline min-h-11">
            {copy.files.backup}
          </button>
        </div>
      )}
    </section>
  );
}

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
};

const kinds: Record<string, DayKindStyle> = {
  counted: { label: "Counted night", cell: "bg-ink text-white" },
  overlap: { label: "Overlap (counted once)", cell: "bg-coral text-ink font-bold", dot: true },
  longStay: {
    label: "Long stay (not counted)",
    cell: "bg-[repeating-linear-gradient(135deg,#C8D1D8_0_2px,#F2F4F6_2px_5px)] text-ink-copy",
  },
};

/** Year calendar of counted, overlapping and long-stay nights. */
export function NightsCalendar({ result, bookings, today }: { result: NightsResult; bookings: Booking[]; today: string }) {
  const byId = new Map(bookings.map((b) => [b.id, b]));
  const marks: Record<string, DayMark> = {};
  for (const [date, info] of Object.entries(result.days)) {
    const names = info.bookingIds
      .map((id) => byId.get(id))
      .filter((b): b is Booking => !!b)
      .map((b) => `${formatRange(b.checkIn, b.checkOut, result.year)} (${platformName(b)}${b.reference ? `, ${b.reference}` : ""})`);
    const prefix = info.kind === "overlap" ? "Overlap: " : info.kind === "longStay" ? "Long stay, not counted: " : "";
    marks[date] = { kind: info.kind, detail: prefix + names.join("; ") };
  }
  return (
    <section aria-labelledby="nights-calendar" className="rounded-[20px] border border-line bg-white p-5 md:p-6">
      <h2 id="nights-calendar" className="m-0 mb-3 text-base font-extrabold">
        {result.year} calendar
      </h2>
      <YearCalendar year={result.year} marks={marks} kinds={kinds} today={today} label={`${result.year} calendar of booked nights`} />
    </section>
  );
}
