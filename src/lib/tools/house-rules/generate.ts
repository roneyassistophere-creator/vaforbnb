import { formatTime, joinList, lowerFirst, numberWord } from "../format";
import { makeHandoff, type Handoff, type HandoffSection } from "../handoff";
import { renderTemplate, wording } from "../templates";
import type { Answers } from "./answers";
import { checkText, isExcluded, type Content, type Warning } from "./checker";

export type Line = {
  /** Template key, or "extra-0" etc. */
  key: string;
  text: string;
  locked: boolean;
  /** Included in the listing version. */
  listing: boolean;
  sign?: number;
  icon?: string;
};

type Ordered = Line & { order: number };

export type RuleSectionOut = { key: string; heading: string; lines: Line[] };

export type Rules = {
  title: string;
  sections: RuleSectionOut[];
  warnings: Warning[];
  /** "Show this fee in your listing…" notes, by answer. */
  notes: { source: "lateCheckout" | "petFee"; text: string }[];
  lineCount: number;
  /** Structured highlights for other tools (the AI-ready description builder's "Other things to note"). The parties rule is always included. */
  highlights: { checkin: string; checkout: string; pets: Answers["pets"]; maxPets: number | null; parties: boolean };
};

/** Which templates apply to these answers (keys), plus host text that becomes rules. */
function chosenKeys(a: Answers): string[] {
  const k: string[] = ["checkin"];
  if (a.selfCheckIn) k.push("selfCheckin");
  k.push("checkout", `lateCheckout.${a.lateCheckout}`, "maxGuests", `visitors.${a.visitors}`, `children.${a.children}`);
  k.push(`pets.${a.pets}`);
  if (a.pets === "yes" && a.petFee) k.push("petFee");
  if (a.pets !== "no") k.push("assistanceDogs"); // pets.no already says assistance dogs are welcome
  k.push("quiet", "parties", `smoking.${a.smoking}`);
  if (a.noFlames) k.push("noFlames");
  if (a.home.alarms) k.push("alarms");
  if (a.parking.trim()) k.push("parking");
  if (a.rubbish.trim()) k.push("rubbish");
  if (a.collectionDay.trim()) k.push("collectionDay");
  for (const [key, on] of Object.entries(a.home)) if (on && key !== "alarms") k.push(`home.${key}`);
  if (a.checkoutTasks.some((t) => t.trim())) k.push("tasks");
  if (a.cameras && a.cameraLocations.some((l) => l.trim())) k.push("cameras.outdoor");
  if (a.noiseMonitor) k.push("noiseMonitor");
  k.push("help");
  if (a.contactHours.trim()) k.push("contactHours");
  return k;
}

/** Turn answers into rules: fixed section order, stored wording, locked rules always in, unfair host text flagged. */
export function buildRules(a: Answers, content: Content): Rules {
  const friendly = a.tone === "friendly";
  const n = (x: number) => (friendly ? numberWord(x) : String(x));

  // Check host-written text first: red warnings leave that text out.
  const warnings: Warning[] = [];
  warnings.push(...checkText(a.parking, "parking", content), ...checkText(a.rubbish, "rubbish", content), ...checkText(a.smokingArea, "smokingArea", content));
  a.checkoutTasks.forEach((t, i) => warnings.push(...checkText(t, `task-${i}`, content)));
  a.extraRules.forEach((r, i) => warnings.push(...checkText(r, `extra-${i}`, content, true)));
  if (a.checkoutTasks.filter((t) => t.trim()).length > content.limits.maxTasks) {
    warnings.push({ source: "tasks", type: "tooManyTasks", level: "amber", ...content.limits.tooManyTasks });
  }

  const tasks = a.checkoutTasks.filter((t, i) => t.trim() && !isExcluded(warnings, `task-${i}`)).map(lowerFirst);
  const vars: Record<string, string> = {
    checkinTime: formatTime(a.checkin),
    checkoutTime: formatTime(a.checkout),
    maxGuests: n(a.maxGuests),
    childAge: n(a.childAge),
    maxPets: n(a.maxPets),
    quietFrom: formatTime(a.quietFrom),
    quietTo: formatTime(a.quietTo),
    smokingArea: isExcluded(warnings, "smokingArea") ? "" : a.smokingArea.trim() || "the garden",
    parking: isExcluded(warnings, "parking") ? "" : a.parking.trim(),
    rubbish: isExcluded(warnings, "rubbish") ? "" : a.rubbish.trim(),
    collectionDay: a.collectionDay.trim(),
    tasks: joinList(tasks),
    cameraLocations: joinList(a.cameraLocations.map((l) => lowerFirst(l.trim()))),
    recording: a.recording === "videoSound" ? "video and sound" : "video only",
    contactHours: a.contactHours.trim(),
  };

  const byKey = new Map(content.templates.map((t) => [t.key, t]));
  const keys = new Set(chosenKeys(a));
  // Locked rules are always in (except the assistance-dogs line when pets.no already says it).
  for (const t of content.templates) if (t.locked && !(t.key === "assistanceDogs" && a.pets === "no" && byKey.has("pets.no"))) keys.add(t.key);

  const lines = new Map<string, Ordered[]>();
  for (const key of keys) {
    const t = byKey.get(key);
    if (!t) continue;
    const text = renderTemplate(wording(t, a.tone), vars);
    if (!text) continue;
    const list = lines.get(t.section) ?? [];
    list.push({ key, text, locked: !!t.locked, listing: t.listing !== false, sign: t.sign, icon: t.icon, order: t.order });
    lines.set(t.section, list);
  }
  const extras: Ordered[] = a.extraRules
    .map((r, i) => ({ r: r.trim(), i }))
    .filter(({ r, i }) => r && !isExcluded(warnings, `extra-${i}`))
    .map(({ r, i }) => ({ key: `extra-${i}`, text: /[.!?]$/.test(r) ? r : `${r}.`, locked: false, listing: true, order: 100 + i }));
  if (extras.length) lines.set("other", [...(lines.get("other") ?? []), ...extras]);

  const sections: RuleSectionOut[] = content.sections
    .map((s) => ({
      key: s.key,
      heading: s.heading,
      lines: (lines.get(s.key) ?? []).sort((x, y) => x.order - y.order).map(({ key, text, locked, listing, sign, icon }) => ({ key, text, locked, listing, sign, icon })),
    }))
    .filter((s) => s.lines.length > 0);

  const lineCount = sections.reduce((acc, s) => acc + 1 + s.lines.length, 0);
  if (lineCount > content.limits.maxLines) warnings.push({ source: "all", type: "tooLong", level: "amber", ...content.limits.tooLong });

  const notes: Rules["notes"] = [];
  if (a.lateCheckout === "fee") notes.push({ source: "lateCheckout", text: content.limits.feeNote });
  if (a.pets === "yes" && a.petFee) notes.push({ source: "petFee", text: content.limits.feeNote });

  const highlights = { checkin: a.checkin, checkout: a.checkout, pets: a.pets, maxPets: a.pets === "yes" ? a.maxPets : null, parties: true };
  return { title: a.propertyName.trim() ? `House rules – ${a.propertyName.trim()}` : "House rules", sections, warnings, notes, lineCount, highlights };
}

/** Plain text with headings (Copy, .txt download). */
export function fullText(r: Rules): string {
  const out = [r.title, ""];
  for (const s of r.sections) out.push(s.heading.toUpperCase(), ...s.lines.map((l) => `• ${l.text}`), "");
  return out.join("\n").trimEnd() + "\n";
}

/** One bullet list for the listing's "additional rules" box (items covered by settings left out). */
export function listingText(r: Rules): string {
  return r.sections
    .flatMap((s) => s.lines.filter((l) => l.listing))
    .map((l) => `• ${l.text}`)
    .join("\n");
}

export type ChecklistItem = { id: string; platform: "airbnb" | "booking"; text: string };

/** Platform settings that should match the rules. */
export function platformChecklist(a: Answers, content: Content): ChecklistItem[] {
  const values: Record<string, string> = {
    pets: a.pets === "no" ? "No" : a.pets === "yes" ? "Yes" : "Yes (ask first)",
    smoking: a.smoking === "none" ? "No" : "Yes, outside only",
    quiet: `${formatTime(a.quietFrom)}–${formatTime(a.quietTo)}`,
    checkin: formatTime(a.checkin),
    checkout: formatTime(a.checkout),
    guests: String(a.maxGuests),
    devices: a.cameras || a.noiseMonitor ? "Yes" : "No",
  };
  return (["airbnb", "booking"] as const).flatMap((platform) =>
    content.platformLabels[platform].map((l) => ({ id: `${platform}-${l.key}`, platform, text: l.label.replace("{value}", values[l.key] ?? "") })),
  );
}

/** The 6–8 most important rules for the printable sign, in sign order. */
export function signRules(r: Rules): Line[] {
  return r.sections
    .flatMap((s) => s.lines)
    .filter((l) => l.sign && l.icon !== "message")
    .sort((x, y) => (x.sign ?? 99) - (y.sign ?? 99))
    .slice(0, 8);
}

/** The rules in the shared "send to another tool" format. */
export function rulesHandoff(r: Rules, now?: Date): Handoff {
  const sections: HandoffSection[] = r.sections.map((s) => ({ key: s.key, heading: s.heading, lines: s.lines.map((l) => l.text) }));
  return makeHandoff("house-rules", "house-rules-generator", { title: r.title, sections, highlights: r.highlights }, now);
}

/** Distinct rules flagged (for "What this means"). */
export const flaggedCount = (r: Rules) => new Set(r.warnings.map((w) => w.source)).size;

export function whatThisMeans(r: Rules): string {
  const n = flaggedCount(r);
  return n === 0
    ? "Your rules are clear and include everything required. Copy the listing version into your platform, then set the matching settings."
    : `We’ve flagged ${n} ${n === 1 ? "rule" : "rules"} to check. Fix ${n === 1 ? "it" : "them"} before you publish, so your rules stay fair and match platform policy.`;
}
