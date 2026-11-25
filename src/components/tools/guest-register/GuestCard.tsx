"use client";

import { useState } from "react";
import { commonNationalities } from "@/data/countries";
import { copy } from "@/content/tools/guestRegister";
import { cn } from "@/lib/cn";
import { needsExtraDetails, type Guest, type GuestErrors, type Lists } from "@/lib/tools/guest-register";
import { SearchSelect } from "../SearchSelect";

export const fieldId = (guestId: string, field: string) => `guest-${guestId}-${field}`;

function TextInput({ id, label, hint, value, onChange, error, autoComplete = "off" }: { id: string; label: string; hint?: string; value: string; onChange: (v: string) => void; error?: string; autoComplete?: string }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-[15px] font-bold text-ink">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="m-0 text-[13px] text-muted">
          {hint}
        </p>
      )}
      <input
        id={id}
        className={cn("field min-h-12", error && "border-coral")}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      />
      {error && (
        <p id={`${id}-error`} className="m-0 text-sm font-bold text-brand">
          {error}
        </p>
      )}
    </div>
  );
}

export function ExtraTag({ extra }: { extra: boolean }) {
  return (
    <span
      className={cn("inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-extrabold", extra ? "bg-amber-25 text-[#6B4A00]" : "bg-green-100 text-green")}
    >
      <span aria-hidden="true">{extra ? "!" : "✓"}</span>
      {extra ? copy.guest.extra : copy.guest.noExtra}
    </span>
  );
}

/** One adult guest. Extra fields appear only when their nationality needs them. */
export function GuestCard({
  guest,
  index,
  total,
  lists,
  errors,
  showErrors,
  onChange,
  onRemove,
  canRemove,
}: {
  guest: Guest;
  index: number;
  total: number;
  lists: Lists;
  errors: GuestErrors;
  showErrors: boolean;
  onChange: (g: Guest) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const G = copy.guest;
  const [second, setSecond] = useState(!!guest.nationality2);
  const [confirm, setConfirm] = useState(false);
  const extra = needsExtraDetails([guest.nationality, guest.nationality2], lists);
  const e = showErrors ? errors : {};
  const set = (patch: Partial<Guest>) => onChange({ ...guest, ...patch });
  const id = (f: string) => fieldId(guest.id, f);
  const labels: Record<string, string> = { idNumber: G.idNumber, placeOfIssue: G.placeOfIssue, nextDestination: G.nextDestination, nextAddress: G.nextAddress.replace(" (optional)", "") };
  const fieldLabel = (k: string) => `${labels[k]}${lists.extraFields.find((f) => f.key === k)?.required === false ? " (optional)" : ""}`;

  return (
    <section aria-labelledby={id("title")} className="rounded-[18px] border border-line bg-white p-4 md:p-5" data-guest-card>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 id={id("title")} className="m-0 text-[17px] font-extrabold">
          {G.heading.replace("{n}", String(index + 1)).replace("{total}", String(total))}
        </h3>
        {extra !== null && <ExtraTag extra={extra} />}
      </div>

      <div className="grid gap-4">
        <TextInput id={id("fullName")} label={G.fullName} value={guest.fullName} onChange={(v) => set({ fullName: v })} error={e.fullName} />
        <SearchSelect
          id={id("nationality")}
          label={G.nationality}
          options={lists.countries}
          common={commonNationalities}
          value={guest.nationality}
          onChange={(v) => set({ nationality: v, placeOfIssue: guest.placeOfIssue || (v && v !== "STATELESS" && v !== "UNKNOWN" && needsExtraDetails([v, guest.nationality2], lists) ? v : undefined) })}
          error={e.nationality}
        />
        {second ? (
          <div className="grid gap-1">
            <SearchSelect id={id("nationality2")} label={G.nationality2} options={lists.countries} common={commonNationalities} value={guest.nationality2 ?? ""} onChange={(v) => set({ nationality2: v || undefined })} />
            <button type="button" onClick={() => (setSecond(false), set({ nationality2: undefined }))} className="min-h-11 cursor-pointer justify-self-start border-none bg-transparent p-0 text-sm font-bold text-ink underline underline-offset-2">
              {G.removeSecond}
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setSecond(true)} className="min-h-11 cursor-pointer justify-self-start border-none bg-transparent p-0 text-sm font-bold text-ink underline underline-offset-2">
            + {G.addSecond}
          </button>
        )}

        <div className={cn("grid transition-[grid-template-rows] duration-300 ease-out", extra ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <div className="overflow-hidden">
            {extra && (
              <div className="grid gap-4 rounded-[14px] border border-dashed border-[#C68A00] bg-amber-25/50 p-4">
                <p className="m-0 text-sm text-ink-copy">This guest isn’t a British, Irish or Commonwealth citizen, so the law asks for a few more details.</p>
                {lists.extraFields.map(({ key }) =>
                  key === "placeOfIssue" ? (
                    <SearchSelect
                      key={key}
                      id={id(key)}
                      label={fieldLabel(key)}
                      options={lists.countries}
                      common={[guest.nationality, ...commonNationalities].filter(Boolean)}
                      value={guest.placeOfIssue ?? ""}
                      onChange={(v) => set({ placeOfIssue: v || undefined })}
                      error={e.placeOfIssue}
                    />
                  ) : (
                    <TextInput
                      key={key}
                      id={id(key)}
                      label={fieldLabel(key)}
                      hint={key === "nextDestination" ? G.nextDestinationHint : key === "nextAddress" ? G.nextAddressHint : undefined}
                      value={guest[key] ?? ""}
                      onChange={(v) => set({ [key]: v || undefined })}
                      error={e[key]}
                    />
                  ),
                )}
              </div>
            )}
          </div>
        </div>

        {canRemove &&
          (confirm ? (
            <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-coral p-3 text-sm font-bold" role="alert">
              <span className="flex-1">Remove {guest.fullName.trim() || `guest ${index + 1}`}?</span>
              <button type="button" onClick={() => (setConfirm(false), onRemove())} className="btn btn-coral min-h-11">
                Yes, remove
              </button>
              <button type="button" onClick={() => setConfirm(false)} className="btn btn-outline min-h-11">
                Cancel
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirm(true)} className="min-h-11 cursor-pointer justify-self-start border-none bg-transparent p-0 text-sm font-bold text-brand underline underline-offset-2">
              {G.remove}
            </button>
          ))}
      </div>
    </section>
  );
}
