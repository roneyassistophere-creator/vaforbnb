import { isPastRetention, extraCount, type Lists, type Stay } from "./rules";
import type { Figures } from "../figures";

export type Tone = "friendly" | "short";
export type Channel = "airbnb" | "whatsapp" | "email";

/** The message asking guests for their details. Never asks for passport photos. */
export function guestMessage(o: { guestName: string; property: string; host: string; tone: Tone; channel: Channel }, lists: Lists): string {
  const guest = o.guestName.trim() || "there";
  const property = o.property.trim() || "our place";
  const host = o.host.trim();
  const sign = host ? ` ${host}` : "";
  const body =
    o.tone === "friendly"
      ? `Hi ${guest}, we’re looking forward to your stay at ${property}! UK law asks us to record a few details for every guest aged ${lists.minAge} or over. Could you send me: full name and nationality for each adult guest. If anyone isn’t a British, Irish or Commonwealth citizen, I’ll also need their passport or ID number, where it was issued, and where you’re heading after your stay. Thank you!${sign}`
      : `Hi ${guest}, UK law asks us to record each guest aged ${lists.minAge}+: full name and nationality. If anyone isn’t a British, Irish or Commonwealth citizen, please also send their passport or ID number, where it was issued, and where you’re going next. Thanks!${sign}`;
  return o.channel === "email" ? `Subject: Guest details for your stay at ${property}\n\n${body}` : body;
}

/** "What this means": up to 2 sentences chosen by the register's state. */
export function whatThisMeans(stays: Stay[], lists: Lists, figures: Figures, today: string | null): string {
  if (!stays.length) return "Record each booking’s adult guests at check-in. It takes about a minute per guest.";
  const past = today ? stays.filter((s) => isPastRetention(s, figures, today)).length : 0;
  const first =
    past > 0
      ? `${past} ${past === 1 ? "stay is" : "stays are"} older than ${lists.retentionMonths} months. Delete ${past === 1 ? "it" : "them"} unless you have another reason to keep ${past === 1 ? "it" : "them"}.`
      : `Your register has ${stays.length} ${stays.length === 1 ? "stay" : "stays"}. Keep it secure and download a backup copy now and then.`;
  const extra = stays.some((s) => extraCount(s, lists) > 0) ? " Some guests needed extra details because they aren’t British, Irish or Commonwealth citizens." : "";
  return first + extra;
}
