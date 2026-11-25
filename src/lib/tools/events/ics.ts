import { buildIcs } from "@/lib/tools/ics";
import type { PublicEvent } from "./types";

/**
 * Calendar file for starred events (reuses the shared calendar-file maker):
 * one all-day event each, with a reminder the chosen number of weeks before.
 */
export function eventsIcs(list: Pick<PublicEvent, "slug" | "name" | "startDate" | "endDate" | "sourceUrl" | "venue">[], weeksBefore: number, now: Date): string {
  return buildIcs(
    list.map((e) => ({
      uid: `${e.slug}@vaforbnb.co.uk`,
      date: e.startDate,
      endDate: e.endDate,
      title: e.name,
      description: [e.venue, `Check the official site before changing prices: ${e.sourceUrl}`].filter(Boolean).join("\n"),
      url: e.sourceUrl,
      alarmsDaysBefore: [weeksBefore * 7],
    })),
    { prodId: "-//VA for BnB//UK event calendar//EN", calendarName: "Events to plan for", now },
  );
}
