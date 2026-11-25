"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { nextYearCopyAction, saveEventAction, type SaveResult } from "@/app/admin/actions";
import { cn } from "@/lib/cn";
import { formatLong } from "@/lib/tools/dates";
import { MAX_DESCRIPTION, toPublic, type AdminEvent, type Category, type City, type FieldErrors, type Settings } from "@/lib/tools/events";
import { EventCard } from "../tools/events/EventCard";

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <fieldset className="m-0 grid min-w-0 gap-4 rounded-[18px] border border-line bg-white p-5">
    <legend className="px-1 text-base font-extrabold">{title}</legend>
    {children}
  </fieldset>
);

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-[15px] font-bold">
        {label}
      </label>
      {hint && <p className="m-0 text-[13px] text-muted">{hint}</p>}
      {children}
      {error && (
        <p className="m-0 text-sm font-bold text-brand" id={`${id}-err`}>
          {error}
        </p>
      )}
    </div>
  );
}

export function EventForm({
  initial,
  cities,
  categories,
  settings,
  today,
  role,
  suggestionId,
}: {
  initial: AdminEvent;
  cities: City[];
  categories: Category[];
  settings: Settings;
  today: string;
  role: "admin" | "editor";
  suggestionId?: string;
}) {
  const router = useRouter();
  const [e, setE] = useState<AdminEvent>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [dups, setDups] = useState<{ name: string; city: string; startDate: string }[]>([]);
  const [lastIntent, setLastIntent] = useState<"draft" | "publish" | "check">("draft");
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState(false);
  const [pending, start] = useTransition();
  const isAdmin = role === "admin";
  const locked = !isAdmin && initial.id && initial.status !== "draft";
  const set = (patch: Partial<AdminEvent>) => setE((x) => ({ ...x, ...patch }));
  const err = (k: keyof AdminEvent) => errors[k];
  const inputCls = (k: keyof AdminEvent) => cn("field min-h-12", err(k) && "border-brand");

  const save = (intent: "draft" | "publish" | "check", confirmDuplicate = false) => {
    setLastIntent(intent);
    setMsg("");
    start(async () => {
      const r: SaveResult = await saveEventAction(e, intent, confirmDuplicate, suggestionId);
      if (r.ok) {
        setErrors({});
        setDups([]);
        setMsg(intent === "publish" ? "Published. It’s on the public page now." : intent === "check" ? "Saved and marked as checked." : "Saved.");
        if (!e.id) router.replace(`/admin/events/${r.id}`);
        else router.refresh();
        return;
      }
      setErrors(r.errors ?? {});
      setDups(r.duplicates ?? []);
      setMsg(r.message ?? (r.errors ? "Please fix the fields marked below." : ""));
    });
  };

  const city = cities.find((c) => c.slug === e.city);
  const cardEvent = toPublic([{ ...e, status: "published", slug: e.slug || "preview", endDate: e.endDate || e.startDate, sourceUrl: e.sourceUrl || "https://example.org/" }], { allowSample: true })[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <div className="grid gap-4">
        {locked && <p className="m-0 rounded-[14px] bg-amber-25 px-4 py-3 text-sm font-bold text-amber">This event is {initial.status}. Editors can mark it as checked; only admins can change it.</p>}

        <Section title="Basics">
          <Field id="f-name" label="Event name" error={err("name")}>
            <input id="f-name" className={inputCls("name")} value={e.name} onChange={(x) => set({ name: x.target.value })} maxLength={160} />
          </Field>
          <Field id="f-cat" label="Category" error={err("category")}>
            <select id="f-cat" className={inputCls("category")} value={e.category} onChange={(x) => set({ category: x.target.value })}>
              <option value="">Pick a category</option>
              {categories
                .filter((c) => c.slug !== "bank-holidays")
                .map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field id="f-desc" label="Short description (optional)" hint={`Up to ${MAX_DESCRIPTION} characters. Facts, not adjectives.`} error={err("shortDescription")}>
            <textarea id="f-desc" rows={2} className={cn("field p-3", err("shortDescription") && "border-brand")} value={e.shortDescription} onChange={(x) => set({ shortDescription: x.target.value })} />
            <span className={cn("text-[12px] font-bold tabular-nums", e.shortDescription.length > MAX_DESCRIPTION ? "text-brand" : "text-muted")}>
              {e.shortDescription.length} / {MAX_DESCRIPTION}
            </span>
          </Field>
        </Section>

        <Section title="Dates">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="f-start" label="Start date" error={err("startDate")}>
              <input id="f-start" type="date" className={inputCls("startDate")} value={e.startDate} onChange={(x) => set({ startDate: x.target.value, endDate: !e.endDate || e.endDate < x.target.value ? x.target.value : e.endDate })} />
            </Field>
            <Field id="f-end" label="End date" hint="Same as the start for one-day events." error={err("endDate")}>
              <input id="f-end" type="date" className={inputCls("endDate")} value={e.endDate} onChange={(x) => set({ endDate: x.target.value })} />
            </Field>
            <Field id="f-time" label="Start time (optional)" error={err("startTime")}>
              <input id="f-time" type="time" className={inputCls("startTime")} value={e.startTime} onChange={(x) => set({ startTime: x.target.value })} />
            </Field>
          </div>
          <Field id="f-dstatus" label="Date status">
            <select id="f-dstatus" className="field min-h-12" value={e.dateStatus} onChange={(x) => set({ dateStatus: x.target.value as AdminEvent["dateStatus"] })}>
              <option value="confirmed">Confirmed by the organiser</option>
              <option value="expected">Expected (usual timing, not yet confirmed)</option>
              <option value="tba">To be announced (shows the expected month only)</option>
            </select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="f-rec" label="Repeats">
              <select id="f-rec" className="field min-h-12" value={e.recurrence} onChange={(x) => set({ recurrence: x.target.value as AdminEvent["recurrence"] })}>
                <option value="none">No</option>
                <option value="annual">Every year</option>
              </select>
            </Field>
            {e.recurrence === "annual" && (
              <>
                <Field id="f-um" label="Usual month" error={err("usualMonth")}>
                  <select id="f-um" className="field min-h-12" value={e.usualMonth ?? ""} onChange={(x) => set({ usualMonth: x.target.value ? Number(x.target.value) : null })}>
                    <option value="">Same as this year</option>
                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => (
                      <option key={m} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field id="f-uw" label="Usual week of the month" hint="e.g. 2nd week: next year’s copy keeps the same weekday." error={err("usualWeek")}>
                  <select id="f-uw" className="field min-h-12" value={e.usualWeek ?? ""} onChange={(x) => set({ usualWeek: x.target.value ? Number(x.target.value) : null })}>
                    <option value="">Not set (same date)</option>
                    {["1st", "2nd", "3rd", "4th", "Last"].map((w, i) => (
                      <option key={w} value={i + 1}>
                        {w} week
                      </option>
                    ))}
                  </select>
                </Field>
              </>
            )}
          </div>
        </Section>

        <Section title="Place">
          <Field id="f-city" label="City" error={err("city")}>
            <select id="f-city" className={inputCls("city")} value={e.city} onChange={(x) => set({ city: x.target.value })}>
              <option value="">Pick a city</option>
              {cities.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                  {c.covered ? "" : " (not covered)"}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="f-venue" label="Venue (optional)">
              <input id="f-venue" className="field min-h-12" value={e.venue} onChange={(x) => set({ venue: x.target.value })} maxLength={160} />
            </Field>
            <Field id="f-addr" label="Address or postcode (optional)">
              <input id="f-addr" className="field min-h-12" value={e.address} onChange={(x) => set({ address: x.target.value })} maxLength={200} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="f-lat" label="Latitude (optional)" hint="Leave empty to use the city’s location." error={err("latitude")}>
              <input id="f-lat" inputMode="decimal" className={inputCls("latitude")} value={e.latitude ?? ""} onChange={(x) => set({ latitude: x.target.value.trim() === "" ? null : Number(x.target.value) })} />
            </Field>
            <Field id="f-lng" label="Longitude (optional)" error={err("longitude")}>
              <input id="f-lng" inputMode="decimal" className={inputCls("longitude")} value={e.longitude ?? ""} onChange={(x) => set({ longitude: x.target.value.trim() === "" ? null : Number(x.target.value) })} />
            </Field>
          </div>
        </Section>

        <Section title="Demand">
          <Field id="f-demand" label="Our demand estimate" hint={settings.demandCriteria}>
            <select id="f-demand" className="field min-h-12" value={e.demand} onChange={(x) => set({ demand: x.target.value as AdminEvent["demand"] })}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </Field>
          <Field id="f-reason" label="Why (short note)" hint="For example “Sold-out stadium, city-wide”.">
            <input id="f-reason" className="field min-h-12" value={e.demandReason} onChange={(x) => set({ demandReason: x.target.value })} maxLength={200} />
          </Field>
        </Section>

        <Section title="Source">
          <Field id="f-stitle" label="Source name" hint="For example “Official festival website”." error={err("sourceTitle")}>
            <input id="f-stitle" className={inputCls("sourceTitle")} value={e.sourceTitle} onChange={(x) => set({ sourceTitle: x.target.value })} maxLength={160} />
          </Field>
          <Field id="f-surl" label="Official source link" hint="Must start https://. Events can’t be published without one." error={err("sourceUrl")}>
            <input id="f-surl" type="url" className={inputCls("sourceUrl")} value={e.sourceUrl} onChange={(x) => set({ sourceUrl: x.target.value })} placeholder="https://" />
          </Field>
          <Field id="f-surl2" label="Second source link (optional)" error={err("secondSourceUrl")}>
            <input id="f-surl2" type="url" className={inputCls("secondSourceUrl")} value={e.secondSourceUrl} onChange={(x) => set({ secondSourceUrl: x.target.value })} placeholder="https://" />
          </Field>
          <p className="m-0 text-sm text-ink-copy">
            Last checked: <strong>{e.lastChecked ? `${formatLong(e.lastChecked)}${e.checkedBy ? ` by ${e.checkedBy}` : ""}` : "never"}</strong>
          </p>
        </Section>

        <Section title="Publishing">
          {isAdmin && (
            <Field id="f-status" label="Status">
              <select id="f-status" className="field min-h-12" value={e.status} onChange={(x) => set({ status: x.target.value as AdminEvent["status"] })}>
                <option value="draft">Draft (not public)</option>
                <option value="published">Published</option>
                <option value="archived">Archived (not public)</option>
              </select>
            </Field>
          )}
          <label className="flex min-h-11 items-center gap-2.5 text-[15px] font-bold">
            <input type="checkbox" checked={e.featured} onChange={(x) => set({ featured: x.target.checked })} className="size-5" />
            Featured
          </label>
          <Field id="f-notes" label="Internal notes (admin only, never public)">
            <textarea id="f-notes" rows={3} className="field p-3" value={e.internalNotes} onChange={(x) => set({ internalNotes: x.target.value })} />
          </Field>
        </Section>

        {dups.length > 0 && (
          <div className="grid gap-2 rounded-[14px] border border-amber-50 bg-amber-25 p-4" role="alert" data-duplicate-warning>
            {dups.map((d) => (
              <p key={d.name + d.startDate} className="m-0 text-sm font-bold text-amber">
                Looks similar to ‘{d.name}’ in {d.city} on {formatLong(d.startDate)}. Continue?
              </p>
            ))}
            <div className="flex gap-2">
              <button type="button" className="btn btn-coral min-h-11" onClick={() => save(lastIntent, true)}>
                Yes, save anyway
              </button>
              <button type="button" className="btn btn-outline min-h-11" onClick={() => setDups([])}>
                No, go back
              </button>
            </div>
          </div>
        )}

        <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-2 rounded-[16px] border border-line bg-white/95 p-3 backdrop-blur" data-form-actions>
          {!locked && (
            <button type="button" className="btn btn-outline min-h-12" disabled={pending} onClick={() => save("draft")}>
              {isAdmin ? "Save" : "Save as draft"}
            </button>
          )}
          {isAdmin && (
            <button type="button" className="btn btn-coral min-h-12" disabled={pending} onClick={() => save("publish")} data-publish>
              Publish
            </button>
          )}
          <button type="button" className="btn btn-outline min-h-12" disabled={pending || (!!locked && !initial.id)} onClick={() => save("check")} data-save-check>
            Save and mark as checked
          </button>
          <button type="button" className="btn btn-outline min-h-12" onClick={() => setPreview((p) => !p)} aria-expanded={preview} data-preview-toggle>
            {preview ? "Hide preview" : "Preview"}
          </button>
          {e.id && e.recurrence === "annual" && (
            <button
              type="button"
              className="btn btn-outline min-h-12"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const r = await nextYearCopyAction(e.id!);
                  if (r.ok && r.id) router.push(`/admin/events/${r.id}`);
                  else setMsg(r.message ?? "");
                })
              }
            >
              Create next year’s copy
            </button>
          )}
          {msg && (
            <span className={cn("text-sm font-bold", Object.keys(errors).length || dups.length ? "text-brand" : "text-green")} role="status" data-form-msg>
              {msg}
            </span>
          )}
        </div>
      </div>

      <aside className={cn("grid gap-2 lg:sticky lg:top-4", !preview && "max-lg:hidden")} aria-label="Preview">
        <p className="m-0 text-[13px] font-extrabold tracking-[0.6px] text-muted uppercase">Preview: how hosts will see it</p>
        {preview ? (
          cardEvent && e.name ? (
            <div data-preview>
              <EventCard e={cardEvent} cityName={city?.name ?? "—"} miles={0} category={categories.find((c) => c.slug === e.category)} settings={settings} today={today} preview />
            </div>
          ) : (
            <p className="m-0 rounded-[14px] bg-white px-4 py-3 text-sm text-muted">Add a name, dates and a city to see the preview.</p>
          )
        ) : (
          <p className="m-0 rounded-[14px] bg-white px-4 py-3 text-sm text-muted">Press Preview to see the public card.</p>
        )}
      </aside>
    </div>
  );
}
