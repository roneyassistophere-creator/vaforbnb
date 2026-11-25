/** Score history kept on this device: the last few scores, for "+18 since your last score". */

export type HistoryEntry = { at: string; score: number; band: string; version: number };

export const HISTORY_MAX = 5;

export function addToHistory(h: HistoryEntry[], e: HistoryEntry, max = HISTORY_MAX): HistoryEntry[] {
  return [...h, e].slice(-max);
}

/** Change between the newest score and the one before it, or null. */
export function changeSinceLast(h: HistoryEntry[]): number | null {
  if (h.length < 2) return null;
  return h[h.length - 1].score - h[h.length - 2].score;
}

/** "+18 since your last score", "−4 since your last score", "No change since your last score". */
export function changeText(n: number | null): string {
  if (n === null) return "";
  if (n === 0) return "No change since your last score";
  return `${n > 0 ? "+" : "−"}${Math.abs(n)} since your last score`;
}

export function cleanHistory(x: unknown): HistoryEntry[] {
  if (!Array.isArray(x)) return [];
  return x
    .filter(
      (e): e is HistoryEntry =>
        !!e && typeof e === "object" && typeof e.at === "string" && typeof e.score === "number" && e.score >= 0 && e.score <= 100 && typeof e.band === "string" && typeof e.version === "number",
    )
    .slice(-HISTORY_MAX);
}
