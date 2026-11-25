"use client";

import { useState } from "react";
import { copy, toolSlug } from "@/content/tools/guestRegister";
import { track } from "@/lib/analytics";
import { guestMessage, type Channel, type Lists, type Tone } from "@/lib/tools/guest-register";
import { CopyButton } from "../CopyButton";

const chip =
  "flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-line px-4 text-sm font-semibold has-checked:border-ink has-checked:bg-sand has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink";

/** Tab 3: a ready message asking guests for exactly what's needed. */
export function MessageTab({ lists, defaultProperty }: { lists: Lists; defaultProperty: string }) {
  const M = copy.message;
  const [guestName, setGuestName] = useState("");
  const [host, setHost] = useState("");
  const [property, setProperty] = useState(defaultProperty === "My property" ? "" : defaultProperty);
  const [tone, setTone] = useState<Tone>("friendly");
  const [channel, setChannel] = useState<Channel>("airbnb");
  const text = guestMessage({ guestName, property, host, tone, channel }, lists);
  const field = (id: string, label: string, value: string, set: (v: string) => void) => (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-[15px] font-bold">
        {label}
      </label>
      <input id={id} className="field min-h-12" value={value} maxLength={60} autoComplete="off" onChange={(e) => set(e.target.value)} />
    </div>
  );

  return (
    <div className="grid gap-5 rounded-[20px] border border-line bg-white p-5 md:grid-cols-2 md:p-6">
      <div className="grid content-start gap-4">
        {field("msg-guest", M.guestName, guestName, setGuestName)}
        {field("msg-host", M.host, host, setHost)}
        {field("msg-property", M.property, property, setProperty)}
        <fieldset className="m-0 min-w-0 border-none p-0">
          <legend className="mb-2 p-0 text-[15px] font-bold">{M.tone}</legend>
          <div className="flex flex-wrap gap-2">
            {(["friendly", "short"] as const).map((v) => (
              <label key={v} className={chip}>
                <input type="radio" name="msg-tone" checked={tone === v} onChange={() => setTone(v)} className="size-4 accent-ink" />
                {M[v]}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="m-0 min-w-0 border-none p-0">
          <legend className="mb-2 p-0 text-[15px] font-bold">{M.channel}</legend>
          <div className="flex flex-wrap gap-2">
            {(["airbnb", "whatsapp", "email"] as const).map((v) => (
              <label key={v} className={chip}>
                <input type="radio" name="msg-channel" checked={channel === v} onChange={() => setChannel(v)} className="size-4 accent-ink" />
                {M[v]}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="grid content-start gap-3">
        <p className="m-0 text-[15px] font-bold" id="msg-preview-label">
          Your message
        </p>
        <div aria-labelledby="msg-preview-label" aria-live="polite" className="rounded-[16px] bg-sand p-4 text-[15px] leading-[1.6] whitespace-pre-wrap text-ink" data-message>
          {text}
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton
            label={M.copy}
            copiedLabel={M.copied}
            className="min-h-11"
            getText={() => {
              track("message_copied", toolSlug);
              return text;
            }}
          />
        </div>
        <p className="m-0 rounded-[12px] bg-coral-50 px-4 py-3 text-sm font-semibold text-ink">💡 {M.tip}</p>
      </div>
    </div>
  );
}
