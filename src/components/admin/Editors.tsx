"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { addBankHolidaysAction, addUserAction, deleteBankHolidayAction, rejectSuggestionAction, saveCategoryAction, saveCityAction, saveSettingsAction, setLastReviewedAction, setUserActiveAction } from "@/app/admin/actions";
import { cn } from "@/lib/cn";
import { formatMedium } from "@/lib/tools/dates";
import type { Category, City, Settings, Suggestion } from "@/lib/tools/events";

const Msg = ({ text, ok = true }: { text: string; ok?: boolean }) =>
  text ? (
    <p className={cn("m-0 text-sm font-bold", ok ? "text-green" : "text-brand")} role="status">
      {text}
    </p>
  ) : null;

function Input({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-bold">
        {label}
      </label>
      {hint && <p className="m-0 text-[12px] text-muted">{hint}</p>}
      {children}
    </div>
  );
}

/* ---- Cities ------------------------------------------------------------------------- */

const blankCity = { slug: "", name: "", nation: "england", region: "", latitude: 0, longitude: 0, covered: true, aliases: "", intro: "" };

export function CitiesEditor({ cities, counts }: { cities: City[]; counts: Record<string, number> }) {
  const router = useRouter();
  const [edit, setEdit] = useState<typeof blankCity | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [pending, start] = useTransition();
  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <button type="button" className="btn btn-coral min-h-11" onClick={() => (setEdit({ ...blankCity }), setIsNew(true))}>
          + Add city
        </button>
      </div>
      {edit && (
        <form
          className="grid gap-3 rounded-[18px] border border-ink bg-white p-5 md:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const r = await saveCityAction(edit, isNew);
              setMsg({ text: r.message, ok: r.ok });
              if (r.ok) {
                setEdit(null);
                router.refresh();
              }
            });
          }}
        >
          <Input id="c-name" label="Name">
            <input id="c-name" className="field min-h-11" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value, slug: isNew ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : edit.slug })} required />
          </Input>
          <Input id="c-slug" label="Slug (web address)" hint="Can’t be changed later.">
            <input id="c-slug" className="field min-h-11" value={edit.slug} disabled={!isNew} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} required />
          </Input>
          <Input id="c-nation" label="Nation">
            <select id="c-nation" className="field min-h-11" value={edit.nation} onChange={(e) => setEdit({ ...edit, nation: e.target.value })}>
              <option value="england">England</option>
              <option value="scotland">Scotland</option>
              <option value="wales">Wales</option>
              <option value="northern-ireland">Northern Ireland</option>
            </select>
          </Input>
          <Input id="c-region" label="Region (optional)">
            <input id="c-region" className="field min-h-11" value={edit.region} onChange={(e) => setEdit({ ...edit, region: e.target.value })} />
          </Input>
          <Input id="c-lat" label="Latitude" hint="City centre, e.g. 53.4808">
            <input id="c-lat" inputMode="decimal" className="field min-h-11" value={edit.latitude || ""} onChange={(e) => setEdit({ ...edit, latitude: Number(e.target.value) })} required />
          </Input>
          <Input id="c-lng" label="Longitude" hint="e.g. -2.2426">
            <input id="c-lng" inputMode="decimal" className="field min-h-11" value={edit.longitude || ""} onChange={(e) => setEdit({ ...edit, longitude: Number(e.target.value) })} required />
          </Input>
          <div className="md:col-span-3">
            <Input id="c-aliases" label="Nearby towns and areas (comma-separated)" hint="Searching any of these finds this city, e.g. “Salford, Trafford, Stockport”.">
              <input id="c-aliases" className="field min-h-11" value={edit.aliases} onChange={(e) => setEdit({ ...edit, aliases: e.target.value })} />
            </Input>
          </div>
          <div className="md:col-span-3">
            <Input id="c-intro" label="City page intro (optional)">
              <textarea id="c-intro" rows={2} className="field p-3" value={edit.intro} onChange={(e) => setEdit({ ...edit, intro: e.target.value })} />
            </Input>
          </div>
          <label className="flex min-h-11 items-center gap-2.5 text-sm font-bold">
            <input type="checkbox" checked={edit.covered} onChange={(e) => setEdit({ ...edit, covered: e.target.checked })} className="size-5" />
            Covered (gets a city page and appears in search)
          </label>
          <div className="flex gap-2 md:col-span-2 md:justify-end">
            <button type="submit" className="btn btn-coral min-h-11" disabled={pending}>
              Save city
            </button>
            <button type="button" className="btn btn-outline min-h-11" onClick={() => setEdit(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}
      <Msg text={msg.text} ok={msg.ok} />
      <div className="overflow-x-auto rounded-[18px] border border-line bg-white">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-cloud-2 text-[12px] tracking-[0.5px] text-muted uppercase">
            <tr>
              <th className="px-3 py-2 text-left">City</th>
              <th className="px-3 py-2 text-left">Nation</th>
              <th className="px-3 py-2 text-left">Nearby towns</th>
              <th className="px-3 py-2 text-left">Upcoming</th>
              <th className="px-3 py-2 text-left">Covered</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {cities.map((c) => (
              <tr key={c.slug} className="border-t border-line">
                <td className="px-3 py-2 font-bold">{c.name}</td>
                <td className="px-3 py-2 capitalize">{c.nation.replace(/-/g, " ")}</td>
                <td className="px-3 py-2 text-ink-copy">{c.aliases.join(", ") || "—"}</td>
                <td className="px-3 py-2 tabular-nums">{counts[c.slug] ?? 0}</td>
                <td className="px-3 py-2">{c.covered ? "Yes" : "No"}</td>
                <td className="px-3 py-2 text-right">
                  <button type="button" className="btn btn-outline min-h-11 px-3" onClick={() => (setEdit({ ...c, region: c.region ?? "", aliases: c.aliases.join(", "), intro: c.intro ?? "" }), setIsNew(false))}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---- Categories ---------------------------------------------------------------------- */

export function CategoriesEditor({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [edit, setEdit] = useState<{ slug: string; name: string; icon: string; sortOrder: number; tip: string } | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [pending, start] = useTransition();
  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <button type="button" className="btn btn-coral min-h-11" onClick={() => (setEdit({ slug: "", name: "", icon: "", sortOrder: categories.length + 1, tip: "" }), setIsNew(true))}>
          + Add category
        </button>
      </div>
      {edit && (
        <form
          className="grid gap-3 rounded-[18px] border border-ink bg-white p-5 md:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const r = await saveCategoryAction(edit, isNew);
              setMsg({ text: r.message, ok: r.ok });
              if (r.ok) {
                setEdit(null);
                router.refresh();
              }
            });
          }}
        >
          <Input id="k-name" label="Name">
            <input id="k-name" className="field min-h-11" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value, slug: isNew ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : edit.slug })} required />
          </Input>
          <Input id="k-slug" label="Slug">
            <input id="k-slug" className="field min-h-11" value={edit.slug} disabled={!isNew} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} required />
          </Input>
          <Input id="k-order" label="Sort order">
            <input id="k-order" inputMode="numeric" className="field min-h-11" value={edit.sortOrder} onChange={(e) => setEdit({ ...edit, sortOrder: Number(e.target.value) || 0 })} />
          </Input>
          <div className="md:col-span-3">
            <Input id="k-tip" label="Host tip (shown on event cards)">
              <input id="k-tip" className="field min-h-11" value={edit.tip} onChange={(e) => setEdit({ ...edit, tip: e.target.value })} maxLength={200} />
            </Input>
          </div>
          <div className="flex gap-2 md:col-span-3 md:justify-end">
            <button type="submit" className="btn btn-coral min-h-11" disabled={pending}>
              Save category
            </button>
            <button type="button" className="btn btn-outline min-h-11" onClick={() => setEdit(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}
      <Msg text={msg.text} ok={msg.ok} />
      <ul className="m-0 grid list-none gap-2 p-0">
        {categories.map((c) => (
          <li key={c.slug} className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-line bg-white px-4 py-3">
            <div>
              <p className="m-0 font-bold">
                {c.sortOrder}. {c.name}
              </p>
              <p className="m-0 text-[13px] text-muted">{c.tip || "No tip"}</p>
            </div>
            <button type="button" className="btn btn-outline min-h-11 px-3" onClick={() => (setEdit({ slug: c.slug, name: c.name, icon: c.icon ?? "", sortOrder: c.sortOrder, tip: c.tip ?? "" }), setIsNew(false))}>
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---- Bank holidays --------------------------------------------------------------------- */

export function BankHolidaysEditor({ holidays }: { holidays: { id: string; date: string; name: string; nations: string[] }[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, start] = useTransition();
  return (
    <div className="grid gap-4">
      <form
        className="grid gap-3 rounded-[18px] border border-line bg-white p-5"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const r = await addBankHolidaysAction(text);
            setMsg({ text: r.message, ok: r.ok });
            setErrors(r.errors);
            if (r.ok) {
              setText("");
              router.refresh();
            }
          });
        }}
      >
        <h2 className="m-0 text-lg font-extrabold">Add next year’s bank holidays</h2>
        <p className="m-0 text-sm text-ink-copy">
          Copy the dates from{" "}
          <a href="https://www.gov.uk/bank-holidays" target="_blank" rel="noopener noreferrer" className="font-bold text-brand">
            GOV.UK bank holidays
          </a>
          . One per line: <code className="text-[12px]">2028-01-03, New Year’s Day, england-and-wales|scotland|northern-ireland</code>
        </p>
        <label htmlFor="bh-text" className="sr-only-label">
          Bank holidays, one per line
        </label>
        <textarea id="bh-text" rows={6} className="field p-3 font-mono text-[13px]" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="flex items-center gap-3">
          <button type="submit" className="btn btn-coral min-h-11" disabled={pending || !text.trim()}>
            Add bank holidays
          </button>
          <Msg text={msg.text} ok={msg.ok} />
        </div>
        {errors.length > 0 && (
          <ul className="m-0 grid list-none gap-1 p-0 text-sm font-bold text-brand">
            {errors.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        )}
      </form>
      <div className="overflow-x-auto rounded-[18px] border border-line bg-white">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead className="bg-cloud-2 text-[12px] tracking-[0.5px] text-muted uppercase">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Nations</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {holidays.map((h) => (
              <tr key={h.id} className="border-t border-line">
                <td className="px-3 py-2 tabular-nums">{formatMedium(h.date)}</td>
                <td className="px-3 py-2 font-bold">{h.name}</td>
                <td className="px-3 py-2 text-ink-copy">{h.nations.join(", ")}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    className="btn btn-outline min-h-11 px-3"
                    onClick={() => {
                      if (window.confirm(`Delete ${h.name} (${h.date})?`)) start(async () => (await deleteBankHolidayAction(h.id), router.refresh()));
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---- Settings ------------------------------------------------------------------------- */

const NUMBER_FIELDS: { k: keyof Settings; label: string; hint: string }[] = [
  { k: "defaultDistance", label: "Default distance (miles)", hint: "Must be one of the distance options." },
  { k: "defaultRangeDays", label: "Default date range (days)", hint: "90 = “Next 90 days”." },
  { k: "recheckDays", label: "Re-check interval (days)", hint: "A published event is due a re-check after this long." },
  { k: "recheckHorizonDays", label: "Re-check horizon (days)", hint: "Only events starting within this many days are queued." },
  { k: "startingSoonDays", label: "“Starting soon” window (days)", hint: "" },
  { k: "confirmWindowDays", label: "Confirm expected dates within (days)", hint: "" },
  { k: "launchCities", label: "Launch: cities needed", hint: "" },
  { k: "launchEventsPerCity", label: "Launch: events per city", hint: "" },
  { k: "coverageDays", label: "Coverage window (days)", hint: "" },
  { k: "cityNoindexMin", label: "City page: fewest upcoming events to show in search", hint: "Fewer than this and the city page is kept out of search results." },
  { k: "defaultReminderWeeks", label: "Default reminder (weeks before)", hint: "" },
  { k: "duplicateDays", label: "Duplicate check window (days)", hint: "" },
];

export function SettingsForm({ settings, lastReviewed }: { settings: Settings; lastReviewed: string }) {
  const router = useRouter();
  const [s, setS] = useState<Settings>(settings);
  const [distances, setDistances] = useState(settings.distances.join(", "));
  const [weeks, setWeeks] = useState(settings.reminderWeeks.join(", "));
  const [reviewed, setReviewed] = useState(lastReviewed);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [pending, start] = useTransition();
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await saveSettingsAction({ ...s, distances: distances.split(",").map(Number), reminderWeeks: weeks.split(",").map(Number) });
          setMsg({ text: r.message, ok: r.ok });
          router.refresh();
        });
      }}
    >
      <section className="grid gap-4 rounded-[18px] border border-line bg-white p-5 md:grid-cols-3">
        {NUMBER_FIELDS.map((f) => (
          <Input key={f.k} id={`s-${f.k}`} label={f.label} hint={f.hint}>
            <input id={`s-${f.k}`} inputMode="numeric" className="field min-h-11" value={String(s[f.k])} onChange={(e) => setS({ ...s, [f.k]: Number(e.target.value) })} />
          </Input>
        ))}
        <Input id="s-distances" label="Distance options (miles)" hint="Comma-separated, e.g. 10, 25, 50">
          <input id="s-distances" className="field min-h-11" value={distances} onChange={(e) => setDistances(e.target.value)} />
        </Input>
        <Input id="s-weeks" label="Reminder options (weeks)" hint="Comma-separated, e.g. 2, 4, 6, 8">
          <input id="s-weeks" className="field min-h-11" value={weeks} onChange={(e) => setWeeks(e.target.value)} />
        </Input>
        <label className="flex min-h-11 items-center gap-2.5 text-sm font-bold">
          <input type="checkbox" checked={s.weeklyReminder} onChange={(e) => setS({ ...s, weeklyReminder: e.target.checked })} className="size-5" />
          Weekly reminder email to admins (sends once an email service is connected)
        </label>
        <label className="flex min-h-11 items-center gap-2.5 text-sm font-bold md:col-span-2">
          <input type="checkbox" checked={s.eventStructuredData} onChange={(e) => setS({ ...s, eventStructuredData: e.target.checked })} className="size-5" />
          Event structured data for search engines (check Google’s current guidelines first)
        </label>
        <div className="md:col-span-3">
          <Input id="s-criteria" label="How demand is estimated (shown on the public page)">
            <textarea id="s-criteria" rows={4} className="field p-3" value={s.demandCriteria} onChange={(e) => setS({ ...s, demandCriteria: e.target.value })} />
          </Input>
        </div>
      </section>
      <div className="flex items-center gap-3">
        <button type="submit" className="btn btn-coral min-h-12" disabled={pending}>
          Save settings
        </button>
        <Msg text={msg.text} ok={msg.ok} />
      </div>
      <section className="flex flex-wrap items-end gap-3 rounded-[18px] border border-line bg-white p-5">
        <Input id="s-reviewed" label="Events last reviewed" hint="Set automatically when a bulk check covers most upcoming events. Override it here.">
          <input id="s-reviewed" type="date" className="field min-h-11" value={reviewed} onChange={(e) => setReviewed(e.target.value)} />
        </Input>
        <button type="button" className="btn btn-outline min-h-11" disabled={pending} onClick={() => start(async () => setMsg(await setLastReviewedAction(reviewed).then((r) => ({ text: r.message, ok: r.ok }))))}>
          Save date
        </button>
      </section>
    </form>
  );
}

/* ---- Suggestions -------------------------------------------------------------------------- */

export function SuggestionsInbox({ suggestions, role }: { suggestions: (Suggestion & { createdAt: string })[]; role: "admin" | "editor" }) {
  const router = useRouter();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const open = suggestions.filter((s) => s.status === "new");
  const closed = suggestions.filter((s) => s.status !== "new").slice(0, 30);
  return (
    <div className="grid gap-4">
      {!open.length && <p className="m-0 rounded-[14px] bg-white px-4 py-3 text-sm text-muted">No new suggestions.</p>}
      {open.map((s) => (
        <article key={s.id} className="grid gap-2 rounded-[18px] border border-line bg-white p-5" data-suggestion={s.id}>
          <h2 className="m-0 text-lg font-extrabold">{s.name}</h2>
          <p className="m-0 text-sm text-ink-copy">
            {s.date} · {s.town} · sent {formatMedium(s.createdAt.slice(0, 10))}
          </p>
          <p className="m-0 text-sm">
            Source:{" "}
            <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="font-bold break-all text-brand">
              {s.sourceUrl}
            </a>
          </p>
          {s.message && <p className="m-0 rounded-[12px] bg-cloud-2 px-3 py-2 text-sm">{s.message}</p>}
          {role === "admin" && s.email && <p className="m-0 text-[13px] text-muted">Email (deleted when closed): {s.email}</p>}
          <div className="flex flex-wrap items-end gap-2">
            <Link href={`/admin/events/new?suggestion=${s.id}`} className="btn btn-coral min-h-11">
              Create draft from this
            </Link>
            <div className="grid gap-1">
              <label htmlFor={`note-${s.id}`} className="text-[12px] font-bold">
                Note (optional)
              </label>
              <input id={`note-${s.id}`} className="field min-h-11" value={notes[s.id] ?? ""} onChange={(e) => setNotes({ ...notes, [s.id]: e.target.value })} />
            </div>
            <button type="button" className="btn btn-outline min-h-11" disabled={pending} onClick={() => start(async () => (await rejectSuggestionAction(s.id, notes[s.id] ?? ""), router.refresh()))}>
              Reject
            </button>
          </div>
        </article>
      ))}
      {closed.length > 0 && (
        <details className="rounded-[18px] border border-line bg-white p-5">
          <summary className="min-h-11 cursor-pointer font-bold">Closed suggestions ({closed.length})</summary>
          <ul className="m-0 mt-2 grid list-none gap-1 p-0 text-sm">
            {closed.map((s) => (
              <li key={s.id}>
                {s.name} · {s.town} · <strong className="capitalize">{s.status}</strong>
                {s.note ? ` · ${s.note}` : ""}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

/* ---- Users ------------------------------------------------------------------------------ */

export function UsersPanel({ users, me }: { users: { id: string; email: string; name: string; role: string; active: boolean; lastLoginAt: string | null }[]; me: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "editor">("editor");
  const [msg, setMsg] = useState({ text: "", ok: true, password: "" });
  const [pending, start] = useTransition();
  return (
    <div className="grid gap-4">
      <form
        className="grid gap-3 rounded-[18px] border border-line bg-white p-5 md:grid-cols-[1fr_1fr_160px_auto] md:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const r = await addUserAction(email, name, role);
            setMsg({ text: r.message, ok: r.ok, password: r.password ?? "" });
            if (r.ok) {
              setEmail("");
              setName("");
              router.refresh();
            }
          });
        }}
      >
        <Input id="u-email" label="Email">
          <input id="u-email" type="email" className="field min-h-11" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Input>
        <Input id="u-name" label="Name">
          <input id="u-name" className="field min-h-11" value={name} onChange={(e) => setName(e.target.value)} />
        </Input>
        <Input id="u-role" label="Role">
          <select id="u-role" className="field min-h-11" value={role} onChange={(e) => setRole(e.target.value as "admin" | "editor")}>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </Input>
        <button type="submit" className="btn btn-coral min-h-11" disabled={pending}>
          Add user
        </button>
      </form>
      {msg.text && (
        <div className="rounded-[14px] bg-white px-4 py-3" role="status">
          <Msg text={msg.text} ok={msg.ok} />
          {msg.password && <p className="m-0 mt-1 font-mono text-base font-bold select-all">{msg.password}</p>}
        </div>
      )}
      <ul className="m-0 grid list-none gap-2 p-0">
        {users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-line bg-white px-4 py-3">
            <div>
              <p className="m-0 font-bold">
                {u.name} <span className="rounded-md bg-fog px-2 py-[2px] text-[12px] uppercase">{u.role}</span> {!u.active && <span className="text-brand">(switched off)</span>}
              </p>
              <p className="m-0 text-[13px] text-muted">
                {u.email} · last signed in {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("en-GB", { timeZone: "Europe/London" }) : "never"}
              </p>
            </div>
            {u.id !== me && (
              <button type="button" className="btn btn-outline min-h-11 px-3" disabled={pending} onClick={() => start(async () => (await setUserActiveAction(u.id, !u.active), router.refresh()))}>
                {u.active ? "Switch off" : "Switch on"}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
