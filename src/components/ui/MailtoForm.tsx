"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { brand } from "@/config/brand";

type Field = { name: string; label: string; type: "email" | "text" | "textarea"; required?: boolean; placeholder?: string };

type Props = {
  /** Email subject line. */
  subject: string;
  fields: Field[];
  /** Optional consent checkbox text; when set, it must be ticked. */
  consent?: string;
  submitLabel: string;
  submitClassName?: string;
  className?: string;
  fieldClassName?: string;
  labelClassName?: string;
  heading?: ReactNode;
  ariaLabel: string;
  /** Keep field labels for screen readers only. */
  hideLabels?: boolean;
};

/**
 * Form that opens the visitor's email app with the message pre-filled.
 * There's no backend yet; swap `handleSubmit` for a fetch() to a form service
 * (or a Next.js route handler) when one is set up.
 */
export function MailtoForm({
  subject,
  fields,
  consent,
  submitLabel,
  submitClassName = "btn btn-ink self-start",
  className,
  fieldClassName = "field",
  labelClassName = "grid gap-1.5 text-sm font-bold",
  heading,
  ariaLabel,
  hideLabels = false,
}: Props) {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const body = fields.map((f) => `${f.label}: ${data.get(f.name) ?? ""}`).join("\n");
    window.location.href = `mailto:${brand.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <form className={className} aria-label={ariaLabel} onSubmit={handleSubmit}>
      {heading}
      {fields.map((f) => (
        <label key={f.name} className={labelClassName}>
          <span className={hideLabels ? "sr-only-label" : undefined}>{f.label}</span>
          {f.type === "textarea" ? (
            <textarea
              name={f.name}
              rows={3}
              required={f.required}
              placeholder={f.placeholder}
              className={`${fieldClassName} resize-y py-3`}
            />
          ) : (
            <input name={f.name} type={f.type} required={f.required} placeholder={f.placeholder} className={fieldClassName} />
          )}
        </label>
      ))}
      {consent && (
        <label className="flex items-start gap-2.5 text-[13px] leading-normal text-ink-copy">
          <input type="checkbox" required className="m-0 size-5 flex-none" />
          {consent}
        </label>
      )}
      <button type="submit" className={submitClassName}>
        {submitLabel}
      </button>
      {sent && (
        <p className="m-0 text-[13px] text-muted" role="status">
          Your email app should open. If not, email us at {brand.contact.email}.
        </p>
      )}
    </form>
  );
}
