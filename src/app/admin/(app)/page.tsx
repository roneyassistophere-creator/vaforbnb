import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { adminData } from "@/lib/server/events";
import { formatLong } from "@/lib/tools/dates";
import { confirmDue, coverage, missingSource, recentlyEnded, recheckDue, startingSoon } from "@/lib/tools/events";
import { cn } from "@/lib/cn";
import { ArchivePastButton } from "@/components/admin/ArchivePastButton";

function Tile({ href, title, count, hint, tone = "plain" }: { href: string; title: string; count: number | string; hint: string; tone?: "plain" | "warn" | "good" | "bad" }) {
  const t = { plain: "border-line bg-white", warn: "border-amber-50 bg-amber-25", good: "border-green-100 bg-green-25", bad: "border-coral-100 bg-coral-25" }[tone];
  return (
    <Link href={href} className={cn("grid gap-1 rounded-[18px] border p-5 text-ink no-underline hover:border-ink hover:text-ink", t)} data-tile={title}>
      <span className="text-sm font-bold text-ink-copy">{title}</span>
      <span className="text-[32px] leading-none font-extrabold tabular-nums">{count}</span>
      <span className="text-[13px] text-muted">{hint}</span>
    </Link>
  );
}

export default async function AdminDashboard() {
  const user = await requireUser();
  const d = await adminData();
  const s = d.settings;
  const real = d.events.filter((e) => !e.isSample);
  const recheck = recheckDue(real, d.today, s);
  const confirm = confirmDue(real, d.today, s);
  const soon = startingSoon(real, d.today, s);
  const missing = missingSource(real);
  const ended = recentlyEnded(real, d.today);
  const cov = coverage(real, d.cities, d.today, s);
  const newSuggestions = d.suggestions.filter((x) => x.status === "new").length;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="m-0 text-[28px] font-extrabold">Events dashboard</h1>
          <p className="m-0 mt-1 text-sm text-ink-copy">
            Today is {formatLong(d.today)}. Events last reviewed: <strong>{d.lastReviewed ? formatLong(d.lastReviewed) : "not yet"}</strong>.
          </p>
        </div>
        <Link href="/admin/events/new" className="btn btn-coral min-h-12 px-6 text-base">
          + Add event
        </Link>
      </div>

      <p className="m-0 rounded-[14px] border border-line bg-white px-4 py-3 text-sm text-ink-copy" data-weekly-summary>
        <strong className="text-ink">This week:</strong> {recheck.length} {recheck.length === 1 ? "event" : "events"} to re-check, {confirm.length} expected {confirm.length === 1 ? "date" : "dates"} to confirm, {newSuggestions} new{" "}
        {newSuggestions === 1 ? "suggestion" : "suggestions"}.
        {s.weeklyReminder && <span className="text-muted"> The weekly reminder email starts sending once an email service is connected.</span>}
      </p>

      <section aria-label="Queues" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile href="/admin/events?queue=recheck" title="Re-check due" count={recheck.length} hint={`Published, starting within ${s.recheckHorizonDays} days, last checked over ${s.recheckDays} days ago`} tone={recheck.length ? "warn" : "good"} />
        <Tile href="/admin/events?queue=expected" title="Expected dates to confirm" count={confirm.length} hint={`Expected or TBA, starting within ${s.confirmWindowDays} days`} tone={confirm.length ? "warn" : "good"} />
        <Tile href="/admin/events?queue=soon" title="Starting soon" count={soon.length} hint={`Published, in the next ${s.startingSoonDays} days`} />
        <Tile href="/admin/suggestions" title="Suggestions inbox" count={newSuggestions} hint="New suggestions from the public" tone={newSuggestions ? "warn" : "plain"} />
        <Tile href="/admin/events?queue=missing" title="Missing source" count={missing.length} hint="Should be zero: publishing is blocked without one" tone={missing.length ? "bad" : "good"} />
        <Tile href="/admin/events?queue=ended" title="Recently ended" count={ended.length} hint="Ended in the last 7 days, now hidden from the public page" />
        <Tile href="/admin/events?status=draft" title="Drafts" count={real.filter((e) => e.status === "draft").length} hint="Not yet published" />
        <Tile href="/admin/events?status=published" title="Published" count={real.filter((e) => e.status === "published" && e.endDate >= d.today).length} hint="Upcoming and live on the site" />
      </section>

      <section aria-labelledby="coverage" className="rounded-[20px] border border-line bg-white p-5" data-coverage>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="coverage" className="m-0 text-lg font-extrabold">
            Coverage
          </h2>
          <p className={cn("m-0 rounded-full px-3 py-1 text-sm font-extrabold", cov.launchReady ? "bg-green-100 text-green" : "bg-amber-50 text-amber")} data-launch>
            {cov.ready} of {cov.needed} cities ready for launch
          </p>
        </div>
        <p className="m-0 mt-1 mb-3 text-[13px] text-muted">
          Upcoming published events with an official source, next {s.coverageDays} days. Launch needs {s.launchCities} cities with at least {s.launchEventsPerCity} each.
        </p>
        <ul className="m-0 grid list-none gap-1.5 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {cov.rows.map((r) => (
            <li key={r.city.slug} className="flex items-center justify-between gap-2 rounded-[12px] bg-cloud-2 px-3 py-2 text-sm" data-coverage-city={r.city.slug}>
              <Link href={`/admin/events?city=${r.city.slug}`} className="font-bold text-ink no-underline">
                {r.city.name}
              </Link>
              <span className={cn("rounded-md px-2 py-[2px] text-[12px] font-extrabold tabular-nums", r.ready ? "bg-green-100 text-green" : "bg-amber-50 text-amber")}>
                {r.count} {r.ready ? "✓ ready" : `· needs ${s.launchEventsPerCity - r.count} more`}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {user.role === "admin" && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-line bg-white p-5">
          <p className="m-0 text-sm text-ink-copy">Past events are hidden from the public page automatically. Archiving them tidies the list (records are kept).</p>
          <ArchivePastButton />
        </section>
      )}
    </div>
  );
}
