"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { bulkEventsAction, nextYearCopyAction, quickEditAction, type BulkOp } from "@/app/admin/actions";
import { cn } from "@/lib/cn";
import { formatMedium } from "@/lib/tools/dates";
import { downloadText } from "@/lib/tools/download";
import { confirmDue, eventsCsv, missingSource, normalise, recentlyEnded, recheckDue, startingSoon, type AdminEvent, type Category, type City, type Settings } from "@/lib/tools/events";

type Row = AdminEvent & { id: string; isSample: boolean; updatedAt: string };
type SortKey = "name" | "city" | "startDate" | "category" | "demand" | "dateStatus" | "status" | "lastChecked";

const statusTone: Record<string, string> = { draft: "bg-fog text-ink-copy", published: "bg-green-100 text-green", archived: "bg-steel-50 text-muted" };
const demandTone: Record<string, string> = { high: "bg-coral-50 text-brand", medium: "bg-amber-50 text-amber", low: "bg-fog text-ink-copy" };
type Sort = { key: SortKey; dir: 1 | -1 };

/** A sortable column header. */
function Th({ k, label, sort, setSort }: { k: SortKey; label: string; sort: Sort; setSort: (f: (s: Sort) => Sort) => void }) {
  return (
    <th scope="col" className="px-3 py-2.5 text-left" aria-sort={sort.key === k ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
      <button type="button" className="cursor-pointer border-none bg-transparent p-0 text-[12px] font-extrabold tracking-[0.5px] text-muted uppercase" onClick={() => setSort((s) => ({ key: k, dir: s.key === k ? ((-s.dir) as 1 | -1) : 1 }))}>
        {label} {sort.key === k ? (sort.dir === 1 ? "↑" : "↓") : ""}
      </button>
    </th>
  );
}

const QUEUES: Record<string, string> = { recheck: "Re-check due", expected: "Expected dates to confirm", soon: "Starting soon", missing: "Missing source", ended: "Recently ended" };

export function EventsTable({
  events,
  cities,
  categories,
  settings,
  today,
  role,
  initial,
}: {
  events: Row[];
  cities: City[];
  categories: Category[];
  settings: Settings;
  today: string;
  role: "admin" | "editor";
  initial: { queue: string; status: string; city: string };
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [city, setCity] = useState(initial.city);
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState(initial.status);
  const [queue, setQueue] = useState(initial.queue);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showSample, setShowSample] = useState(false);
  const [sort, setSort] = useState<Sort>({ key: "startDate", dir: 1 });
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ startDate: string; endDate: string; demand: string; status: string }>({ startDate: "", endDate: "", demand: "medium", status: "draft" });
  const [demandValue, setDemandValue] = useState("high");
  const [pending, start] = useTransition();
  const isAdmin = role === "admin";
  const cityName = (s: string) => cities.find((c) => c.slug === s)?.name ?? s;
  const catName = (s: string) => categories.find((c) => c.slug === s)?.name ?? s;

  const shown = useMemo(() => {
    let list = events.filter((e) => showSample || !e.isSample);
    if (queue === "recheck") list = recheckDue(list, today, settings);
    if (queue === "expected") list = confirmDue(list, today, settings);
    if (queue === "soon") list = startingSoon(list, today, settings);
    if (queue === "missing") list = missingSource(list);
    if (queue === "ended") list = recentlyEnded(list, today);
    const nq = normalise(q);
    list = list.filter(
      (e) =>
        (!nq || normalise(`${e.name} ${e.venue} ${cityName(e.city)}`).includes(nq)) &&
        (!city || e.city === city) &&
        (!cat || e.category === cat) &&
        (!status || e.status === status) &&
        (!from || e.endDate >= from) &&
        (!to || e.startDate <= to),
    );
    const val = (e: Row) => (sort.key === "city" ? cityName(e.city) : sort.key === "category" ? catName(e.category) : String(e[sort.key] ?? ""));
    return [...list].sort((a, b) => val(a).localeCompare(val(b)) * sort.dir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, q, city, cat, status, queue, from, to, sort, showSample, today, settings]);

  const allPicked = shown.length > 0 && shown.every((e) => picked.has(e.id));
  const run = (op: BulkOp, value?: string) => {
    if (op === "delete" && !window.confirm(`Delete ${picked.size} ${picked.size === 1 ? "event" : "events"}? This can’t be undone.`)) return;
    start(async () => {
      const r = await bulkEventsAction([...picked], op, value);
      setMsg(r.message);
      if (r.ok) setPicked(new Set());
      router.refresh();
    });
  };
  const sel = "field min-h-11 text-sm";

  return (
    <div className="grid gap-3">
      <div className="grid gap-2 rounded-[18px] border border-line bg-white p-4 md:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
        <div className="grid gap-1">
          <label htmlFor="ev-q" className="text-[13px] font-bold">
            Search
          </label>
          <input id="ev-q" className={sel} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, venue or city" />
        </div>
        <div className="grid gap-1">
          <label htmlFor="ev-city" className="text-[13px] font-bold">
            City
          </label>
          <select id="ev-city" className={sel} value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1">
          <label htmlFor="ev-cat" className="text-[13px] font-bold">
            Category
          </label>
          <select id="ev-cat" className={sel} value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1">
          <label htmlFor="ev-status" className="text-[13px] font-bold">
            Status
          </label>
          <select id="ev-status" className={sel} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Any status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="grid gap-1">
          <label htmlFor="ev-queue" className="text-[13px] font-bold">
            Show
          </label>
          <select id="ev-queue" className={sel} value={queue} onChange={(e) => setQueue(e.target.value)}>
            <option value="">All events</option>
            {Object.entries(QUEUES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-end gap-2 md:col-span-5">
          <div className="grid gap-1">
            <label htmlFor="ev-from" className="text-[13px] font-bold">
              From
            </label>
            <input id="ev-from" type="date" className={sel} value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <label htmlFor="ev-to" className="text-[13px] font-bold">
              To
            </label>
            <input id="ev-to" type="date" className={sel} value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={showSample} onChange={(e) => setShowSample(e.target.checked)} className="size-4" />
            Show SAMPLE test data
          </label>
          <button
            type="button"
            className="btn btn-outline ml-auto min-h-11"
            onClick={() => downloadText(`events-${today}.csv`, eventsCsv(shown), "text/csv")}
            data-export
          >
            Export these {shown.length} as CSV
          </button>
          <Link href="/admin/events/new" className="btn btn-coral min-h-11">
            + Add event
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-[14px] bg-white px-4 py-2.5" role="group" aria-label="Bulk actions" data-bulk>
        <span className="text-sm font-bold">{picked.size} selected</span>
        {isAdmin && (
          <>
            <button type="button" className="btn btn-outline min-h-11" disabled={!picked.size || pending} onClick={() => run("publish")}>
              Publish
            </button>
            <button type="button" className="btn btn-outline min-h-11" disabled={!picked.size || pending} onClick={() => run("archive")}>
              Archive
            </button>
          </>
        )}
        <button type="button" className="btn btn-outline min-h-11" disabled={!picked.size || pending} onClick={() => run("check")} data-bulk-check>
          Mark as checked
        </button>
        {isAdmin && (
          <>
            <label htmlFor="bulk-demand" className="sr-only-label">
              Demand level
            </label>
            <select id="bulk-demand" className="field min-h-11 w-auto text-sm" value={demandValue} onChange={(e) => setDemandValue(e.target.value)}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button type="button" className="btn btn-outline min-h-11" disabled={!picked.size || pending} onClick={() => run("demand", demandValue)}>
              Set demand
            </button>
            <button type="button" className="btn btn-outline min-h-11 text-brand" disabled={!picked.size || pending} onClick={() => run("delete")}>
              Delete
            </button>
          </>
        )}
        {msg && (
          <span className="text-sm font-bold text-green" role="status">
            {msg}
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-[18px] border border-line bg-white">
        <table className="w-full min-w-[980px] border-collapse text-sm" data-events-table>
          <caption className="sr-only-label">Events</caption>
          <thead className="bg-cloud-2">
            <tr>
              <th scope="col" className="w-10 px-3 py-2.5">
                <input type="checkbox" aria-label="Select all shown" checked={allPicked} onChange={() => setPicked(allPicked ? new Set() : new Set(shown.map((e) => e.id)))} className="size-4" />
              </th>
              <Th k="name" label="Name" sort={sort} setSort={setSort} />
              <Th k="city" label="City" sort={sort} setSort={setSort} />
              <Th k="startDate" label="Dates" sort={sort} setSort={setSort} />
              <Th k="category" label="Category" sort={sort} setSort={setSort} />
              <Th k="demand" label="Demand" sort={sort} setSort={setSort} />
              <Th k="dateStatus" label="Date" sort={sort} setSort={setSort} />
              <Th k="status" label="Status" sort={sort} setSort={setSort} />
              <Th k="lastChecked" label="Checked" sort={sort} setSort={setSort} />
              <th scope="col" className="px-3 py-2.5 text-left text-[12px] font-extrabold tracking-[0.5px] text-muted uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((e) => (
              <tr key={e.id} className="border-t border-line align-top" data-row={e.slug}>
                <td className="px-3 py-2.5">
                  <input
                    type="checkbox"
                    aria-label={`Select ${e.name}`}
                    checked={picked.has(e.id)}
                    onChange={() => setPicked((p) => (p.has(e.id) ? new Set([...p].filter((x) => x !== e.id)) : new Set(p).add(e.id)))}
                    className="size-4"
                  />
                </td>
                <td className="px-3 py-2.5 font-bold">
                  <Link href={`/admin/events/${e.id}`} className="text-ink">
                    {e.name}
                  </Link>
                  {e.isSample && <span className="ml-1.5 rounded bg-violet-50 px-1.5 text-[11px] font-extrabold text-violet">SAMPLE</span>}
                </td>
                <td className="px-3 py-2.5">{cityName(e.city)}</td>
                {editing === e.id ? (
                  <td colSpan={6} className="px-3 py-2.5">
                    <div className="flex flex-wrap items-end gap-2" data-quick-edit>
                      <label className="grid gap-1 text-[12px] font-bold">
                        Start
                        <input type="date" className="field min-h-11 text-sm" value={draft.startDate} onChange={(x) => setDraft({ ...draft, startDate: x.target.value })} />
                      </label>
                      <label className="grid gap-1 text-[12px] font-bold">
                        End
                        <input type="date" className="field min-h-11 text-sm" value={draft.endDate} onChange={(x) => setDraft({ ...draft, endDate: x.target.value })} />
                      </label>
                      <label className="grid gap-1 text-[12px] font-bold">
                        Demand
                        <select className="field min-h-11 text-sm" value={draft.demand} onChange={(x) => setDraft({ ...draft, demand: x.target.value })}>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </label>
                      {isAdmin && (
                        <label className="grid gap-1 text-[12px] font-bold">
                          Status
                          <select className="field min-h-11 text-sm" value={draft.status} onChange={(x) => setDraft({ ...draft, status: x.target.value })}>
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                          </select>
                        </label>
                      )}
                      <button
                        type="button"
                        className="btn btn-coral min-h-11"
                        disabled={pending}
                        onClick={() =>
                          start(async () => {
                            const r = await quickEditAction(e.id, draft);
                            setMsg(r.message);
                            if (r.ok) setEditing(null);
                            router.refresh();
                          })
                        }
                      >
                        Save
                      </button>
                      <button type="button" className="btn btn-outline min-h-11" onClick={() => setEditing(null)}>
                        Cancel
                      </button>
                    </div>
                  </td>
                ) : (
                  <>
                    <td className="px-3 py-2.5 whitespace-nowrap tabular-nums">
                      {formatMedium(e.startDate)}
                      {e.endDate !== e.startDate && <> – {formatMedium(e.endDate)}</>}
                    </td>
                    <td className="px-3 py-2.5">{catName(e.category)}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn("rounded-md px-2 py-[2px] text-[12px] font-extrabold capitalize", demandTone[e.demand])}>{e.demand}</span>
                    </td>
                    <td className="px-3 py-2.5">{e.dateStatus === "tba" ? "TBA" : e.dateStatus === "expected" ? "Expected" : "Confirmed"}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn("rounded-md px-2 py-[2px] text-[12px] font-extrabold capitalize", statusTone[e.status])}>{e.status}</span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{e.lastChecked ? formatMedium(e.lastChecked) : <span className="font-bold text-amber">Never</span>}</td>
                  </>
                )}
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap gap-1.5">
                    {editing !== e.id && (isAdmin || e.status === "draft") && (
                      <button
                        type="button"
                        className="btn btn-outline min-h-11 px-2.5 text-[13px]"
                        onClick={() => {
                          setEditing(e.id);
                          setDraft({ startDate: e.startDate, endDate: e.endDate, demand: e.demand, status: e.status });
                        }}
                      >
                        Quick edit
                      </button>
                    )}
                    {e.recurrence === "annual" && (
                      <button
                        type="button"
                        className="btn btn-outline min-h-11 px-2.5 text-[13px]"
                        disabled={pending}
                        onClick={() =>
                          start(async () => {
                            const r = await nextYearCopyAction(e.id);
                            if (r.ok && r.id) router.push(`/admin/events/${r.id}`);
                            else setMsg(r.message ?? "");
                          })
                        }
                      >
                        Next year’s copy
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!shown.length && (
              <tr>
                <td colSpan={10} className="px-3 py-8 text-center text-sm text-muted">
                  No events match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
