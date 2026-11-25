/**
 * Template engine shared by the builder tools (house rules, welcome guide,
 * guest messages). Templates are stored content with {variables}; the tool
 * passes the values. A missing variable leaves the template out (null), so a
 * sentence is never shown half-filled.
 */

export type Tone = "friendly" | "short";

export type Template = { key: string; friendly: string; short: string };

/** Fill {variables}. Returns null if any variable is missing or empty. */
export function renderTemplate(text: string, vars: Record<string, string | number | undefined | null>): string | null {
  let missing = false;
  const out = text.replace(/\{([A-Za-z0-9_.]+)\}/g, (_, k: string) => {
    const v = vars[k];
    if (v === undefined || v === null || String(v).trim() === "") {
      missing = true;
      return "";
    }
    return String(v);
  });
  return missing ? null : out;
}

export function templateIndex<T extends Template>(list: T[]): Map<string, T> {
  return new Map(list.map((t) => [t.key, t]));
}

/** The wording of a template for a tone. */
export const wording = (t: Template, tone: Tone) => (tone === "short" ? t.short : t.friendly);
