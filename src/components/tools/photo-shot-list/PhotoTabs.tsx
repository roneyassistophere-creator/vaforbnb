"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { toolSlug } from "@/content/tools/photoShotList";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { captionsText, LIST_LIMITS, photographerBrief, prepSections, seasonNotes, type Content, type Item, type ListState, type Setup, type Shot } from "@/lib/tools/photo-shot-list";
import { CopyButton } from "../CopyButton";
import { CaptionField, ShotCard, type CardActions } from "./ShotCard";

export type Tab = "order" | "prep" | "light" | "captions";
export const TABS: Tab[] = ["order", "prep", "light", "captions"];
const LABELS: Record<Tab, string> = { order: "Photo order", prep: "Prep checklist", light: "Light and kit", captions: "Captions" };

type Props = {
  tab: Tab;
  onTab: (t: Tab) => void;
  content: Content;
  setup: Setup;
  items: Item[];
  shots: Shot[];
  st: ListState;
  setSt: (f: (s: ListState) => ListState) => void;
  vague: string[];
  a: CardActions & { onReset: () => void; onAddCustom: (name: string, caption: string) => void };
  progressText: string;
  /** Export buttons (PDF, print, CSV), shared with the toolbar. */
  onPdf: () => void;
  isCustomOrder: boolean;
  /** Drag and drop: move the shot at `from` to `to`. */
  dragTo: (from: number, to: number) => void;
};

export function PhotoTabs(p: Props) {
  return (
    <section aria-label="Your shot list" className="scroll-mt-4 rounded-[20px] border border-line bg-white" id="ps-tabs">
      <div role="tablist" aria-label="Shot list" className="flex gap-1 overflow-x-auto border-b border-line p-1.5 [scrollbar-width:thin]">
        {TABS.map((t, n) => (
          <button
            key={t}
            id={`ps-tab-${t}`}
            type="button"
            role="tab"
            aria-selected={p.tab === t}
            aria-controls={`ps-tabpanel-${t}`}
            tabIndex={p.tab === t ? 0 : -1}
            onClick={() => p.onTab(t)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              const next = TABS[(n + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
              p.onTab(next);
              document.getElementById(`ps-tab-${next}`)?.focus();
            }}
            className={cn("min-h-11 flex-none cursor-pointer rounded-[12px] border-none px-4 text-sm font-extrabold whitespace-nowrap", p.tab === t ? "bg-ink text-white" : "bg-transparent text-ink-copy hover:bg-fog")}
          >
            {LABELS[t]}
          </button>
        ))}
      </div>
      <div id={`ps-tabpanel-${p.tab}`} role="tabpanel" aria-labelledby={`ps-tab-${p.tab}`} className="p-4 md:p-6" tabIndex={-1}>
        {p.tab === "order" && <OrderTab {...p} />}
        {p.tab === "prep" && <PrepTab {...p} />}
        {p.tab === "light" && <LightTab {...p} />}
        {p.tab === "captions" && <CaptionsTab {...p} />}
      </div>
    </section>
  );
}

/* ---------------- Photo order ---------------- */

function OrderTab({ shots, st, content, vague, a, progressText, isCustomOrder, dragTo }: Props) {
  const dragFrom = useRef<number | null>(null);
  const [name, setName] = useState("");
  const [caption, setCaption] = useState("");
  const actions: CardActions = {
    ...a,
    onDragStart: (i) => {
      dragFrom.current = i;
    },
    onDrop: (to) => {
      if (dragFrom.current !== null) dragTo(dragFrom.current, to);
      dragFrom.current = null;
    },
  };
  const groups: { key: Shot["group"]; title: string }[] = [
    { key: "first", title: "First five" },
    { key: "tour", title: "Photo tour" },
    { key: "extras", title: "Extras and honesty shots" },
  ];
  const add = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    a.onAddCustom(name, caption);
    setName("");
    setCaption("");
  };
  return (
    <div className="grid gap-6" data-order-tab>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-[15px] font-extrabold text-ink" data-progress aria-live="polite">
          {progressText}
        </p>
        <button type="button" onClick={a.onReset} disabled={!isCustomOrder} className="btn btn-outline min-h-11 disabled:cursor-not-allowed disabled:opacity-50">
          Reset to recommended order
        </button>
      </div>
      {groups.map((g) => {
        const list = shots.filter((x) => x.group === g.key);
        if (!list.length) return null;
        return (
          <div key={g.key}>
            <h3 className="m-0 mb-3 text-[13px] font-extrabold tracking-[0.6px] text-muted uppercase">
              {g.title} <span className="tabular-nums">({list.length})</span>
            </h3>
            <ol className="m-0 grid list-none gap-3 p-0" data-group={g.key}>
              {list.map((x) => {
                const i = shots.indexOf(x);
                return <ShotCard key={x.id} shot={x} index={i} total={shots.length} taken={st.taken.includes(x.id)} note={st.notes[x.id] ?? ""} limit={content.captionLimit} vague={vague} a={actions} />;
              })}
            </ol>
          </div>
        );
      })}
      <form onSubmit={add} className="grid gap-3 rounded-[18px] border border-dashed border-line-strong p-4 md:p-5" data-add-custom>
        <h3 className="m-0 text-base font-extrabold text-ink">Add a custom shot</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <label htmlFor="ps-custom-name" className="text-sm font-bold text-ink">
              Name
            </label>
            <input id="ps-custom-name" type="text" className="field min-h-12" value={name} maxLength={LIST_LIMITS.name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="ps-custom-caption" className="text-sm font-bold text-ink">
              Caption
            </label>
            <input id="ps-custom-caption" type="text" className="field min-h-12" value={caption} maxLength={LIST_LIMITS.caption} onChange={(e) => setCaption(e.target.value)} autoComplete="off" />
          </div>
        </div>
        <button type="submit" className="btn btn-outline min-h-11 justify-self-start" disabled={!name.trim()}>
          + Add shot
        </button>
      </form>
    </div>
  );
}

/* ---------------- Prep checklist ---------------- */

function PrepTab({ items, content, st, setSt }: Props) {
  const sections = prepSections(items, content.rules);
  const toggle = (id: string) => setSt((s) => ({ ...s, prep: s.prep.includes(id) ? s.prep.filter((x) => x !== id) : [...s.prep, id] }));
  const done = sections.reduce((n, s) => n + s.items.filter((i) => st.prep.includes(i.id)).length, 0);
  const total = sections.reduce((n, s) => n + s.items.length, 0);
  return (
    <div className="grid gap-5" data-prep-tab>
      <p className="m-0 text-[15px] font-extrabold text-ink" aria-live="polite">
        {done} of {total} ready
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((sec) => (
          <fieldset key={sec.key} className={cn("m-0 min-w-0 rounded-[16px] border border-line p-4", sec.key === "whole" && "md:col-span-2")} data-prep={sec.key}>
            <legend className="px-1 text-[15px] font-extrabold text-ink">{sec.title}</legend>
            <ul className={cn("m-0 grid list-none gap-1 p-0", sec.key === "whole" && "sm:grid-cols-2")}>
              {sec.items.map((i) => (
                <li key={i.id}>
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px] text-ink-copy has-checked:text-muted has-checked:line-through">
                    <input type="checkbox" checked={st.prep.includes(i.id)} onChange={() => toggle(i.id)} className="size-5 flex-none accent-ink" />
                    {i.text}
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Light and kit ---------------- */

const Box = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="rounded-[16px] bg-cloud-2 p-4 md:p-5">
    <h3 className="m-0 mb-2 text-[15px] font-extrabold text-ink">{title}</h3>
    {children}
  </div>
);

function LightTab({ content, setup, shots, onPdf }: Props) {
  const R = content.rules;
  const notes = seasonNotes(setup, R);
  const dirs = ["north", "east", "south", "west"] as const;
  return (
    <div className="grid gap-4 md:grid-cols-2" data-light-tab>
      <Box title="Phone or camera settings">
        <ul className="m-0 grid list-disc gap-1 pl-5 text-[15px] leading-[1.55] text-ink-copy">
          {R.settings.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        {setup.shooter && R.shooterNotes[setup.shooter] && <p className="m-0 mt-3 text-sm text-ink-copy">{R.shooterNotes[setup.shooter]}</p>}
      </Box>
      <Box title="Light">
        <ul className="m-0 grid list-none gap-1.5 p-0 text-[15px] leading-[1.5] text-ink-copy">
          {setup.windows && setup.windows !== "unknown" && R.light[setup.windows] ? (
            <li data-window-tip>
              <strong className="text-ink">Your main windows face {setup.windows}:</strong> {R.light[setup.windows]}.
            </li>
          ) : (
            <>
              <li data-window-tip>{R.light.unknown}.</li>
              {dirs.map((d) => (
                <li key={d} className="text-sm">
                  <strong className="text-ink capitalize">{d}-facing:</strong> {R.light[d]}
                </li>
              ))}
            </>
          )}
          <li>{R.light.outside}.</li>
        </ul>
      </Box>
      <Box title="Season">
        {notes.length ? (
          <ul className="m-0 grid list-disc gap-1 pl-5 text-[15px] leading-[1.55] text-ink-copy" data-season-notes>
            {notes.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        ) : (
          <p className="m-0 text-sm text-muted">Pick a season in step 4 for season tips.</p>
        )}
      </Box>
      {setup.shooter === "pro" && (
        <Box title="Working with a photographer">
          <p className="m-0 mb-3 text-sm text-ink-copy">Send your photographer this list (PDF) and the short brief below.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-coral min-h-11" onClick={onPdf}>
              Send your photographer this list (PDF)
            </button>
            <CopyButton getText={() => photographerBrief(shots, R, "")} label="Copy the brief" className="min-h-11" onCopied={() => track("copied", toolSlug, { type: "brief" })} />
          </div>
          <p className="m-0 mt-3 rounded-[12px] bg-white px-3.5 py-3 text-sm leading-[1.55] text-ink-copy" data-brief>
            {photographerBrief(shots, R, "")}
          </p>
        </Box>
      )}
    </div>
  );
}

/* ---------------- Captions ---------------- */

function CaptionsTab({ shots, content, vague, a }: Props) {
  return (
    <div className="grid gap-4" data-captions-tab>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 max-w-[640px] text-sm text-ink-copy">{content.rules.captionHint}</p>
        <CopyButton getText={() => captionsText(shots)} label="Copy all captions" copiedLabel="Copied" className="btn-coral min-h-11" onCopied={() => track("captions_copied", toolSlug)} />
      </div>
      <ol className="m-0 grid list-none gap-3 p-0">
        {shots.map((x) => (
          <li key={x.id} className="grid gap-2 rounded-[16px] border border-line p-4" data-caption-row={x.id}>
            <p className="m-0 text-[15px] font-extrabold text-ink">
              <span className="tabular-nums">{x.position}</span>. {x.area}
            </p>
            <CaptionField id={`capt-${x.id}`} value={x.caption} onChange={(v) => a.onCaption(x.id, v)} limit={content.captionLimit} vague={vague} label={`Caption for photo ${x.position}`} />
            <div>
              <CopyButton getText={() => x.caption} label="Copy" className="min-h-11" onCopied={() => track("captions_copied", toolSlug, { count: 1 })} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
