"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Copies text to the clipboard. If the clipboard isn't available, shows the
 * text in a selectable box instead.
 */
export function CopyButton({
  getText,
  label,
  copiedLabel = "Copied",
  className,
  onCopied,
}: {
  getText: () => string;
  label: string;
  copiedLabel?: string;
  className?: string;
  onCopied?: () => void;
}) {
  const [state, setState] = useState<"idle" | "copied" | "fallback">("idle");
  const [text, setText] = useState("");
  const boxRef = useRef<HTMLTextAreaElement>(null);

  const copy = async () => {
    const value = getText();
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
      onCopied?.();
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setText(value);
      setState("fallback");
      requestAnimationFrame(() => boxRef.current?.select());
    }
  };

  return (
    <>
      <button type="button" onClick={copy} className={cn("btn btn-outline", className)}>
        {state === "copied" ? copiedLabel : label}
      </button>
      <span className="sr-only-label" aria-live="polite">
        {state === "copied" ? copiedLabel : ""}
      </span>
      {state === "fallback" && (
        <div className="mt-3 w-full basis-full">
          <label className="mb-1.5 block text-sm font-bold" htmlFor="copy-fallback">
            Copy didn’t work in this browser. Select the text below and copy it.
          </label>
          <textarea id="copy-fallback" ref={boxRef} readOnly value={text} rows={10} className="field min-h-[200px] w-full p-3 font-mono text-[13px]" />
        </div>
      )}
    </>
  );
}
