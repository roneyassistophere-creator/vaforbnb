"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { autoLockMinutes, copy, storageKey, toolSlug } from "@/content/tools/guestRegister";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { formatMedium } from "@/lib/tools/dates";
import { deviceStorage } from "@/lib/tools/deviceStorage";
import { downloadText } from "@/lib/tools/download";
import { londonToday, type Figures } from "@/lib/tools/figures";
import {
  buildCsv,
  buildPrintable,
  cleanData,
  deletePastRetention,
  emptyData,
  withExample,
  withoutExample,
  newId,
  newStay,
  readLists,
  registerFileName,
  restoreStays,
  saveStay,
  savedMessage,
  whatThisMeans,
  type Data,
  type Draft,
  type Stay,
} from "@/lib/tools/guest-register";
import { printHtml } from "@/lib/tools/printable";
import { isSealed, newVaultKey, seal, unseal, WrongPasscodeError, type Sealed, type VaultKey } from "@/lib/tools/vault";
import { MessageTab } from "./MessageTab";
import { RecordStay } from "./RecordStay";
import { RegisterList, type Filters } from "./RegisterList";
import { useRegisterResult } from "./ResultContext";
import { SettingsPanel } from "./SettingsPanel";
import { TemplatesTab } from "./TemplatesTab";

type Tab = "record" | "templates" | "message";
const TABS: Tab[] = ["record", "templates", "message"];
const META_KEY = `${storageKey}:meta`;
type Meta = { autoLock: boolean };

/** Saved form: `{ plain: data }`, or sealed (encrypted) when a passcode is set. */
type Saved = { plain: Data } | Sealed;

export function GuestRegisterTool({ figures }: { figures: Figures }) {
  const lists = useMemo(() => readLists(figures), [figures]);
  const [phase, setPhase] = useState<"loading" | "locked" | "open">("loading");
  const [data, setData] = useState<Data>(emptyData);
  const [vault, setVault] = useState<VaultKey | null>(null);
  const [meta, setMeta] = useState<Meta>({ autoLock: true });
  const [today, setToday] = useState("");
  const [tab, setTab] = useState<Tab>("record");
  const [saveFailed, setSaveFailed] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [sharedNotice, setSharedNotice] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [undoStays, setUndoStays] = useState<Stay[] | null>(null);
  const [passcode, setPasscode] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const saveSeq = useRef(0);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { setText } = useRegisterResult();

  /* ---- Load (this device only) ---- */
  useEffect(() => {
    track("tool_opened", toolSlug);
    const raw = deviceStorage.read<Saved>(storageKey);
    const m = deviceStorage.read<Meta>(META_KEY);
    let t: Tab = "record";
    try {
      const q = new URLSearchParams(window.location.search).get("tab");
      if (TABS.includes(q as Tab)) t = q as Tab;
    } catch {
      // ignore
    }
    // Restoring once after hydration: the server render has no storage, URL or "today".
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(londonToday());
    setTab(t);
    if (m) setMeta({ autoLock: m.autoLock !== false });
    if (isSealed(raw)) setPhase("locked");
    else {
      setData(cleanData(raw && "plain" in raw ? raw.plain : null) ?? emptyData());
      setPhase("open");
    }
    setSaveFailed(!deviceStorage.write(META_KEY, m ?? { autoLock: true }));
  }, []);

  /* ---- Save (encrypted when a passcode is set) ---- */
  const persist = useCallback(async (d: Data, key: VaultKey | null) => {
    const seq = ++saveSeq.current;
    const value: Saved = key ? await seal(d, key) : { plain: d };
    if (seq !== saveSeq.current) return; // a newer save is on its way
    setSaveFailed(!deviceStorage.write(storageKey, value));
  }, []);

  useEffect(() => {
    if (phase !== "open") return;
    const t = setTimeout(() => {
      void persist(data, vault);
      if (data.draft) {
        setDraftSaved(true);
        clearTimeout(flashTimer.current);
        flashTimer.current = setTimeout(() => setDraftSaved(false), 1600);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [data, vault, phase, persist]);

  // Closing the tab: save right away so a half-filled stay isn't lost (no passcode: a plain,
  // synchronous write; with a passcode the 300 ms save above has normally finished).
  const latest = useRef({ data, vault, phase });
  useEffect(() => {
    latest.current = { data, vault, phase };
  });
  useEffect(() => {
    const flush = () => {
      const l = latest.current;
      if (l.phase === "open" && !l.vault) deviceStorage.write(storageKey, { plain: l.data });
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, []);

  useEffect(() => {
    if (phase === "open" && today) setText(whatThisMeans(data.stays, lists, figures, today));
  }, [data.stays, lists, figures, today, phase, setText]);

  /* ---- Auto-lock after inactivity ---- */
  const lockNow = useCallback(async () => {
    if (!vault) return;
    await persist(data, vault);
    setData(emptyData());
    setVault(null);
    setPasscode("");
    setPhase("locked");
  }, [vault, data, persist]);

  useEffect(() => {
    if (phase !== "open" || !vault || !meta.autoLock) return;
    let timer = setTimeout(lockNow, autoLockMinutes * 60_000);
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(lockNow, autoLockMinutes * 60_000);
    };
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [phase, vault, meta.autoLock, lockNow]);

  useEffect(() => () => (clearTimeout(undoTimer.current), clearTimeout(flashTimer.current)), []);

  /* ---- Tabs (the URL remembers the tab) ---- */
  const pickTab = (t: Tab) => {
    setTab(t);
    try {
      const url = new URL(window.location.href);
      if (t === "record") url.searchParams.delete("tab");
      else url.searchParams.set("tab", t);
      window.history.replaceState(null, "", url);
    } catch {
      // ignore
    }
  };

  /* ---- Derived ---- */
  const draft: Draft = data.draft ?? { step: 1, stay: newStay(data.lastPropertyId, today), editingId: null };
  const setDraft = (d: Draft) => setData((x) => ({ ...x, draft: d }));
  const propName = (id: string) => data.properties.find((p) => p.id === id)?.name ?? "Deleted property";
  const lastPropertyName = propName(data.lastPropertyId);

  /* ---- Actions ---- */
  const save = (andAnother: boolean) => {
    const { data: next, saved } = saveStay(data, draft.stay, draft.editingId);
    const fresh: Draft | null = andAnother ? { step: 1, stay: newStay(saved.propertyId, today), editingId: null } : null;
    const firstSave = !data.settings.sharedNoticeShown;
    setData({ ...next, draft: fresh, settings: { ...next.settings, sharedNoticeShown: true } });
    setSavedMsg(draft.editingId ? `Updated: ${savedMessage(saved).replace(/^Saved: /, "")}` : savedMessage(saved));
    if (firstSave) setSharedNotice(true);
    track("stay_saved", toolSlug, { count: saved.guests.length });
    requestAnimationFrame(() => {
      if (andAnother) document.getElementById("stay-reference")?.focus();
      else document.getElementById("save-confirmation")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const openStay = (s: Stay) => {
    setData((x) => ({ ...x, draft: { step: 3, stay: s, editingId: s.id } }));
    setSavedMsg("");
    pickTab("record");
    requestAnimationFrame(() => document.getElementById("register-tool")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const csvFor = (stays: Stay[], propertyId: string | null) => {
    downloadText(registerFileName(propertyId ? propName(propertyId) : null, today), buildCsv(stays, lists, propName), "text/csv");
  };
  const printFor = (stays: Stay[], f?: Filters) => {
    const sorted = [...stays].sort((a, b) => (a.arrival < b.arrival ? -1 : 1));
    const range = sorted.length ? `${formatMedium(sorted[0].arrival)} – ${formatMedium(sorted[sorted.length - 1].arrival)}` : "";
    const props = f?.propertyId ? propName(f.propertyId) : [...new Set(stays.map((s) => propName(s.propertyId)))].join(", ");
    printHtml(buildPrintable(sorted, lists, propName, { title: "Guest register", subtitle: [props, range].filter(Boolean).join(" · ") }));
  };

  const deletePast = () => {
    const { data: next, removed } = deletePastRetention(data, figures, today);
    setData(next);
    setUndoStays(removed);
    track("retention_deleted", toolSlug, { count: removed.length });
    clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndoStays(null), 10_000);
  };

  const hasExample = data.stays.some((s) => s.example) || !!data.draft?.stay.example;
  const tryExample = () => {
    setData((x) => withExample(x, today));
    setSavedMsg("");
    pickTab("record");
  };
  const clearExample = () => {
    setData(withoutExample);
    setSavedMsg("");
  };

  const clearEverything = () => {
    deviceStorage.remove(storageKey);
    deviceStorage.remove(META_KEY);
    setData(emptyData());
    setVault(null);
    setMeta({ autoLock: true });
    setSavedMsg("");
    setUndoStays(null);
    setConfirmReset(false);
    setPhase("open");
  };

  const unlock = async () => {
    const raw = deviceStorage.read<Saved>(storageKey);
    if (!isSealed(raw)) return setPhase("open");
    setUnlocking(true);
    try {
      const { value, key } = await unseal<Data>(raw, passcode);
      setData(cleanData(value) ?? emptyData());
      setVault(key);
      setPasscode("");
      setUnlockError("");
      setPhase("open");
    } catch (e) {
      setUnlockError(e instanceof WrongPasscodeError ? copy.unlock.wrong : "Couldn’t open the register.");
    } finally {
      setUnlocking(false);
    }
  };

  /* ---- Screens ---- */
  const privacyBanner = (
    <p className="m-0 mb-5 flex items-center gap-3 rounded-[14px] border border-green/20 bg-green-100 px-4 py-3 text-[15px] font-bold text-green" role="note">
      <span aria-hidden="true" className="text-lg">
        🔒
      </span>
      {copy.privacy}
    </p>
  );

  if (phase === "loading" || !today) {
    return (
      <div data-tool={toolSlug}>
        {privacyBanner}
        <div className="h-[420px] animate-pulse rounded-[20px] border border-line bg-white" aria-busy="true" aria-label="Loading the guest register" />
      </div>
    );
  }

  if (phase === "locked") {
    const U = copy.unlock;
    return (
      <div data-tool={toolSlug} data-ready="">
        {privacyBanner}
        <form
          className="mx-auto grid max-w-[440px] gap-4 rounded-[20px] border border-line bg-white p-6"
          onSubmit={(e) => {
            e.preventDefault();
            void unlock();
          }}
        >
          <h2 className="m-0 text-xl font-extrabold">🔒 {U.title}</h2>
          <p className="m-0 text-[15px] text-ink-copy">{U.text}</p>
          <label className="grid gap-1.5 text-[15px] font-bold">
            {U.label}
            <input type="password" autoFocus autoComplete="current-password" className="field min-h-12" value={passcode} onChange={(e) => setPasscode(e.target.value)} aria-invalid={unlockError ? true : undefined} />
          </label>
          {unlockError && (
            <p className="m-0 text-sm font-bold text-brand" role="alert">
              {unlockError}
            </p>
          )}
          <button type="submit" disabled={unlocking || !passcode} className="btn btn-ink min-h-12">
            {unlocking ? "Opening…" : U.button}
          </button>
          <p className="m-0 text-[13px] text-muted">{U.forgot}</p>
          {confirmReset ? (
            <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-coral p-3 text-sm font-bold" role="alert">
              <span className="flex-1">{copy.settings.clearConfirm}</span>
              <button type="button" onClick={clearEverything} className="btn btn-coral min-h-11">
                {copy.settings.clearYes}
              </button>
              <button type="button" onClick={() => setConfirmReset(false)} className="btn btn-outline min-h-11">
                Cancel
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmReset(true)} className="min-h-11 cursor-pointer justify-self-start border-none bg-transparent p-0 text-sm font-bold text-brand underline underline-offset-2">
              {copy.settings.clear}
            </button>
          )}
        </form>
      </div>
    );
  }

  const saved = savedMsg && (
    <div id="save-confirmation" className="grid gap-2 rounded-[16px] border border-green/30 bg-green-100 p-4" role="status">
      <p className="m-0 text-[15px] font-extrabold text-green">✓ {savedMsg}</p>
      {sharedNotice && (
        <p className="m-0 text-sm text-ink">
          {copy.review.sharedNotice}{" "}
          <button
            type="button"
            onClick={() => (setSettingsOpen(true), requestAnimationFrame(() => document.getElementById("register-settings")?.scrollIntoView({ behavior: "smooth" })))}
            className="min-h-9 cursor-pointer border-none bg-transparent p-0 font-bold text-ink underline underline-offset-2"
          >
            Set a passcode
          </button>
        </p>
      )}
    </div>
  );

  return (
    <div data-tool={toolSlug} data-ready="" id="register-tool" className="scroll-mt-6">
      {privacyBanner}
      {saveFailed && (
        <p className="m-0 mb-5 rounded-[12px] bg-coral-50 px-4 py-3 text-sm font-bold text-brand" role="alert">
          {copy.storageFailed}
        </p>
      )}

      {/* Example: a sample register and a filled-in stay, clearly labelled */}
      {hasExample ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-[#E0A800] bg-amber-25 px-4 py-3" role="status">
          <p className="m-0 text-[15px] font-bold text-ink">{copy.example.banner}</p>
          <button type="button" onClick={clearExample} className="btn btn-outline min-h-11 bg-white">
            {copy.example.clear}
          </button>
        </div>
      ) : (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-line bg-white px-4 py-3">
          <p className="m-0 text-[15px] text-ink-copy">
            <strong className="text-ink">{copy.example.title}</strong> {copy.example.text}
          </p>
          <button type="button" onClick={tryExample} className="btn btn-ink min-h-11">
            {copy.example.button}
          </button>
        </div>
      )}

      {data.stays.length > 0 && (
        <div className="mb-6">
          <RegisterList
            stays={data.stays}
            properties={data.properties}
            lists={lists}
            figures={figures}
            today={today}
            reminder={data.settings.retentionReminder}
            onOpen={openStay}
            onCsv={(s, f) => csvFor(s, f.propertyId || null)}
            onPrint={printFor}
            onDeletePast={deletePast}
            undoCount={undoStays?.length ?? 0}
            onUndo={() => (undoStays && setData((x) => restoreStays(x, undoStays)), setUndoStays(null))}
          />
        </div>
      )}

      {/* Tabs */}
      <div role="tablist" aria-label="Guest register tools" className="mb-5 grid grid-cols-3 gap-1.5 rounded-[18px] bg-fog p-1.5">
        {TABS.map((t, i) => (
          <button
            key={t}
            id={`tab-${t}`}
            type="button"
            role="tab"
            aria-selected={tab === t}
            aria-controls={`panel-${t}`}
            tabIndex={tab === t ? 0 : -1}
            onClick={() => pickTab(t)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              const n = TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
              pickTab(n);
              document.getElementById(`tab-${n}`)?.focus();
            }}
            className={cn(
              "min-h-14 cursor-pointer rounded-[14px] border-none px-2 text-[14px] leading-tight font-extrabold md:text-[15px]",
              tab === t ? "bg-white text-ink shadow-[0_2px_8px_rgba(20,33,43,0.1)]" : "bg-transparent text-ink-copy hover:text-ink",
            )}
          >
            {copy.tabs[t]}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "record" && (
          <RecordStay
            draft={draft}
            setDraft={setDraft}
            lists={lists}
            figures={figures}
            properties={data.properties}
            onSelectProperty={(id) => setData((x) => ({ ...x, lastPropertyId: id, draft: { ...draft, stay: { ...draft.stay, propertyId: id } } }))}
            onAddProperty={(name) => {
              const id = newId("p");
              const clean = name.trim().slice(0, 60) || `Property ${data.properties.length + 1}`;
              setData((x) => ({ ...x, properties: [...x.properties, { id, name: clean }], lastPropertyId: id, draft: { ...draft, stay: { ...draft.stay, propertyId: id } } }));
            }}
            onRenameProperty={(name) =>
              setData((x) => ({ ...x, properties: x.properties.map((p) => (p.id === draft.stay.propertyId ? { ...p, name: name.trim().slice(0, 60) || p.name } : p)) }))
            }
            onDeleteProperty={() =>
              setData((x) => {
                const rest = x.properties.filter((p) => p.id !== draft.stay.propertyId);
                const properties = rest.length ? rest : [{ id: newId("p"), name: "My property" }];
                return { ...x, properties, lastPropertyId: properties[0].id, draft: { ...draft, stay: { ...draft.stay, propertyId: properties[0].id } } };
              })
            }
            onSave={save}
            onDelete={() => (setData((x) => ({ ...x, stays: x.stays.filter((s) => s.id !== draft.editingId), draft: null })), setSavedMsg("Stay deleted."))}
            onPrint={() => printFor([draft.stay])}
            onCsv={() => csvFor([draft.stay], draft.stay.propertyId)}
            onStartOver={() => (setData((x) => ({ ...x, draft: null })), setSavedMsg(""))}
            saved={saved}
            draftSaved={draftSaved}
          />
        )}
        {tab === "templates" && <TemplatesTab lists={lists} defaultProperty={lastPropertyName} />}
        {tab === "message" && <MessageTab lists={lists} defaultProperty={lastPropertyName} />}
      </div>

      <div className="mt-6">
        <SettingsPanel
          open={settingsOpen}
          onToggle={() => setSettingsOpen((o) => !o)}
          locked={!!vault}
          autoLock={meta.autoLock}
          onAutoLock={(v) => {
            setMeta({ autoLock: v });
            deviceStorage.write(META_KEY, { autoLock: v });
          }}
          reminder={data.settings.retentionReminder}
          onReminder={(v) => setData((x) => ({ ...x, settings: { ...x.settings, retentionReminder: v } }))}
          onSetPasscode={async (p) => {
            const key = await newVaultKey(p);
            setVault(key);
            await persist(data, key);
          }}
          onRemovePasscode={() => {
            setVault(null);
            void persist(data, null);
          }}
          onClear={clearEverything}
          canSave={!saveFailed}
        />
      </div>
    </div>
  );
}
