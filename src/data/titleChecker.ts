/**
 * Airbnb title checker: rules v1 (stored content).
 *
 * Seeded into the `figures` table as structured content and read from there,
 * so the limit, every word list, pattern, separator, template and message can
 * be edited without a code change. Bump `version` when the checks change.
 *
 * Matching ignores case, and a space or hyphen inside a phrase also matches
 * the other ("canal view" = "canal-view", "wi fi" = "wi-fi"). Words are
 * matched whole, so "pool" doesn't match "Liverpool".
 *
 * Tokens in messages: {n} {limit} {words} {chars} {town} {word}.
 */

export const rules = {
  version: 1,
  versionDate: "2026-11-25",

  /** Airbnb recommends fewer than 50 characters; longer titles get cut off. VERIFY. */
  limit: 50,
  /**
   * How characters are counted. "graphemes" = as people see them: an emoji,
   * a flag or an accented letter counts as 1. VERIFY how Airbnb counts them.
   */
  counting: "graphemes" as "graphemes" | "codepoints",
  /** The counter turns amber from this many characters (up to the limit). */
  warnFrom: 45,
  /** Titles shorter than this get the extra "room for one more" tip. */
  shortUnder: 20,

  /** Check 2. Words of at least `minLetters` capital letters, except the allow-list (e.g. place codes). */
  caps: { minLetters: 4, allow: [] as string[] },

  /** Check 3. Any of these twice or more in a row ("!!", "...", "--"), or more of a mark in total than `maxTotal` allows. */
  punctuation: { noRepeat: ["!", "?", ".", "*", "~", "-"], maxTotal: { "!": 1 } as Record<string, number> },

  /**
   * Check 4. Emoji and decorative symbols are flagged: emoji, and symbol
   * characters such as ★ ♥ ✓ ➤. These separators and signs are allowed.
   * `alsoFlag` adds characters that aren't symbols in Unicode but read as decoration.
   */
  symbols: {
    allowed: ["·", "|", "–", "-", ",", "&", "/", "+", "(", ")", "'", "’", "£"],
    alsoFlag: ["•", "◦", "‣"],
  },

  /** Check 6. A number (digits or a word) followed by one of `units`, or `studio` when bedrooms = 0. */
  bedrooms: {
    units: ["bedrooms", "bedroom", "beds", "bed", "bdrm", "br"],
    numberWords: ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
    studioWords: ["studio"],
  },

  /** Check 7. Phone numbers, email addresses, web addresses and social handles. */
  contact: {
    phoneMinDigits: 7,
    webMarkers: ["www.", "http", ".com", ".co.uk"],
    emails: true,
    handles: true,
  },

  /** Check 8. The first word shouldn't be one of these. */
  vagueStart: ["lovely", "beautiful", "cosy", "cozy", "stunning", "amazing", "gorgeous", "charming", "nice", "great", "perfect"],

  /** Check 9. At least one of these should appear. */
  features: [
    "parking", "garden", "hot tub", "sea view", "canal view", "river view", "balcony", "roof terrace", "patio", "fireplace", "log burner",
    "desk", "workspace", "fast wifi", "wifi", "pet-friendly", "dog-friendly", "EV charger", "ensuite", "pool", "sauna", "beach", "lift", "step-free",
  ],

  /**
   * Check 10. Passes when the title has the station or landmark entered, or:
   *  "[n] min(s) [walk] to/from …", "[n]-minute walk", or a word from `near` followed by a place.
   */
  location: {
    minuteWords: ["minutes", "minute", "mins", "min"],
    modes: ["walk", "drive", "ride", "cycle", "bus", "train", "tube"],
    joiners: ["to", "from"],
    near: ["near", "by the", "opposite", "next to"],
  },

  /** Check 11. `unless`: the claim is fine when one of those also appears ("luxury" with a hot tub). */
  claims: [
    { word: "best" },
    { word: "cheapest" },
    { word: "#1" },
    { word: "number one" },
    { word: "top-rated" },
    { word: "luxury", unless: ["hot tub", "pool", "sauna"] },
    { word: "perfect" },
  ] as { word: string; unless?: string[] }[],

  /** Check 12. Words of `minLetters`+ letters that appear twice, except these. */
  repeats: {
    minLetters: 4,
    stopWords: ["with", "from", "near", "into", "onto", "your", "this", "that", "than", "over", "next", "walk", "drive", "mins", "minute", "minutes"],
  },

  /** The 12 checks, in display order. `kind`: fix = breaks guidance or rules, tip = could be stronger. */
  checks: [
    { id: "length", kind: "fix", name: "Length" },
    { id: "caps", kind: "fix", name: "No all-caps words" },
    { id: "punctuation", kind: "fix", name: "No repeated punctuation" },
    { id: "symbols", kind: "fix", name: "No emoji or decorative symbols" },
    { id: "city", kind: "fix", name: "Doesn’t repeat the city" },
    { id: "bedrooms", kind: "fix", name: "Doesn’t repeat the bedroom count" },
    { id: "contact", kind: "fix", name: "No contact details or links" },
    { id: "vague", kind: "tip", name: "Doesn’t start with a vague word" },
    { id: "feature", kind: "tip", name: "Has a standout feature" },
    { id: "location", kind: "tip", name: "Has a location hook" },
    { id: "claims", kind: "tip", name: "No unprovable claims" },
    { id: "repeats", kind: "tip", name: "No repeated words" },
  ] as { id: string; kind: "fix" | "tip"; name: string }[],

  /** Reasons. `pass` is shown when a check passes. */
  messages: {
    length: { pass: "{n} of {limit} characters.", fix: "{n} characters over. Titles over {limit} get cut off.", fixOne: "1 character over. Titles over {limit} get cut off.", empty: "Add a title." },
    caps: { pass: "No all-caps words.", fix: "Avoid all caps: {words}." },
    punctuation: { pass: "Punctuation is clean.", fix: "Use one punctuation mark at most." },
    symbols: { pass: "No emoji or symbols.", fix: "Remove emoji and symbols: {chars}." },
    city: { pass: "Doesn’t repeat your town.", fix: "Search already shows ‘{town}’. Use the space for a selling point.", skipped: "Add your town under details to check this." },
    bedrooms: { pass: "Doesn’t repeat the number of bedrooms.", fix: "Search already shows the number of bedrooms.", tip: "Search already shows the number of bedrooms." },
    contact: { pass: "No contact details or links.", fix: "Contact details and links aren’t allowed in listings." },
    vague: { pass: "Starts with a fact.", tip: "Lead with a fact, not ‘{word}’." },
    feature: { pass: "Standout feature: ‘{word}’.", tip: "Add one thing guests can’t see from the photo grid, like ‘free parking’." },
    location: { pass: "Location hook: ‘{word}’.", tip: "Add a nearby landmark or travel time, like ‘5 min to the tram’." },
    claims: { pass: "No unprovable claims.", tip: "Swap claims for facts guests can check." },
    repeats: { pass: "No repeated words.", tip: "‘{word}’ appears twice." },
    short: "There’s room for one more selling point.",
  },

  verdicts: {
    strong: { label: "Strong", meaning: "Your title follows Airbnb’s guidance and leads with clear selling points. Pair it with a strong cover photo." },
    good: { label: "Good", meaning: "No rule problems. A few small changes could make it stand out more. Try the title builder." },
    fixes: { label: "Needs fixes", meaning: "Fix the {n} items marked ‘Fix’ first. They go against Airbnb’s guidance or may get your title cut off." },
    passed: "{n} of {total} checks passed",
  },

  /** Title builder. */
  builder: {
    maxFeatures: 3,
    customMax: 25,
    maxSuggestions: 6,
    /** Fewer suggestions than this shows `fewHint`. */
    minShown: 3,
    /** Ordering: Strong first, then length closest to this. */
    target: 45,
    fewHint: "Pick a shorter feature or hook to see more ideas.",
    /**
     * Standout features. `before`: in front of the type ("Canal-view flat");
     * `after`: after "with" ("flat with a canal view"); `alone`: on its own.
     * No `before` = templates that need it are skipped for that feature.
     */
    features: [
      { id: "canal-view", label: "canal view", before: "canal-view", after: "a canal view", alone: "canal view" },
      { id: "sea-view", label: "sea view", before: "sea-view", after: "a sea view", alone: "sea view" },
      { id: "river-view", label: "river view", before: "river-view", after: "a river view", alone: "river view" },
      { id: "garden", label: "garden", before: "garden", after: "a garden", alone: "private garden" },
      { id: "hot-tub", label: "hot tub", before: "hot tub", after: "a hot tub", alone: "hot tub" },
      { id: "parking", label: "parking", after: "parking", alone: "free parking" },
      { id: "balcony", label: "balcony", after: "a balcony", alone: "balcony" },
      { id: "roof-terrace", label: "roof terrace", after: "a roof terrace", alone: "roof terrace" },
      { id: "patio", label: "patio", after: "a patio", alone: "patio" },
      { id: "log-burner", label: "log burner", after: "a log burner", alone: "log burner" },
      { id: "fireplace", label: "fireplace", after: "a fireplace", alone: "fireplace" },
      { id: "workspace", label: "desk and workspace", after: "a desk", alone: "desk and workspace" },
      { id: "fast-wifi", label: "fast Wi-Fi", after: "fast Wi-Fi", alone: "fast Wi-Fi" },
      { id: "pet-friendly", label: "pet-friendly", before: "pet-friendly", alone: "pet-friendly" },
      { id: "ev-charger", label: "EV charger", after: "an EV charger", alone: "EV charger" },
      { id: "ensuite", label: "ensuite", after: "an ensuite", alone: "ensuite" },
      { id: "pool", label: "pool", after: "a pool", alone: "pool" },
      { id: "sauna", label: "sauna", after: "a sauna", alone: "sauna" },
      { id: "step-free", label: "step-free", before: "step-free", alone: "step-free access" },
    ] as { id: string; label: string; before?: string; after?: string; alone: string }[],
    /** Benefits. {maxGuests} is filled from the guests stepper. */
    benefits: [
      { id: "free-parking", text: "free parking" },
      { id: "fast-wifi", text: "fast Wi-Fi" },
      { id: "self-checkin", text: "self check-in" },
      { id: "sleeps", text: "sleeps {maxGuests}" },
      { id: "pet-friendly", text: "pet-friendly" },
      { id: "long-stays", text: "long stays welcome" },
      { id: "garden", text: "garden" },
      { id: "workspace", text: "workspace" },
    ],
    /** Location hooks. {n} minutes, {mode} from `modes`, {place} = station or landmark. */
    hooks: { minutes: "{n} min {mode} to {place}", near: "near {place}" },
    modes: ["walk", "drive"],
    /** Words used for each property type in a title. "other" has none, so templates that need a type are skipped. */
    typeWords: { flat: "flat", house: "house", cottage: "cottage", studio: "studio", room: "room", loft: "loft", other: "" } as Record<string, string>,
    /**
     * Templates, in priority order. Tokens: {featureBefore} {featureAfter}
     * {feature} {type} {benefit} {hook} {place} {sep}. A template is skipped
     * when one of its tokens is empty. The first letter is capitalised.
     */
    templates: [
      "{featureBefore} {type}{sep}{benefit}{sep}{hook}",
      "{type} with {featureAfter}{sep}{hook}",
      "{featureBefore} {type}, {hook}",
      "{feature}{sep}{benefit}{sep}{hook}",
      "{featureBefore} {type} with {benefit}",
      "{type} near {place}{sep}{feature}{sep}{benefit}",
    ],
    separators: [
      { id: "dot", label: "·", text: " · " },
      { id: "bar", label: "|", text: " | " },
      { id: "comma", label: ",", text: ", " },
      { id: "dash", label: "–", text: " – " },
    ],
    defaultSeparator: "dot",
  },

  /** "Try an example": clearly labelled as example data in the tool. */
  example: { title: "Lovely 2 Bed Flat in Manchester City Centre!!! ★", town: "Manchester", place: "", propertyType: "flat", bedrooms: 2 },
};

/** Airbnb's published title guidance (shown on the page and in How it works). VERIFY. */
export const source = {
  title: "Airbnb Resource Centre: Guidelines for writing your listing title",
  url: "https://www.airbnb.co.uk/resources/hosting-homes/a/guidelines-for-writing-your-listing-title-533",
  date: "2026-02-02",
};

/** The source for check 7 (no contact details or links). VERIFY: add the exact help article. */
export const contactSource = {
  title: "Airbnb off-platform and content policies (Help Centre)",
  url: null as string | null,
};
