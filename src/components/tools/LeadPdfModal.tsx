"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";

type Copy = {
  title: string;
  intro: string;
  consent: string;
  submit: string;
  done: string;
  error: string;
};

/**
 * "Download the PDF" dialog. The PDF is made on the visitor's device.
 * If they tick the (unticked by default) consent box, only lead fields are
 * sent to /api/leads: email, first name, tool slug, consent text and time.
 */
export function LeadPdfModal({
  open,
  onClose,
  toolSlug,
  copy,
  makePdf,
}: {
  open: boolean;
  onClose: () => void;
  toolSlug: string;
  copy: Copy;
  makePdf: () => Promise<void>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const firstName = String(form.get("firstName") ?? "").trim();
    const website = String(form.get("website") ?? "");
    setStatus("busy");
    setMessage("");

    let leadFailed = false;
    if (consent && email) {
      try {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, firstName, toolSlug, consentText: copy.consent, timestamp: new Date().toISOString(), website }),
        });
        leadFailed = !res.ok;
      } catch {
        leadFailed = true;
      }
    }

    try {
      await makePdf();
      track("pdf_requested", toolSlug);
      setStatus(leadFailed ? "error" : "done");
      setMessage(leadFailed ? copy.error : copy.done);
    } catch {
      setStatus("error");
      setMessage("Sorry, the PDF couldn’t be created. Try Print instead.");
    }
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="pdf-modal-title"
      className="m-auto w-[min(520px,calc(100vw-32px))] rounded-[20px] border-none p-0 text-ink shadow-[0_24px_60px_rgba(20,33,43,0.25)] backdrop:bg-ink/60"
    >
      <form onSubmit={submit} className="grid gap-4 p-6 md:p-7" noValidate={!consent}>
        <div className="flex items-start justify-between gap-4">
          <h2 id="pdf-modal-title" className="m-0 text-[22px] font-extrabold tracking-[-0.5px]">
            {copy.title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-full border-none bg-fog text-xl">
            ×
          </button>
        </div>
        <p className="m-0 text-[15px] leading-[1.6] text-body">{copy.intro}</p>

        <label className="grid gap-1.5 text-sm font-bold">
          Email{consent ? "" : " (optional)"}
          <input name="email" type="email" autoComplete="email" required={consent} className="field" />
        </label>
        <label className="grid gap-1.5 text-sm font-bold">
          First name (optional)
          <input name="firstName" type="text" autoComplete="given-name" maxLength={80} className="field" />
        </label>
        {/* Honeypot: hidden from people, bots fill it in. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Website
            <input name="website" type="text" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-[1.5]">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-5 flex-none accent-ink" />
          <span>{copy.consent}</span>
        </label>

        <button type="submit" disabled={status === "busy"} className="btn btn-coral w-full">
          {status === "busy" ? "Creating your PDF…" : copy.submit}
        </button>
        <p className="m-0 min-h-5 text-sm font-semibold" role="status">
          <span className={status === "error" ? "text-brand" : "text-green"}>{message}</span>
        </p>
      </form>
    </dialog>
  );
}
