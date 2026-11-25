/**
 * AI-readiness listing scorer: scoring model v3 (stored content).
 *
 * v3 (2026-11-25): the title check no longer rewards the town or a bedroom
 * count, which search already shows (matches the Airbnb title checker).
 *
 * Seeded into the `figures` table as structured content and read from there,
 * so every pattern, word list, point value, band, limit and template can be
 * edited without a code change. Bump `version` when the scoring changes.
 *
 * Phrases match whole words, ignoring case; a space or hyphen inside a phrase
 * also matches the other ("self check-in" = "self-check-in").
 */

export const model = {
  version: 3,
  versionDate: "2026-11-25",

  /** Property type words for check A, and the types offered in step 2. */
  propertyTypeWords: ["flat", "apartment", "house", "cottage", "studio", "room", "loft", "bungalow", "lodge", "cabin"],
  /** Concrete feature words for check A (a number with a unit also counts, a bedroom count doesn't). Same list as the title checker. */
  titleFeatureWords: [
    "parking", "garden", "hot tub", "sea view", "canal view", "river view", "balcony", "roof terrace", "patio", "fireplace", "log burner",
    "desk", "workspace", "fast wifi", "wifi", "wi-fi", "pet-friendly", "dog-friendly", "EV charger", "ensuite", "pool", "sauna", "beach", "lift", "step-free",
  ],

  /** Units for check B: number + optional space or hyphen + unit. */
  units: ["mbps", "minutes", "minute", "mins", "min", "m²", "m2", "sq m", "sq ft", "metres", "metre", "meters", "meter", "miles", "mile", "km"],

  /** Check C: "[n] minute(s) [walk] to/from [the] place". */
  location: {
    minuteWords: ["minutes", "minute", "mins", "min"],
    modes: ["walk", "drive", "ride", "cycle", "bus", "train", "tube"],
    joiners: ["to", "from"],
    transportWords: ["station", "tube", "underground", "metro", "tram", "bus stop", "airport"],
  },

  /** Evidence straight after one of these words doesn’t count ("no lift", "without parking", "not a desk"). */
  negations: ["no", "not", "without", "never", "isn't", "isn’t"],
  /** Words allowed between a negation and the evidence ("not a desk", "without any parking"). */
  negationFillers: ["a", "an", "any", "the"],

  /** Check E. Each entry counts once per occurrence; variants are treated the same. */
  vague: [
    { term: "cosy", variants: ["cosy", "cozy"], suggestion: "give the size (for example ‘12 m²’) or what makes it warm" },
    { term: "close to everything", variants: ["close to everything"], suggestion: "name the places and the minutes to each" },
    { term: "great location", variants: ["great location"], suggestion: "say minutes to a named place" },
    { term: "perfect location", variants: ["perfect location"], suggestion: "say minutes to a named place" },
    { term: "amazing", variants: ["amazing"], suggestion: "say what it is: a view, a size or a feature" },
    { term: "stunning", variants: ["stunning"], suggestion: "describe what guests will see, for example ‘sea view from the bedroom’" },
    { term: "spacious", variants: ["spacious"], suggestion: "give the size in m² or the number of rooms" },
    { term: "lovely", variants: ["lovely"], suggestion: "replace with a fact guests can check" },
    { term: "ideal for everyone", variants: ["ideal for everyone"], suggestion: "say who it suits and why, for example ‘desk and 300 Mbps for remote workers’" },
    { term: "home from home", variants: ["home from home"], suggestion: "list what makes it homely: full kitchen, washing machine, sofa" },
    { term: "convenient", variants: ["convenient"], suggestion: "say minutes to a named place" },
  ],

  /** Amenities offered in step 4. `mention` is how a quick win names it; `evidence` finds it in the text. */
  amenities: [
    { id: "wifi", label: "Wi-Fi", mention: "Wi-Fi", evidence: ["wifi", "wi-fi", "internet", "broadband", "@mbps"], suggestTick: false },
    { id: "workspace", label: "Dedicated workspace", mention: "your workspace", evidence: ["desk", "workspace", "office chair", "study"], suggestTick: true },
    { id: "parking", label: "Parking (free or paid)", mention: "parking", evidence: ["parking", "driveway", "garage", "car park"], suggestTick: true },
    { id: "washer", label: "Washing machine", mention: "washing machine", evidence: ["washing machine", "washer"], suggestTick: true },
    { id: "selfCheckin", label: "Self check-in", mention: "self check-in", evidence: ["self check-in", "lockbox", "key safe", "keypad", "smart lock"], suggestTick: true },
    { id: "kitchen", label: "Kitchen", mention: "the kitchen", evidence: ["kitchen", "oven", "hob"], suggestTick: false },
    { id: "dryer", label: "Dryer", mention: "the dryer", evidence: ["dryer", "tumble dryer"], suggestTick: false },
    { id: "cooling", label: "Air conditioning or fan", mention: "air conditioning or fans", evidence: ["air conditioning", "air-con", "aircon", "fan", "fans"], suggestTick: false },
    { id: "heating", label: "Heating", mention: "heating", evidence: ["heating", "radiator", "radiators", "underfloor", "log burner", "wood burner"], suggestTick: false },
    { id: "garden", label: "Garden or patio", mention: "the garden or patio", evidence: ["garden", "patio", "balcony", "terrace", "courtyard"], suggestTick: true },
    { id: "cot", label: "Cot", mention: "the cot", evidence: ["cot", "travel cot"], suggestTick: false },
    { id: "highChair", label: "High chair", mention: "the high chair", evidence: ["high chair", "highchair"], suggestTick: false },
    { id: "pets", label: "Pets allowed", mention: "your pet policy", evidence: ["pet-friendly", "dogs welcome", "pets allowed", "dog-friendly", "pets welcome", "dog welcome"], suggestTick: true },
    { id: "lift", label: "Lift", mention: "the lift", evidence: ["lift", "elevator"], suggestTick: false },
    { id: "stepFree", label: "Step-free entrance", mention: "step-free access", evidence: ["step-free", "level access", "no steps", "ground floor"], suggestTick: false },
  ],

  /** Step 4 parking situation. Any answer counts as stated for check F. */
  parkingOptions: [
    { id: "free", label: "Free parking" },
    { id: "paid", label: "Paid parking nearby" },
    { id: "permit", label: "Permit" },
    { id: "none", label: "No parking" },
  ],

  /** Check D. `@mbps` = a number + Mbps; `@transport` = a minutes-to phrase in a sentence with a transport word. */
  needs: [
    { id: "fast-wifi", label: "Fast Wi-Fi", evidence: ["@mbps"], amenities: [], suggestion: "Add your Wi-Fi speed, for example ‘Wi-Fi: 150 Mbps (tested {month})’." },
    { id: "workspace", label: "Workspace", evidence: ["desk", "workspace", "office chair", "monitor", "study"], amenities: ["workspace"], suggestion: "Describe the desk: ‘Desk and office chair by the window in bedroom 2’." },
    { id: "quiet", label: "Quiet", evidence: ["quiet street", "residential street", "cul-de-sac", "double glazing", "double-glazed", "soundproof", "no through traffic"], amenities: [], suggestion: "Say why it’s quiet: ‘quiet residential street, double-glazed windows’." },
    { id: "near-transport", label: "Near transport", evidence: ["@transport"], amenities: [], suggestion: "Add ‘8-minute walk to {station}’." },
    { id: "parking", label: "Parking", evidence: ["parking", "driveway", "garage", "permit", "car park"], amenities: ["@parkingStated"], suggestion: "Say exactly where to park: ‘Free parking on the driveway for one car’." },
    { id: "self-checkin", label: "Self check-in", evidence: ["self check-in", "lockbox", "key safe", "keypad", "smart lock"], amenities: ["selfCheckin"], suggestion: "Explain arrival: ‘Self check-in with a keypad from 3pm’." },
    { id: "kitchen", label: "Kitchen", evidence: ["kitchen", "oven", "hob", "dishwasher", "microwave"], amenities: ["kitchen"], suggestion: "List the kitchen kit: ‘Full kitchen with oven, hob, dishwasher and kettle’." },
    { id: "laundry", label: "Laundry", evidence: ["washing machine", "washer", "dryer", "tumble dryer"], amenities: ["washer"], suggestion: "Mention laundry: ‘Washing machine and drying rack’." },
    { id: "family", label: "Family kit", evidence: ["cot", "travel cot", "high chair", "stair gate", "family"], amenities: ["cot", "highChair"], suggestion: "List family kit: ‘Travel cot and high chair on request’." },
    { id: "outdoor", label: "Outdoor space", evidence: ["garden", "patio", "balcony", "terrace", "courtyard"], amenities: ["garden"], suggestion: "Describe outside space: ‘Private patio garden with seating for 4’." },
    { id: "pets", label: "Pets welcome", evidence: ["pet-friendly", "dogs welcome", "pets allowed", "dog-friendly"], amenities: ["pets"], suggestion: "State the pet policy: ‘One well-behaved dog welcome’." },
    { id: "step-free", label: "Step-free access", evidence: ["step-free", "ground floor", "lift", "no stairs", "level access"], amenities: ["stepFree", "lift"], suggestion: "Be clear on access: ‘Ground-floor flat, step-free from the street’." },
    { id: "long-stay", label: "Longer stays", evidence: ["weekly", "monthly", "long stay", "long-term"], amenities: [], suggestion: "Invite longer stays: ‘Weekly and monthly stays welcome’." },
    { id: "sleeping", label: "Beds", evidence: ["king", "double", "single", "sofa bed", "bunk", "super king", "queen"], amenities: ["@bedSizes"], suggestion: "List beds: ‘Bedroom 1: king. Bedroom 2: two singles’." },
  ],
  /** Used when no guest type is picked. */
  coreNeeds: ["fast-wifi", "parking", "self-checkin", "kitchen"],
  /** Step 3. Up to `maxGuestTypes` can be picked; their needs are combined without duplicates. */
  maxGuestTypes: 3,
  guestTypes: [
    { id: "remote", label: "Remote workers", needs: ["fast-wifi", "workspace", "quiet"] },
    { id: "contractors", label: "Contractors", needs: ["parking", "laundry", "kitchen", "long-stay", "self-checkin"] },
    { id: "families", label: "Families", needs: ["family", "outdoor", "kitchen", "laundry", "sleeping"] },
    { id: "couples", label: "Couples", needs: ["quiet", "near-transport"] },
    { id: "business", label: "Business travellers", needs: ["near-transport", "workspace", "fast-wifi", "self-checkin"] },
    { id: "pets", label: "Pet owners", needs: ["pets", "outdoor", "parking"] },
    { id: "groups", label: "Groups", needs: ["sleeping", "parking", "kitchen"] },
    { id: "stepFree", label: "Guests needing step-free access", needs: ["step-free"] },
  ],

  /** Points. Totals 100. */
  points: {
    A: { length: 4, type: 2, place: 2, feature: 2 },
    /** Points for 0, 1, 2 and 3+ facts with units. */
    B: { steps: [0, 5, 10, 15] },
    /** Points for 0, 1 and 2+ minutes-to phrases, plus the transport bonus, capped at max. */
    C: { steps: [0, 8, 12], transportBonus: 3, max: 15 },
    D: { max: 15 },
    E: { max: 10, perHit: 2 },
    F: { each: 3, amenities: ["wifi", "workspace", "washer", "selfCheckin"], parkingStated: true },
    G: { captions: 5, beds: 5 },
    H: { honest: 4, minChars: 200, paragraphs: 2, sentences: 2, maxSentenceWords: 25, shouting: 2, maxCapsWords: 3, capsMinLetters: 4, maxExclamations: 3 },
  },

  checks: [
    { id: "A", name: "Title", max: 10 },
    { id: "B", name: "Facts with units", max: 15 },
    { id: "C", name: "Location precision", max: 15 },
    { id: "D", name: "Guest-needs coverage", max: 15 },
    { id: "E", name: "Vague words", max: 10 },
    { id: "F", name: "Key amenities stated", max: 15 },
    { id: "G", name: "Room details", max: 10 },
    { id: "H", name: "Clarity and honesty", max: 10 },
  ],
  /** Tie-break order for the top 3 fixes. */
  fixPriority: ["C", "B", "D", "F", "A", "G", "H", "E"],
  topFixes: 3,

  bands: [
    { id: "needs-work", label: "Needs work", min: 0, fg: "#B8383A", bg: "#FDECEC" },
    { id: "getting-there", label: "Getting there", min: 50, fg: "#6B4A00", bg: "#FFF2CC" },
    { id: "ai-ready", label: "AI-ready", min: 80, fg: "#1F6B45", bg: "#E3F2EA" },
  ],

  /** "What this means", by band. {points} = points available in the top three fixes. */
  meaning: {
    "ai-ready": "Your listing gives guests and AI clear facts to match. Keep it fresh: update the Wi-Fi speed and local times if anything changes.",
    "getting-there": "A few fixes will make a real difference. Start with your top three. They’re worth up to {points} points.",
    "needs-work": "Your listing relies on vague words and is missing key facts. Add minutes to places, your Wi-Fi speed, bed sizes and parking details.",
  },

  /**
   * Fix wording per check. Tokens: {station} {landmark} {place} {town} {type}
   * {limit} {needs} {amenities} {word} {suggestion}. A missing detail becomes
   * the bracketed placeholder in `placeholders`.
   */
  placeholders: { station: "[your station]", landmark: "[a place guests visit]", place: "[your station]", town: "[your town]", type: "flat" },
  fixes: {
    A: {
      length: { action: "Write a title of {limit} characters or fewer.", example: "‘{Type} with parking, 8 min to {place}’" },
      type: { action: "Say what the place is in the title.", example: "‘Quiet {type} with desk, near {place}’" },
      place: { action: "Put your station or a landmark in the title. Search already shows your town.", example: "‘{Type} with parking, 8 min to {place}’" },
      feature: { action: "Add one concrete feature to the title: a key amenity or a number with a unit. Search already shows the bedrooms.", example: "‘Garden {type} with parking near {place}’" },
    },
    B: { action: "Add facts with units: Wi-Fi speed, room sizes and distances.", example: "‘Wi-Fi: 150 Mbps. Main bedroom: 14 m². 2 miles to {landmark}.’" },
    C: {
      phrases: { action: "Give minutes to named places, including your nearest station.", example: "Add ‘8-minute walk to {station}’." },
      transport: { action: "Put a station, stop or airport in one of your minutes-to sentences.", example: "Add ‘8-minute walk to {station}’." },
    },
    D: { action: "Add evidence for what your guests need: {needs}.", example: "{suggestion}" },
    E: { action: "Replace vague words with facts guests can check.", example: "Instead of ‘{word}’, {suggestion}." },
    F: { action: "Tick and state the key amenities: {amenities}.", example: "‘Free parking on the driveway. Washing machine. Self check-in with a keypad.’" },
    G: {
      captions: { action: "Add a caption to every room photo.", example: "‘Bedroom 2: two singles, desk by the window’" },
      beds: { action: "List the bed size in every bedroom.", example: "‘Bedroom 1: king. Bedroom 2: two singles.’" },
    },
    H: {
      honest: { action: "Mention honest limits, such as stairs, noise or a small kitchen.", example: "‘The flat is on the second floor with no lift.’" },
      length: { action: "Write at least {minChars} characters of description, in short paragraphs.", example: "Split it into short paragraphs: the space, getting here, then the details." },
      paragraphs: { action: "Break your description into short paragraphs.", example: "Start a new paragraph for the space, getting here and the details." },
      sentences: { action: "Use shorter sentences: {maxWords} words or fewer on average.", example: "Split long sentences at ‘and’ or ‘with’." },
      shouting: { action: "Use fewer capital-letter words and exclamation marks.", example: "‘Sea view from the bedroom.’ instead of ‘AMAZING VIEWS!!!’" },
    },
  },

  /** Plain-English reasons in the breakdown. */
  reasons: {
    titleLength: "Title is {n} characters (limit {limit})",
    titleEmpty: "No title yet",
    titleTooLong: "Title is {n} characters, over the {limit} limit",
    titleType: "Mentions ‘{word}’",
    titleNoType: "No property type in the title",
    titlePlace: "Mentions ‘{word}’",
    titleNoPlace: "No station or landmark in the title",
    titleFeature: "Concrete feature: ‘{word}’",
    titleNoFeature: "No key amenity or number with a unit in the title",
    units: "{n} facts with units: {list}",
    noUnits: "No facts with units (such as Mbps, minutes, m² or miles)",
    phrases: "{n} ‘minutes to’ phrases: {list}",
    noPhrases: "No ‘minutes to a place’ phrases",
    transport: "A minutes-to sentence names transport (‘{word}’)",
    noTransport: "No station, stop or airport in a minutes-to sentence",
    needsCovered: "{covered} of {total} guest needs covered ({source})",
    needCovered: "{label}: covered",
    needMissing: "{label}: missing",
    vagueNone: "No vague words found",
    vagueHit: "‘{word}’ × {n}",
    amenityYes: "{label} stated",
    amenityNo: "{label} not stated",
    parkingYes: "Parking situation stated ({label})",
    parkingNo: "Parking situation not stated",
    captionsYes: "Every room has a caption",
    captionsNo: "Not every room has a caption",
    bedsYes: "Bed sizes listed for every bedroom",
    bedsNo: "Bed sizes not listed for every bedroom",
    honestYes: "Mentions honest limits",
    honestNo: "No honest limits mentioned",
    tooShort: "Description is {n} characters: layout points start at {minChars}",
    paragraphsYes: "Has paragraph breaks",
    paragraphsNo: "One block of text, no paragraph breaks",
    sentencesYes: "Average sentence is {n} words",
    sentencesNo: "Average sentence is {n} words (aim for {max} or fewer)",
    shoutingYes: "{caps} capital-letter words, {marks} exclamation marks",
    shoutingNo: "{caps} capital-letter words, {marks} exclamation marks (limit {maxCaps} and {maxMarks})",
  },

  /** Quick wins (no points). */
  quickWins: {
    tick: "Tick {amenity} in your Airbnb amenities.",
    mention: "Mention {amenity} in your description so guests know the details.",
    shorten: "Shorten {field} by {n} characters.",
    wifiSpeed: "Add the speed itself, for example ‘150 Mbps’.",
  },

  /** Guest search simulator. */
  simulator: {
    examples: [
      { id: "quiet-station-desk", text: "quiet flat near the station with a desk" },
      { id: "pets-parking", text: "pet-friendly cottage with parking" },
      { id: "family-cot-garden", text: "family home with a cot and garden" },
      { id: "contractor", text: "contractor stay with parking and a washing machine" },
      { id: "step-free-hospital", text: "step-free flat near the hospital" },
      { id: "remote-wifi", text: "fast wifi for working remotely" },
      { id: "weekly-kitchen", text: "weekly stay with a full kitchen" },
      { id: "late-arrival", text: "self check-in late arrival" },
    ],
    /** Query words → needs. Longer phrases are matched first. */
    triggers: [
      { words: ["quiet", "peaceful", "peace and quiet"], needs: ["quiet"] },
      { words: ["station", "tube", "train", "metro", "tram", "underground"], needs: ["near-transport"] },
      { words: ["desk", "office", "workspace"], needs: ["workspace"] },
      { words: ["work", "working", "remote", "remotely", "remote work"], needs: ["workspace", "fast-wifi"] },
      { words: ["wifi", "wi-fi", "internet", "broadband"], needs: ["fast-wifi"] },
      { words: ["dog", "dogs", "pet", "pets", "cat", "cats", "pet-friendly", "dog-friendly"], needs: ["pets"] },
      { words: ["parking", "car", "van", "park"], needs: ["parking"] },
      { words: ["family", "families", "kids", "children", "baby", "cot"], needs: ["family"] },
      { words: ["garden", "outdoor", "outside", "patio"], needs: ["outdoor"] },
      { words: ["step-free", "wheelchair", "accessible", "ground floor"], needs: ["step-free"] },
      { words: ["week", "weekly", "month", "monthly", "long stay"], needs: ["long-stay"] },
      { words: ["kitchen", "cook", "cooking"], needs: ["kitchen"] },
      { words: ["washing", "washing machine", "laundry"], needs: ["laundry"] },
      { words: ["self check-in", "late arrival", "keypad", "late check-in"], needs: ["self-checkin"] },
    ],
    /** Words that carry no need on their own (not listed as "Not checked"). */
    ignore: [
      "a", "an", "the", "and", "or", "with", "for", "near", "close", "to", "in", "on", "at", "of", "by", "my", "our", "me", "we", "i", "is", "it", "that", "has", "have", "some", "any", "good", "nice", "full", "fast", "late",
      "stay", "stays", "place", "home", "flat", "apartment", "house", "cottage", "studio", "room", "loft", "bungalow", "lodge", "cabin", "let", "rental", "airbnb", "machine", "friendly", "arrival", "contractor", "contractors",
    ],
    labels: {
      illustration: "Illustration: shows whether your listing states the facts a guest is asking for. Airbnb hasn’t published how its AI search works.",
      found: "Found:",
      foundAmenity: "Found: {amenity} is ticked in your amenities",
      foundBeds: "Found: you said bed sizes are listed for every bedroom",
      foundParking: "Found: parking situation stated ({label})",
      missing: "Missing. Add:",
      place: "Near {place}",
      placeSuggestion: "Add ‘{n}-minute walk to {place}’.",
      notChecked: "Not checked: {words}",
      summary: "Your listing answers {covered} of {total} needs in this search.",
      all: "Clear match: every need has evidence.",
      some: "Partial match: add the missing facts.",
      none: "No clear evidence for this search.",
      nothing: "We couldn’t find a guest need in that search. Try one of the examples.",
    },
  },

  /** Highlights in "Your text". */
  highlights: {
    counts: "{vague} vague words · {units} facts with units · {phrases} ‘minutes to’ phrases",
    vague: "Vague word",
    fact: "Fact with a unit",
    phrase: "Minutes to a place",
  },
};

/** Character limits for the title and description sections (Airbnb, VERIFY). */
export const limits = {
  title: 50,
  sections: [
    { id: "description", label: "Listing description", limit: 500, required: true },
    { id: "space", label: "The space", limit: 10000, required: false },
    { id: "access", label: "Guest access", limit: 10000, required: false },
    { id: "notes", label: "Other things to note", limit: 10000, required: false },
  ],
  helper:
    "In the Airbnb app: Listings › your listing › Listing editor › Your space › Description. ‘Listing description’ is the main box; ‘The space’, ‘Guest access’ and ‘Other things to note’ are under ‘More about your space’ (names can vary).",
};

/** Background source shown on the page. */
export const source = {
  title: "Airbnb Newsroom: 2026 Fall Update",
  url: "https://news.airbnb.com/",
  date: "2026-09-30",
};
