import { twMerge } from "tailwind-merge";

/**
 * Join class names, skipping falsy values. Conflicting Tailwind utilities are
 * resolved so the later one wins (e.g. cn("bg-ink", "bg-coral") → "bg-coral"),
 * which lets components accept className overrides safely.
 */
export function cn(...parts: Array<string | false | null | undefined>) {
  return twMerge(parts.filter(Boolean).join(" "));
}
