/**
 * Tool analytics. Off by default: set NEXT_PUBLIC_ANALYTICS=on to send
 * events to `window.dataLayer` (e.g. for Google Tag Manager).
 * Events carry the tool slug only: never answers or results.
 */
export type ToolEvent =
  | "tool_opened"
  | "tool_result_shown"
  | "pdf_requested"
  | "next_step_clicked"
  | "kit_started"
  | "booking_added"
  | "file_downloaded"
  | "import_used"
  | "item_added"
  | "kit_completed"
  | "levy_calculated"
  | "log_added"
  | "stay_saved"
  | "template_downloaded"
  | "message_copied"
  | "retention_deleted"
  | "preview_tab_viewed"
  | "copied"
  | "checker_warning_shown"
  | "sent_to_welcome_guide"
  | "kit_step_completed"
  | "score_shown"
  | "fix_copied"
  | "simulator_used"
  | "report_requested"
  | "sent_to_description_builder"
  | "title_checked"
  | "suggestion_used"
  | "compare_used"
  | "list_built"
  | "shoot_mode_started"
  | "shoot_mode_finished"
  | "captions_copied"
  | "imported_from_description"
  | "section_copied"
  | "make_it_fit_used"
  | "score_this_clicked"
  | "imported_from_scorer"
  | "result_shown"
  | "scenario_saved"
  | "search_made"
  | "view_changed"
  | "event_starred"
  | "calendar_added"
  | "source_clicked"
  | "plan_prices_clicked"
  | "suggestion_sent"
  | "alerts_signup"
  | "mode_switched"
  | "tab_viewed"
  | "pdf_downloaded"
  | "handoff_clicked";

/** Item categories for item_added (never names or dates). `type` elsewhere is a short category like "csv" or "listing". */
export type ItemType = "gas" | "eicr" | "fra" | "pat" | "legionella" | "licence" | "niCert" | "insurance" | "custom";

export const analyticsEnabled = process.env.NEXT_PUBLIC_ANALYTICS === "on";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/** `outcome`, `type`, `area`, `count`, `band`, `check` and `verdict` are categories or counts only, never figures, dates, text or personal data. */
export function track(
  event: ToolEvent,
  toolSlug: string,
  extra?: { outcome?: "passes" | "not-yet"; type?: string; area?: string; count?: number; band?: string; check?: string; verdict?: "strong" | "good" | "fixes" },
) {
  if (!analyticsEnabled || typeof window === "undefined") return;
  (window.dataLayer ??= []).push({
    event,
    tool: toolSlug,
    ...(extra?.outcome ? { outcome: extra.outcome } : {}),
    ...(extra?.type ? { type: extra.type } : {}),
    ...(extra?.area ? { area: extra.area } : {}),
    ...(typeof extra?.count === "number" ? { count: extra.count } : {}),
    ...(extra?.band ? { band: extra.band } : {}),
    ...(extra?.check ? { check: extra.check } : {}),
    ...(extra?.verdict ? { verdict: extra.verdict } : {}),
  });
}
