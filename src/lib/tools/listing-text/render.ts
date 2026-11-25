/**
 * Template rendering shared by the photo shot list planner and the AI-ready
 * description builder. {token} is replaced with a fact; text in [square
 * brackets] is dropped when any token inside it is empty, so a missing fact
 * drops only its own part. An empty token outside brackets makes the whole
 * result "" (the caller leaves the sentence out). Never adds anything that
 * isn't in `vars`.
 */
export function renderTemplate(template: string, vars: Record<string, string>): string {
  const val = (k: string) => (vars[k] ?? "").trim();
  let missingRequired = false;
  const withGroups = template.replace(/\[([^\]]*)\]/g, (_, inner: string) => {
    const keys = [...inner.matchAll(/\{([A-Za-z0-9]+)\}/g)].map((m) => m[1]);
    return keys.every((k) => val(k)) ? inner.replace(/\{([A-Za-z0-9]+)\}/g, (_m, k: string) => val(k)) : "";
  });
  const out = withGroups.replace(/\{([A-Za-z0-9]+)\}/g, (_m, k: string) => {
    if (!val(k)) missingRequired = true;
    return val(k);
  });
  return missingRequired ? "" : out.replace(/\s{2,}/g, " ").replace(/\s+([,.:)])/g, "$1").trim();
}

/** Lists join with commas and "and" (no Oxford comma): "A and B", "A, B and C". */
export function joinList(items: string[]): string {
  const xs = items.map((x) => x.trim()).filter(Boolean);
  return xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
}

export const capitaliseFirst = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
