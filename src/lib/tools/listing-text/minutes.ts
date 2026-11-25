/**
 * Minutes phrase, shared by the photo shot list planner and the AI-ready
 * description builder: "12-minute walk to Piccadilly station". The wording
 * per mode is stored content ({n} minutes, {place}); an unknown mode falls
 * back to "walk". Returns "" if the minutes or place are missing, so a
 * caller never shows an invented fact.
 */
export function minutesPhrase(minutes: number | null | undefined, mode: string, place: string, templates: Record<string, string>): string {
  const p = place.trim();
  if (!p || !minutes || !Number.isFinite(minutes) || minutes <= 0) return "";
  const t = templates[mode] ?? templates.walk ?? "{n} minutes to {place}";
  return t.replace("{n}", String(Math.round(minutes))).replace("{place}", p);
}
