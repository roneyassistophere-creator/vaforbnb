/**
 * "Send to another tool": a small, versioned format saved on the visitor's
 * device, so one free tool can pass its output to another (house rules →
 * welcome guide, for example). Nothing leaves the device.
 */

export type HandoffSection = { key: string; heading: string; lines: string[] };

export type Handoff<T = { sections: HandoffSection[] }> = {
  format: "vaforbnb-handoff";
  version: 1;
  /** What it is, e.g. "house-rules". */
  kind: string;
  /** The tool that made it. */
  source: string;
  /** ISO date-time. */
  createdAt: string;
  data: T;
};

export const handoffKey = (kind: string) => `vaforbnb:handoff:${kind}`;

export function makeHandoff<T>(kind: string, source: string, data: T, now: Date = new Date()): Handoff<T> {
  return { format: "vaforbnb-handoff", version: 1, kind, source, createdAt: now.toISOString(), data };
}

/** Read a hand-off back, or null if it's missing, the wrong kind or malformed. */
export function parseHandoff(x: unknown, kind: string): Handoff | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Partial<Handoff>;
  if (o.format !== "vaforbnb-handoff" || o.version !== 1 || o.kind !== kind || !o.data || typeof o.data !== "object") return null;
  const sections = (o.data as { sections?: unknown }).sections;
  if (!Array.isArray(sections)) return null;
  const clean: HandoffSection[] = [];
  for (const s of sections) {
    if (!s || typeof s !== "object") continue;
    const { key, heading, lines } = s as HandoffSection;
    if (typeof key !== "string" || typeof heading !== "string" || !Array.isArray(lines)) continue;
    clean.push({ key, heading, lines: lines.filter((l): l is string => typeof l === "string").slice(0, 100) });
  }
  return { format: "vaforbnb-handoff", version: 1, kind, source: String(o.source ?? ""), createdAt: String(o.createdAt ?? ""), data: { sections: clean } };
}

/** Save for another tool (browser). Returns false if storage isn't available. */
export function writeHandoff(h: Handoff<unknown>): boolean {
  try {
    window.localStorage.setItem(handoffKey(h.kind), JSON.stringify(h));
    return true;
  } catch {
    return false;
  }
}

/** Read what another tool saved (browser). The Welcome guide builder uses readHandoff("house-rules"). */
export function readHandoff(kind: string): Handoff | null {
  try {
    const raw = window.localStorage.getItem(handoffKey(kind));
    return raw ? parseHandoff(JSON.parse(raw), kind) : null;
  } catch {
    return null;
  }
}

/** Read a hand-off whose data isn't sections (e.g. "listing-text"): `check` validates the data. */
export function readHandoffData<T>(kind: string, check: (data: unknown) => T | null): Handoff<T> | null {
  try {
    const raw = window.localStorage.getItem(handoffKey(kind));
    const o = raw ? (JSON.parse(raw) as Partial<Handoff<unknown>>) : null;
    if (!o || o.format !== "vaforbnb-handoff" || o.version !== 1 || o.kind !== kind) return null;
    const data = check(o.data);
    return data === null ? null : { format: "vaforbnb-handoff", version: 1, kind, source: String(o.source ?? ""), createdAt: String(o.createdAt ?? ""), data };
  } catch {
    return null;
  }
}
