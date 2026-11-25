"use client";

import { useState, type DragEvent } from "react";
import { cn } from "@/lib/cn";
import { countChars, findPhrases } from "@/lib/tools/listing-text";
import type { Shot } from "@/lib/tools/photo-shot-list";

export type CardActions = {
  onTaken: (id: string, on: boolean) => void;
  onNote: (id: string, v: string) => void;
  onCaption: (id: string, v: string) => void;
  onMove: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onDragStart: (index: number) => void;
  onDrop: (index: number) => void;
};

/** Caption field with a counter against the stored limit and an amber underline for vague words. */
export function CaptionField({ id, value, onChange, limit, vague, label = "Caption" }: { id: string; value: string; onChange: (v: string) => void; limit: number; vague: string[]; label?: string }) {
  const n = countChars(value);
  const hits = findPhrases(value, vague);
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-bold text-ink">
          {label}
        </label>
        <span id={`${id}-count`} className={cn("rounded-full px-2 py-0.5 text-[12px] font-bold tabular-nums", n > limit ? "bg-coral-50 text-brand" : "text-muted")} data-caption-count>
          {n} / {limit}
          {n > limit && <span className="sr-only-label"> (over the limit)</span>}
        </span>
      </div>
      <input id={id} type="text" className="field min-h-12" value={value} onChange={(e) => onChange(e.target.value)} maxLength={500} aria-describedby={`${id}-count${hits.length ? ` ${id}-vague` : ""}`} autoComplete="off" />
      {hits.length > 0 && (
        <p id={`${id}-vague`} className="m-0 text-[13px] text-amber" role="status" data-vague>
          Vague word{hits.length > 1 ? "s" : ""}:{" "}
          {hits.map((h, i) => (
            <span key={h.start}>
              {i > 0 && ", "}
              <span className="font-bold underline decoration-[#E0A800] decoration-wavy underline-offset-4">{h.text}</span>
            </span>
          ))}
          . Swap for a fact guests can check.
        </p>
      )}
    </div>
  );
}

export function ShotCard({
  shot,
  index,
  total,
  taken,
  note,
  limit,
  vague,
  a,
}: {
  shot: Shot;
  index: number;
  total: number;
  taken: boolean;
  note: string;
  limit: number;
  vague: string[];
  a: CardActions;
}) {
  const [over, setOver] = useState(false);
  const [noteOpen, setNoteOpen] = useState(!!note);
  const drop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    a.onDrop(index);
  };
  return (
    <li
      className={cn("grid gap-3 rounded-[18px] border bg-white p-4 md:p-5", taken ? "border-green-dot bg-green-25" : "border-line", over && "ring-2 ring-coral")}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={drop}
      data-shot={shot.id}
      data-position={shot.position}
    >
      <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
        <span
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", shot.id);
            a.onDragStart(index);
          }}
          className="flex size-11 flex-none cursor-grab items-center justify-center rounded-[12px] bg-fog text-lg text-muted active:cursor-grabbing"
          aria-hidden="true"
          title="Drag to reorder"
        >
          ⋮⋮
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="m-0 text-[17px] leading-[1.3] font-extrabold text-ink">
            <span className="tabular-nums">{shot.position}</span> · {shot.area}
          </h4>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {shot.isFirstFive && <span className="rounded-md bg-coral-50 px-2 py-[3px] text-[11px] font-extrabold tracking-[0.3px] text-brand uppercase">{shot.isCover ? "Cover · First five" : "First five"}</span>}
            {shot.honestyShot && <span className="rounded-md bg-steel-50 px-2 py-[3px] text-[11px] font-extrabold tracking-[0.3px] text-ink uppercase">Honesty shot</span>}
            {shot.custom && <span className="rounded-md bg-fog px-2 py-[3px] text-[11px] font-extrabold tracking-[0.3px] text-ink-copy uppercase">Your shot</span>}
            <span className="rounded-md bg-fog px-2 py-[3px] text-[11px] font-bold text-ink-copy">
              {shot.shotTypeLabel} · {shot.orientation}
            </span>
          </div>
        </div>
        <div className="flex gap-1" role="group" aria-label={`Move shot ${shot.position}`}>
          <button type="button" onClick={() => a.onMove(shot.id, -1)} disabled={index === 0} className="flex size-11 cursor-pointer items-center justify-center rounded-[12px] border border-line bg-white text-ink disabled:cursor-not-allowed disabled:opacity-40" aria-label={`Move ${shot.area} up`}>
            ↑
          </button>
          <button type="button" onClick={() => a.onMove(shot.id, 1)} disabled={index === total - 1} className="flex size-11 cursor-pointer items-center justify-center rounded-[12px] border border-line bg-white text-ink disabled:cursor-not-allowed disabled:opacity-40" aria-label={`Move ${shot.area} down`}>
            ↓
          </button>
        </div>
      </div>

      {shot.reasonForPosition && (
        <p className="m-0 text-sm text-ink-copy" data-reason>
          <strong className="text-ink">Why here:</strong> {shot.reasonForPosition}
        </p>
      )}

      {(shot.whatToShow.length > 0 || shot.stagingTips.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {shot.whatToShow.length > 0 && (
            <div>
              <p className="m-0 mb-1 text-[12px] font-extrabold tracking-[0.6px] text-muted uppercase">What to show</p>
              <ul className="m-0 grid list-disc gap-1 pl-5 text-sm leading-[1.5] text-ink-copy">
                {shot.whatToShow.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          )}
          {shot.stagingTips.length > 0 && (
            <div>
              <p className="m-0 mb-1 text-[12px] font-extrabold tracking-[0.6px] text-muted uppercase">Staging</p>
              <ul className="m-0 grid list-disc gap-1 pl-5 text-sm leading-[1.5] text-ink-copy">
                {shot.stagingTips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {shot.bestLight && (
        <p className="m-0 text-sm text-ink-copy" data-light>
          <span aria-hidden="true">☀ </span>
          <strong className="text-ink">Best light:</strong> {shot.bestLight}
        </p>
      )}

      <CaptionField id={`cap-${shot.id}`} value={shot.caption} onChange={(v) => a.onCaption(shot.id, v)} limit={limit} vague={vague} />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[15px] font-bold text-ink">
          <input type="checkbox" checked={taken} onChange={(e) => a.onTaken(shot.id, e.target.checked)} className="size-5 accent-ink" />
          Taken
        </label>
        <button type="button" onClick={() => setNoteOpen((o) => !o)} aria-expanded={noteOpen} className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-ink-copy underline underline-offset-2">
          {noteOpen ? "Hide note" : note ? "Edit note" : "Add a note"}
        </button>
        <button type="button" onClick={() => a.onRemove(shot.id)} className="ml-auto min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-brand underline underline-offset-2" aria-label={`Remove shot ${shot.position}: ${shot.area}`}>
          Remove
        </button>
      </div>
      {noteOpen && (
        <div className="grid gap-1.5">
          <label htmlFor={`note-${shot.id}`} className="text-sm font-bold text-ink">
            Note (only on this device)
          </label>
          <textarea id={`note-${shot.id}`} rows={2} maxLength={300} className="field p-3" value={note} onChange={(e) => a.onNote(shot.id, e.target.value)} />
        </div>
      )}
    </li>
  );
}
