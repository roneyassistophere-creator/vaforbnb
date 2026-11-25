"use client";

import { useId, useState } from "react";
import { toolSlug } from "@/content/tools/eventCalendarId";
import { track } from "@/lib/analytics";
import type { City } from "@/lib/tools/events";

const Honeypot = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
    <label>
      Website
      <input tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  </div>
);

/** "Suggest an event": goes to the admin inbox, checked by a person before anything is published. */
export function SuggestEventForm({ town = "" }: { town?: string }) {
  const id = useId();
  const [f, setF] = useState({ name: "", date: "", town, sourceUrl: "", email: "", message: "", website: "" });
  const [state, setState] = useState<{ kind: "idle" | "sending" | "sent" | "error"; text?: string }>({ kind: "idle" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  if (state.kind === "sent")
    return (
      <p className="m-0 rounded-[14px] bg-green-100 px-4 py-3 text-[15px] font-bold text-green" role="status" data-suggest-sent>
        Thanks! We’ll check it and add it if it fits.
      </p>
    );

  return (
    <form
      className="relative grid gap-3 md:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!f.sourceUrl.trim().startsWith("https://")) return setState({ kind: "error", text: "Add a link to the official event page (starting https://)." });
        setState({ kind: "sending" });
        try {
          const res = await fetch("/api/event-suggestions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...f, sourceUrl: f.sourceUrl.trim() }) });
          const json = (await res.json()) as { ok: boolean; error?: string };
          if (!json.ok) return setState({ kind: "error", text: json.error ?? "Please check the form." });
          track("suggestion_sent", toolSlug);
          setState({ kind: "sent" });
        } catch {
          setState({ kind: "error", text: "Couldn’t send right now. Please try again later." });
        }
      }}
      data-suggest-form
    >
      <label htmlFor={`${id}-name`} className="grid gap-1.5 text-sm font-bold">
        Event name
        <input id={`${id}-name`} className="field min-h-11 font-normal" value={f.name} onChange={set("name")} required maxLength={140} />
      </label>
      <label htmlFor={`${id}-date`} className="grid gap-1.5 text-sm font-bold">
        Date (or month, if not confirmed)
        <input id={`${id}-date`} className="field min-h-11 font-normal" value={f.date} onChange={set("date")} required maxLength={60} placeholder="e.g. 14 March 2027" />
      </label>
      <label htmlFor={`${id}-town`} className="grid gap-1.5 text-sm font-bold">
        Town or city
        <input id={`${id}-town`} className="field min-h-11 font-normal" value={f.town} onChange={set("town")} required maxLength={80} />
      </label>
      <label htmlFor={`${id}-source`} className="grid gap-1.5 text-sm font-bold">
        Link to the official event page
        <input id={`${id}-source`} type="url" inputMode="url" className="field min-h-11 font-normal" value={f.sourceUrl} onChange={set("sourceUrl")} required placeholder="https://" />
      </label>
      <label htmlFor={`${id}-email`} className="grid gap-1.5 text-sm font-bold">
        Your email (optional)
        <span className="text-[12px] font-normal text-muted">Only so we can ask about it. Deleted once we’ve decided.</span>
        <input id={`${id}-email`} type="email" className="field min-h-11 font-normal" value={f.email} onChange={set("email")} maxLength={254} />
      </label>
      <label htmlFor={`${id}-msg`} className="grid gap-1.5 text-sm font-bold">
        Anything else? (optional)
        <textarea id={`${id}-msg`} rows={3} className="field p-3 font-normal" value={f.message} onChange={set("message")} maxLength={600} />
      </label>
      <Honeypot value={f.website} onChange={(v) => setF({ ...f, website: v })} />
      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <button type="submit" className="btn btn-coral min-h-12" disabled={state.kind === "sending"}>
          {state.kind === "sending" ? "Sending…" : "Send suggestion"}
        </button>
        {state.kind === "error" && (
          <p className="m-0 text-sm font-bold text-brand" role="alert">
            {state.text}
          </p>
        )}
      </div>
    </form>
  );
}

/** Event alerts sign-up: stored as a lead (with consent), the city kept in the consent text. */
export function EventAlertsForm({ cities, defaultCity }: { cities: City[]; defaultCity?: string }) {
  const id = useId();
  const covered = cities.filter((c) => c.covered);
  const [email, setEmail] = useState("");
  const [city, setCity] = useState(defaultCity ?? covered[0]?.slug ?? "");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<{ kind: "idle" | "sending" | "sent" | "error"; text?: string }>({ kind: "idle" });
  const cityName = covered.find((c) => c.slug === city)?.name ?? "";
  // Follow the city the host searched for, until they pick one here.
  const [picked, setPicked] = useState(false);
  const [lastDefault, setLastDefault] = useState(defaultCity);
  if (defaultCity !== lastDefault) {
    setLastDefault(defaultCity);
    if (!picked && defaultCity) setCity(defaultCity);
  }
  const consentText = `Email me a monthly list of big events in ${cityName} and occasional updates from VA for BnB. Unsubscribe any time.`;

  if (state.kind === "sent")
    return (
      <p className="m-0 rounded-[14px] bg-green-100 px-4 py-3 text-[15px] font-bold text-green" role="status" data-alerts-sent>
        You’re signed up for {cityName} event alerts.
      </p>
    );

  return (
    <form
      className="relative grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-end"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!consent) return setState({ kind: "error", text: "Tick the box to agree to the emails." });
        setState({ kind: "sending" });
        try {
          const res = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, toolSlug, consentText, timestamp: new Date().toISOString(), website }) });
          const json = (await res.json()) as { ok: boolean; error?: string };
          if (!json.ok) return setState({ kind: "error", text: json.error ?? "Please check your email address." });
          track("alerts_signup", toolSlug, { area: city });
          setState({ kind: "sent" });
        } catch {
          setState({ kind: "error", text: "Couldn’t sign you up right now. Please try again later." });
        }
      }}
      data-alerts-form
    >
      <label htmlFor={`${id}-email`} className="grid gap-1.5 text-sm font-bold">
        Email
        <input id={`${id}-email`} type="email" required className="field min-h-12 font-normal" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} />
      </label>
      <label htmlFor={`${id}-city`} className="grid gap-1.5 text-sm font-bold">
        City
        <select id={`${id}-city`} className="field min-h-12 font-normal" value={city} onChange={(e) => (setCity(e.target.value), setPicked(true))}>
          {covered.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn btn-coral min-h-12" disabled={state.kind === "sending"}>
        {state.kind === "sending" ? "Signing up…" : "Get alerts"}
      </button>
      <label className="flex items-start gap-2.5 text-[13px] leading-[1.5] text-ink-copy md:col-span-3">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-5 flex-none" />
        {consentText}
      </label>
      <Honeypot value={website} onChange={setWebsite} />
      {state.kind === "error" && (
        <p className="m-0 text-sm font-bold text-brand md:col-span-3" role="alert">
          {state.text}
        </p>
      )}
    </form>
  );
}
