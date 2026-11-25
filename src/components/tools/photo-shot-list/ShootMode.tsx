"use client";

import { useEffect, useRef, useState } from "react";
import { toolSlug } from "@/content/tools/photoShotList";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import type { ListState, Shot } from "@/lib/tools/photo-shot-list";

type WakeLock = { release: () => Promise<void> };

/**
 * Shoot-day mode: one shot per screen, built for walking round with a phone.
 * Taken status saves instantly (the parent writes it to the device), and it
 * reopens where the host left off. Asks to keep the screen on, politely.
 */
export function ShootMode({ shots, st, onTaken, onAt, onClose }: { shots: Shot[]; st: ListState; onTaken: (id: string, on: boolean) => void; onAt: (id: string) => void; onClose: () => void }) {
  const startIndex = Math.max(0, shots.findIndex((x) => x.id === st.shootAt));
  const [i, setI] = useState(startIndex);
  const [finished, setFinished] = useState(false);
  const [wake, setWake] = useState<"on" | "off" | "unsupported">("off");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const touch = useRef<number | null>(null);
  const lock = useRef<WakeLock | null>(null);
  const taken = shots.filter((x) => st.taken.includes(x.id)).length;
  const shot = shots[i];
  const allTaken = shots.length > 0 && taken === shots.length;

  // Keep the screen on, if the device allows it. Carry on quietly if refused.
  useEffect(() => {
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<WakeLock> } };
    if (!nav.wakeLock) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWake("unsupported");
      return;
    }
    nav.wakeLock
      .request("screen")
      .then((l) => {
        lock.current = l;
        setWake("on");
      })
      .catch(() => setWake("off"));
    return () => {
      lock.current?.release().catch(() => {});
      lock.current = null;
    };
  }, []);

  useEffect(() => {
    track("shoot_mode_started", toolSlug);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (shot) onAt(shot.id);
    headingRef.current?.focus();
  }, [i, shot, onAt]);

  const go = (n: number) => {
    if (n >= shots.length) {
      setFinished(true);
      track("shoot_mode_finished", toolSlug);
      return;
    }
    setFinished(false);
    setI(Math.max(0, n));
  };
  const markTaken = () => {
    if (!shot) return;
    onTaken(shot.id, true);
    // Next untaken shot after this one, or the finish screen.
    const next = shots.findIndex((x, n) => n > i && !st.taken.includes(x.id));
    go(next === -1 ? shots.length : next);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && !(e.target instanceof HTMLInputElement)) go(i + 1);
      if (e.key === "ArrowLeft" && !(e.target instanceof HTMLInputElement)) go(i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const pct = shots.length ? Math.round((taken / shots.length) * 100) : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ps-shoot-heading"
      className="fixed inset-0 z-[60] flex flex-col bg-cream"
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        touch.current = null;
        if (Math.abs(dx) > 60) go(i + (dx < 0 ? 1 : -1));
      }}
      data-shoot-mode
    >
      {/* Top bar: progress and close */}
      <div className="border-b border-line bg-white px-4 pt-3 pb-3">
        <div className="mx-auto flex max-w-[640px] items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="m-0 text-sm font-extrabold text-ink" data-shoot-progress>
              {taken} of {shots.length} taken
            </p>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-fog" role="progressbar" aria-valuemin={0} aria-valuemax={shots.length} aria-valuenow={taken} aria-label="Shots taken">
              <div className="h-full rounded-full bg-green-dot transition-[width]" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-outline min-h-14 px-4" data-shoot-close>
            Jump to the list
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mx-auto max-w-[640px]">
          {finished || !shot ? (
            <div className="grid gap-4 py-8 text-center" data-shoot-finish>
              <h2 id="ps-shoot-heading" ref={headingRef} tabIndex={-1} className="m-0 text-[28px] font-extrabold text-ink outline-none">
                {allTaken ? `All ${shots.length} shots taken` : `${taken} of ${shots.length} shots taken`}
              </h2>
              <p className="m-0 text-[17px] leading-[1.6] text-ink-copy">Next: upload in this order and paste your captions.</p>
              {!allTaken && (
                <button type="button" onClick={() => go(Math.max(0, shots.findIndex((x) => !st.taken.includes(x.id))))} className="btn btn-outline mx-auto min-h-14">
                  Go to the first untaken shot
                </button>
              )}
              <button type="button" onClick={onClose} className="btn btn-coral mx-auto min-h-14 px-8">
                Back to the list and captions
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              <p className="sr-only-label" aria-live="polite" aria-atomic="true">
                Shot {i + 1} of {shots.length}, {shot.area}
                {st.taken.includes(shot.id) ? ", taken" : ""}
              </p>
              <div>
                <p className="m-0 text-[13px] font-extrabold tracking-[0.6px] text-muted uppercase" aria-hidden="true">
                  Shot {i + 1} of {shots.length}
                  {shot.isFirstFive && <span className="ml-2 rounded-md bg-coral-50 px-2 py-[2px] text-brand">First five</span>}
                </p>
                <h2 id="ps-shoot-heading" ref={headingRef} tabIndex={-1} className="m-0 mt-1 text-[30px] leading-[1.15] font-extrabold text-ink outline-none" data-shoot-area>
                  <span className="sr-only-label">
                    Shot {i + 1} of {shots.length}:{" "}
                  </span>
                  {shot.area}
                </h2>
                <p className="m-0 mt-1 text-[15px] text-ink-copy">
                  {shot.shotTypeLabel} · {shot.orientation}
                  {st.taken.includes(shot.id) && <strong className="ml-2 text-green">✓ Taken</strong>}
                </p>
              </div>
              {shot.whatToShow.length > 0 && (
                <div className="rounded-[16px] bg-white p-4">
                  <p className="m-0 mb-1.5 text-[12px] font-extrabold tracking-[0.6px] text-muted uppercase">What to show</p>
                  <ul className="m-0 grid list-disc gap-1.5 pl-5 text-[17px] leading-[1.5] text-ink">
                    {shot.whatToShow.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
              {shot.stagingTips.length > 0 && (
                <div className="rounded-[16px] bg-white p-4">
                  <p className="m-0 mb-1.5 text-[12px] font-extrabold tracking-[0.6px] text-muted uppercase">Staging</p>
                  <ul className="m-0 grid list-disc gap-1.5 pl-5 text-[16px] leading-[1.5] text-ink-copy">
                    {shot.stagingTips.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
              {shot.bestLight && (
                <p className="m-0 text-[16px] text-ink-copy">
                  <span aria-hidden="true">☀ </span>
                  <strong className="text-ink">Best light:</strong> {shot.bestLight}
                </p>
              )}
              {shot.caption && (
                <p className="m-0 rounded-[16px] bg-white p-4 text-[16px] text-ink-copy">
                  <strong className="block text-[12px] font-extrabold tracking-[0.6px] text-muted uppercase">Caption</strong>
                  {shot.caption}
                </p>
              )}
              {wake === "on" && <p className="m-0 text-[13px] text-muted">Your screen will stay on while shoot-day mode is open.</p>}
            </div>
          )}
        </div>
      </div>

      {/* Thumb zone: big buttons at the bottom */}
      {!finished && shot && (
        <div className="border-t border-line bg-white px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <div className="mx-auto grid max-w-[640px] gap-2">
            <button type="button" onClick={markTaken} className="btn btn-coral min-h-16 w-full text-lg" data-shoot-taken>
              Taken ✓
            </button>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => go(i - 1)} disabled={i === 0} className={cn("btn btn-outline min-h-14 disabled:opacity-40")} aria-label="Back to the previous shot">
                ← Back
              </button>
              <button type="button" onClick={() => go(i + 1)} className="btn btn-outline min-h-14" data-shoot-skip>
                Skip
              </button>
              <button type="button" onClick={() => go(i + 1)} className="btn btn-outline min-h-14" aria-label="Next shot">
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
