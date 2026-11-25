import { brand } from "@/config/brand";

export { historyKey, storageKey, toolPath, toolSlug } from "./aiReadinessId";

/**
 * Interface copy for the AI-readiness listing scorer. Scoring patterns, word
 * lists, points, bands and templates are stored content (src/data/aiReadiness.ts).
 */

export const steps = ["Your listing text", "About the place", "Who stays", "Amenities and details"];

export const propertyTypes = [
  { value: "flat", label: "Flat" },
  { value: "house", label: "House" },
  { value: "cottage", label: "Cottage" },
  { value: "studio", label: "Studio" },
  { value: "room", label: "Room" },
  { value: "other", label: "Other" },
];

export const questions = {
  captions: "Every room has a photo caption",
  bedSizes: "Bed sizes are listed for every bedroom",
  wifiSpeed: "Your Wi-Fi speed is stated",
  honest: "You mention honest limits, such as stairs, noise or a small kitchen",
};

export const copy = {
  privacy: "Your listing text is analysed on your device. Nothing is sent to us.",
  progress: "{done} of {total} steps done",
  title: { label: "Title", over: "Airbnb allows {limit} characters." },
  oneBox: { label: "Paste everything in one box", hint: "If you’re not sure which section is which." },
  allLabel: "Your whole description",
  helperLink: "Where do I find these in the Airbnb app?",
  required: "required",
  optional: "optional",
  counter: "{n} / {limit}",
  place: {
    town: { label: "Town or city (optional)", hint: "Used in your example sentences." },
    station: { label: "Nearest station or stop (optional)", hint: "For example ‘Leeds station’." },
    landmark: { label: "A landmark guests care about (optional)", hint: "For example ‘St James's Hospital’ or ‘the beach’." },
    type: "Property type",
    bedrooms: "Bedrooms",
    guests: "Maximum guests",
  },
  who: { legend: "Who usually stays? Pick up to {max}.", hint: "If you skip this, we check the core needs: fast Wi-Fi, parking, self check-in and a kitchen.", full: "You’ve picked {max}. Untick one to choose another." },
  amenities: { legend: "Amenities you’ve ticked on Airbnb", parking: "Parking situation", parkingHint: "Stating it counts, even ‘No parking’." },
  wifiAuto: { yes: "Found in your text", no: "Not found in your text" },
  buttons: { score: "Score my listing", rescore: "Score again", example: "Try an example", improved: "See the improved version", reset: "Reset", clear: "Clear my data" },
  exampleBanner: "You’re looking at an example listing (invented), not your own.",
  improvedBanner: "You’re looking at the improved example. Compare it with the first one in History.",
  clearConfirm: "Clear your listing, answers and score history from this device?",
  storageFailed: "This browser isn’t letting us save, so your answers won’t be remembered after you leave. The tool still works.",
  panel: {
    empty: "Your score appears here",
    emptyHint: "Paste your listing and press ‘Score my listing’.",
    seeFixes: "See my top 3 fixes",
    report: "Get the report (PDF)",
    copyFixes: "Copy fix list",
    bars: "Score by check",
    live: "Score {score} out of 100: {band}",
  },
  sticky: "Score: {score} · See fixes",
  tabs: { fixes: "Fixes", simulator: "Guest search simulator", text: "Your text, highlighted", breakdown: "Score breakdown", history: "History" },
  fixes: { none: "No fixes left: every check has full points.", available: "+{n} points available", example: "Example", copyExample: "Copy example", quickWins: "Quick wins", quickWinsHint: "No points, but each makes your listing clearer. Tick them off as you go.", noQuickWins: "No quick wins: your text and amenities agree." },
  simulator: { label: "Type what a guest might search", placeholder: "quiet flat near the station with a desk", check: "Check", examples: "Or try a guest search", again: "Try another search" },
  text: { empty: "Paste your listing in step 1 to see it highlighted.", key: "Key", vague: "Vague word: replace with a fact", fact: "Fact with a unit", phrase: "Minutes to a place" },
  history: { empty: "Your scores on this device appear here after you score your listing.", clear: "Clear history", date: "Date", score: "Score", band: "Band" },
  pdfModal: {
    title: "Get your AI-readiness report",
    intro: "Your PDF is made on this device and downloads straight away. Your listing text is never sent to us. Add your email only if you’d like occasional listing tips.",
    consent: `Email me occasional listing tips and updates from ${brand.name}. Unsubscribe any time.`,
    submit: "Download the PDF",
    done: "Your PDF has downloaded.",
    error: "Your PDF has downloaded, but we couldn’t save your email. Try again later.",
  },
  handoff: {
    toBuilder: "Send to the description builder",
    builderSaved: "Saved on this device. The AI-ready description builder is coming soon and will import it.",
    audit: "Get a free AI-readiness audit",
    auditShare: "Include my score, band and town in the audit form (no listing text)",
    auditSaved: "Saved for the audit form on this device.",
    improveTitle: "Improve my title",
    planPhotos: "Plan my photos and captions",
    writeDescription: "Write it with the description builder",
    fromDescription: "Your four sections came across from the AI-ready description builder and are scored below. Tick your photo captions and amenities to complete the score.",
    fromTitle: "Your title came across from the Airbnb title checker. Add your description to score your whole listing.",
  },
};
