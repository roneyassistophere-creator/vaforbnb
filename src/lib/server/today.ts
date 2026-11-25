import "server-only";
import { cacheLife } from "next/cache";
import { londonToday } from "@/lib/tools/figures";

/** Today's UK date for pages built ahead of time (refreshed hourly). Tools re-check it in the browser. */
export async function getLondonToday(): Promise<string> {
  "use cache";
  cacheLife("hours");
  return londonToday();
}
