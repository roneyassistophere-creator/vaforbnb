"use client";

import { useState } from "react";
import { copy } from "@/content/tools/guestRegister";
import { cn } from "@/lib/cn";
import { Toggle } from "../Toggle";

const C = copy.settings;
const MIN = 6;

/** Passcode lock, auto-lock, retention reminder and Clear everything. */
export function SettingsPanel({
  open,
  onToggle,
  locked,
  autoLock,
  onAutoLock,
  reminder,
  onReminder,
  onSetPasscode,
  onRemovePasscode,
  onClear,
  canSave,
}: {
  open: boolean;
  onToggle: () => void;
  locked: boolean;
  autoLock: boolean;
  onAutoLock: (v: boolean) => void;
  reminder: boolean;
  onReminder: (v: boolean) => void;
  onSetPasscode: (p: string) => Promise<void>;
  onRemovePasscode: () => void;
  onClear: () => void;
  canSave: boolean;
}) {
  const [mode, setMode] = useState<"none" | "set" | "remove" | "clear">("none");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const errA = a.length < MIN ? `Use at least ${MIN} characters.` : undefined;
  const errB = a !== b ? "The two passcodes don’t match." : undefined;

  return (
    <section aria-labelledby="settings-title" className="rounded-[20px] border border-line bg-white" id="register-settings">
      <h2 id="settings-title" className="m-0">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls="settings-body"
          className="flex min-h-16 w-full cursor-pointer items-center justify-between gap-3 border-none bg-transparent px-5 text-left text-lg font-extrabold text-ink md:px-6"
        >
          <span>
            <span aria-hidden="true">🔒 </span>
            {C.title}
            {locked && <span className="ml-2 rounded-full bg-green-100 px-2.5 py-1 text-[12px] font-extrabold text-green">Passcode on</span>}
          </span>
          <span aria-hidden="true" className={cn("text-xl transition-transform", open && "rotate-180")}>
            ⌄
          </span>
        </button>
      </h2>
      <div id="settings-body" hidden={!open} className="grid gap-5 border-t border-line px-5 pt-4 pb-5 md:px-6">
        <div className="grid gap-3">
          <h3 className="m-0 text-base font-extrabold">{C.lockTitle}</h3>
          <p className="m-0 rounded-[12px] bg-amber-25 px-4 py-3 text-sm font-semibold text-ink">{C.lockWarning}</p>
          {!canSave && <p className="m-0 text-sm text-muted">This browser isn’t saving to the device, so there’s nothing to lock.</p>}
          {canSave && mode !== "set" && mode !== "remove" && (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => (setMode("set"), setA(""), setB(""), setTried(false), setMsg(""))} className="btn btn-ink min-h-11">
                {locked ? C.change : C.set}
              </button>
              {locked && (
                <button type="button" onClick={() => setMode("remove")} className="btn btn-outline min-h-11">
                  {C.remove}
                </button>
              )}
            </div>
          )}
          {mode === "set" && (
            <form
              className="grid max-w-[420px] gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setTried(true);
                if (errA || errB) return;
                setBusy(true);
                await onSetPasscode(a);
                setBusy(false);
                setMode("none");
                setA("");
                setB("");
                setMsg("Passcode set. You’ll need it next time you open this page.");
              }}
            >
              <label className="grid gap-1.5 text-[15px] font-bold">
                {C.passcode}
                <span className="text-[13px] font-normal text-muted">{C.passcodeHint}</span>
                <input type="password" autoComplete="new-password" className="field min-h-12" value={a} onChange={(e) => setA(e.target.value)} aria-invalid={tried && errA ? true : undefined} />
                {tried && errA && <span className="text-sm font-bold text-brand">{errA}</span>}
              </label>
              <label className="grid gap-1.5 text-[15px] font-bold">
                {C.confirm}
                <input type="password" autoComplete="new-password" className="field min-h-12" value={b} onChange={(e) => setB(e.target.value)} aria-invalid={tried && errB ? true : undefined} />
                {tried && !errA && errB && <span className="text-sm font-bold text-brand">{errB}</span>}
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="submit" disabled={busy} className="btn btn-ink min-h-11">
                  {busy ? "Locking…" : locked ? "Save new passcode" : C.set}
                </button>
                <button type="button" onClick={() => setMode("none")} className="btn btn-outline min-h-11">
                  Cancel
                </button>
              </div>
            </form>
          )}
          {mode === "remove" && (
            <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-coral p-3 text-sm font-bold" role="alert">
              <span className="flex-1">{C.removeConfirm}</span>
              <button type="button" onClick={() => (onRemovePasscode(), setMode("none"), setMsg("Passcode removed."))} className="btn btn-coral min-h-11">
                Yes, remove it
              </button>
              <button type="button" onClick={() => setMode("none")} className="btn btn-outline min-h-11">
                Cancel
              </button>
            </div>
          )}
          <p aria-live="polite" className="m-0 min-h-5 text-sm font-bold text-green">
            {msg}
          </p>
          {locked && <Toggle label={C.autoLock} checked={autoLock} onChange={onAutoLock} />}
        </div>

        <Toggle label={C.retention} checked={reminder} onChange={onReminder} hint="Shows a reminder here. Nothing is ever deleted automatically." />

        <div className="border-t border-line pt-4">
          {mode === "clear" ? (
            <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-coral p-3 text-sm font-bold" role="alert">
              <span className="flex-1">{C.clearConfirm}</span>
              <button type="button" onClick={() => (onClear(), setMode("none"))} className="btn btn-coral min-h-11">
                {C.clearYes}
              </button>
              <button type="button" onClick={() => setMode("none")} className="btn btn-outline min-h-11">
                Cancel
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setMode("clear")} className="min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-brand underline underline-offset-2">
              {C.clear}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
