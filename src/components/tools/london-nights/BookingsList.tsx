"use client";

import { copy } from "@/content/tools/londonNights";
import { cn } from "@/lib/cn";
import { formatDateList, formatRange, platformName, type Booking, type NightsResult } from "@/lib/tools/london-nights";

const C = copy.list;

export function BookingsList({
  bookings,
  result,
  year,
  filter,
  onFilter,
  onEdit,
  onDelete,
  onTryExample,
  onClearExample,
}: {
  bookings: Booking[];
  result: NightsResult;
  year: number;
  filter: string | null;
  onFilter: (p: string | null) => void;
  onEdit: (b: Booking) => void;
  onDelete: (b: Booking) => void;
  onTryExample: () => void;
  onClearExample: () => void;
}) {
  const sorted = [...bookings].sort((a, b) => a.checkIn.localeCompare(b.checkIn) || a.checkOut.localeCompare(b.checkOut));
  const byId = new Map(bookings.map((b) => [b.id, b]));
  const platforms = [...new Set(sorted.map(platformName))];
  const shown = filter ? sorted.filter((b) => platformName(b) === filter) : sorted;
  const hasExample = bookings.some((b) => b.example);
  const totals = Object.entries(result.perPlatform);

  return (
    <section aria-labelledby="bookings-title" className="grid gap-3">
      <h2 id="bookings-title" className="m-0 text-xl font-extrabold tracking-[-0.4px]">
        {C.title} <span className="text-base font-semibold text-muted">({bookings.length})</span>
      </h2>

      {hasExample && (
        <p className="m-0 flex flex-wrap items-center gap-3 rounded-[12px] bg-amber-25 px-4 py-3 text-sm font-semibold text-amber" role="note">
          <span className="flex-1">{C.exampleBanner}</span>
          <button type="button" onClick={onClearExample} className="min-h-11 cursor-pointer border-none bg-transparent p-0 font-bold text-ink underline underline-offset-2">
            {C.clearExample}
          </button>
        </p>
      )}

      {bookings.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-line-strong bg-white p-5 text-[15px] leading-[1.6] text-ink-copy">
          <p className="m-0 mb-3">{C.empty}</p>
          <button type="button" onClick={onTryExample} className="btn btn-outline">
            {C.tryExample}
          </button>
        </div>
      ) : (
        <>
          {totals.length > 0 && (
            <p className="m-0 text-sm text-ink-copy">
              <span className="font-bold text-ink">Counted in {year}: </span>
              {totals.map(([p, n]) => `${p} ${n}`).join(" · ")}
            </p>
          )}
          {platforms.length > 1 && (
            <div role="group" aria-label="Filter by platform" className="flex flex-wrap gap-2">
              {[null, ...platforms].map((p) => (
                <button
                  key={p ?? "all"}
                  type="button"
                  aria-pressed={filter === p}
                  onClick={() => onFilter(p)}
                  className={cn(
                    "min-h-11 cursor-pointer rounded-full border-[1.5px] px-4 text-sm font-semibold",
                    filter === p ? "border-ink bg-ink text-white" : "border-line bg-white text-ink",
                  )}
                >
                  {p ?? C.all}
                </button>
              ))}
            </div>
          )}

          <ul className="m-0 grid list-none gap-2.5 p-0">
            {shown.map((b) => {
              const n = result.perBooking[b.id];
              const outside = !n || n.inYear === 0;
              const others = n?.overlapsWith.map((id) => byId.get(id)).filter((x): x is Booking => !!x) ?? [];
              return (
                <li
                  key={b.id}
                  id={`booking-${b.id}`}
                  data-booking-id={b.id}
                  className={cn("scroll-mt-24 rounded-[14px] border bg-white p-4", others.length ? "border-coral" : "border-line", outside && "opacity-60")}
                >
                  <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                    <div className="min-w-0">
                      <p className="m-0 text-[15px] font-extrabold text-ink">{formatRange(b.checkIn, b.checkOut, year)}</p>
                      <p className="m-0 text-sm text-ink-copy">
                        {outside ? (
                          <>
                            0 nights in {year}. <span className="text-muted">{C.outsideYearHint}</span>
                          </>
                        ) : n.inYear === n.total ? (
                          `${n.total} ${n.total === 1 ? "night" : "nights"} in ${year}`
                        ) : (
                          `${n.inYear} of ${n.total} nights in ${year}`
                        )}
                      </p>
                    </div>
                    <span className="pill flex-none">{platformName(b)}</span>
                  </div>
                  {(b.reference || b.note) && (
                    <p className="m-0 mt-1 text-[13px] text-muted">{[b.reference, b.note].filter(Boolean).join(" · ")}</p>
                  )}
                  {n?.longStay && <p className="m-0 mt-2 inline-block rounded-md bg-fog px-2 py-1 text-xs font-bold text-ink-copy">{C.longStay}</p>}
                  {others.map((o) => {
                    const pair = result.overlaps.find((x) => (x.a === b.id && x.b === o.id) || (x.b === b.id && x.a === o.id));
                    return (
                      <p key={o.id} className="m-0 mt-2 rounded-md bg-coral-50 px-2 py-1 text-xs font-bold text-brand">
                        Overlaps with {formatRange(o.checkIn, o.checkOut, year)} ({platformName(o)}) on {pair ? formatDateList(pair.dates) : "shared dates"}
                      </p>
                    );
                  })}
                  <div className="mt-2 flex gap-4">
                    <button type="button" onClick={() => onEdit(b)} aria-label={`${C.edit} booking ${formatRange(b.checkIn, b.checkOut, year)}`} className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-ink underline underline-offset-2">
                      {C.edit}
                    </button>
                    <button type="button" onClick={() => onDelete(b)} aria-label={`${C.delete} booking ${formatRange(b.checkIn, b.checkOut, year)}`} className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-brand underline underline-offset-2">
                      {C.delete}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
