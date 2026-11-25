/**
 * AI-ready description builder: templates v1 (stored content).
 *
 * Seeded into the `figures` table as structured content and read from there,
 * so every sentence template, short form, tone swap, compaction step,
 * honest-note sentence and label can be edited without a code change. Bump
 * `version` when the output changes. The section names and character limits
 * are the AI-readiness scorer's stored limits (aiReadiness.limits), so both
 * tools always agree.
 *
 * Templates: {token} is replaced with the host's fact; text in [square
 * brackets] is dropped when any token inside it is empty; a sentence whose
 * required token is empty is left out. No template may contain a word from
 * the scorer's vague list (tested).
 */

export const templates = {
  version: 1,
  versionDate: "2026-11-25",

  /* ---- Listing description ------------------------------------------------ */

  listing: {
    /** Hooks. {Place1} = the first place's minutes phrase, as a sentence. {where} = the area, or the town if no area. */
    hooks: {
      feature: "{bedroomsPhrase} {type}[ in {where}] with {standout}.[ {Place1}.]",
      place: "{Place1}: a {bedroomsPhrase} {type}[ in {where}] with {standout}.",
      guest: "For {guestList}: a {bedroomsPhrase} {type}[ in {where}] with {standout}.[ {Place1}.]",
    },
    /** Studios (0 bedrooms). */
    studioHooks: {
      feature: "Studio[ in {where}] with {standout}.[ {Place1}.]",
      place: "{Place1}: a studio[ in {where}] with {standout}.",
      guest: "For {guestList}: a studio[ in {where}] with {standout}.[ {Place1}.]",
    },
    bedroomsPhrase: "{n}-bedroom",
    /** Sentence 2. `guest` is used with the Guest-first hook (the guests are already named). */
    idealFor: "Ideal for {guestList}: {facts}.",
    idealForGuestHook: "With {facts}.",
    /** Sentence 3. */
    keyFacts: "[{size} m², ]sleeps {maxGuests}[: {bedsSummary}].",
    /** Sentence 4: places 2 and 3. */
    morePlaces: "{place2}[ and {place3}].",
    /** Sentence 5. */
    honest: "Please note: {honest}.",
  },

  /* ---- The space ------------------------------------------------------------ */

  space: {
    bedroom: "Bedroom {n}: {bed}[, {ensuite}].",
    sleeping: "Sleeping area: {bed}.",
    bathrooms: "{bathroomsPhrase}[ with a {bathTypes}].",
    bathroomsOne: "1 bathroom",
    bathroomsMany: "{n} bathrooms",
    workspace: "Workspace: {workspaceKit}[ in {workspaceLocation}].",
    wifi: "Wi-Fi: {mbps} Mbps.",
    kitchen: "Kitchen: {kitchen}.",
    laundry: "Laundry: {laundry}.",
    heating: "Heating and cooling: {heating}.",
    quiet: "{Quiet}.",
    outdoor: "{Outdoor}[ with seating for {seating}].",
    family: "Family kit: {family}.",
    pets: "Dogs welcome[ (up to {maxDogs})].",
    morePlaces: "Also nearby: {places}.",
    /** Moved here by "Make it fit" step 5 (the second ideal-for fact), unless it's already in The space. */
    movedFact: "Also: {fact}.",
  },

  /* ---- Guest access ---------------------------------------------------------- */

  access: {
    whole: "You’ll have the whole {type} to yourself.",
    privateRoom: "You’ll have a private room[ and share the {shared}].",
    checkIn: "Self check-in with a {method}[ from {checkinTime}].",
    meet: "We’ll meet you to hand over the keys[ from {checkinTime}].",
    checkInTimeOnly: "Check-in from {checkinTime}.",
    checkOut: "Check-out by {checkoutTime}.",
    parking: {
      drivewayFree: "Free parking on the driveway[ for {cars}].",
      streetFree: "Free on-street parking[ for {cars}].",
      permit: "Permit parking: we’ll leave a permit[ for {cars}].",
      paidNearby: "Paid car park nearby.",
      none: "No parking at the property. The nearest car park is listed in the welcome guide.",
    } as Record<string, string>,
    cars: { one: "1 car", many: "{n} cars" },
    floor: "The {type} is on the {floorPhrase}[ {lift}].",
    liftYes: ", with a lift",
    liftNo: "and there’s no lift",
    longStays: "Weekly and monthly stays welcome.",
  },

  /* ---- Other things to note -------------------------------------------------- */

  notes: {
    houseRulesTimes: "House rules: check-in from {checkin}, check-out by {checkout}.",
    pets: { no: "No pets.", yes: "Pets welcome[ (up to {maxPets})].", ask: "Pets considered: please ask before booking." } as Record<string, string>,
    parties: "No parties or events.",
    assistanceDogs: "Assistance dogs are always welcome.",
  },

  /**
   * Honest notes: `short` for the listing description, `sentence` for Other
   * things to note. {floorPhrase} and {type} are filled when known; the
   * fallbacks are used when they aren't.
   */
  honest: [
    { id: "stairsNoLift", label: "Stairs and no lift", short: "{floorPhrase}, no lift", shortFallback: "stairs and no lift", sentence: "The {type} is on the {floorPhrase} and there’s no lift.", sentenceFallback: "There are stairs and no lift." },
    { id: "steepStairs", label: "Steep stairs", short: "steep stairs", sentence: "The stairs are steep." },
    { id: "streetNoise", label: "Street or traffic noise", short: "some street noise", sentence: "You may hear street or traffic noise." },
    { id: "busyRoad", label: "Near a busy road", short: "near a busy road", sentence: "The {type} is near a busy road.", sentenceFallback: "The property is near a busy road." },
    { id: "compactKitchen", label: "Compact kitchen", short: "a compact kitchen", sentence: "The kitchen is compact." },
    { id: "sharedEntrance", label: "Shared entrance", short: "a shared entrance", sentence: "The entrance is shared with other residents." },
    { id: "noParking", label: "No parking", short: "no parking", sentence: "There’s no parking at the property." },
    { id: "works", label: "Building works nearby", short: "building works nearby", sentence: "There are building works nearby, so you may hear noise during the day." },
    { id: "notYoungChildren", label: "Not suitable for young children", short: "not suitable for young children", sentence: "The {type} isn’t suitable for young children.", sentenceFallback: "The property isn’t suitable for young children." },
    { id: "lowCeilings", label: "Low ceilings", short: "low ceilings", sentence: "Some ceilings are low." },
  ] as { id: string; label: string; short: string; shortFallback?: string; sentence: string; sentenceFallback?: string }[],

  /* ---- Facts for "Ideal for" (by guest need, from the scorer's needs dictionary) */

  /**
   * The phrase for each need when the host has the fact. The first two
   * available, in the needs dictionary's order for the first guest type, are
   * used in sentence 2.
   */
  needFacts: {
    "fast-wifi": "{mbps} Mbps Wi-Fi",
    workspace: "{workspaceKit}[ in {workspaceLocation}]",
    quiet: "{quietFact}",
    "near-transport": "{transportPlace}",
    parking: "{parkingFact}",
    "self-checkin": "self check-in with a {method}",
    kitchen: "a kitchen with {kitchen}",
    laundry: "a {laundry}",
    family: "a {family}",
    outdoor: "a {outdoor}",
    pets: "dogs welcome",
    "step-free": "{stepFree}",
    "long-stay": "weekly and monthly stays",
    sleeping: "{bedsSummary}",
  } as Record<string, string>,
  parkingFacts: { drivewayFree: "free parking on the driveway", streetFree: "free on-street parking", permit: "permit parking", paidNearby: "a paid car park nearby" } as Record<string, string>,
  stepFreeFacts: { ground: "a ground-floor entrance", lift: "a lift" },

  /* ---- Words ------------------------------------------------------------------- */

  words: {
    types: { flat: "flat", house: "house", cottage: "cottage", studio: "studio", room: "room", loft: "loft", bungalow: "bungalow", cabin: "cabin", other: "home" } as Record<string, string>,
    guests: { remote: "remote workers", contractors: "contractors", families: "families", couples: "couples", business: "business travellers", pets: "pet owners", groups: "groups", stepFree: "guests needing step-free access" } as Record<string, string>,
    bedsLong: { superKing: "super king bed", king: "king bed", double: "double bed", smallDouble: "small double bed", single: "single bed", twin: "twin single beds", bunk: "bunk beds", sofaBed: "sofa bed", cot: "cot available" } as Record<string, string>,
    bedsShort: { superKing: "super king", king: "king", double: "double", smallDouble: "small double", single: "single", twin: "twin singles", bunk: "bunk beds", sofaBed: "sofa bed", cot: "cot" } as Record<string, string>,
    bedsSummaryItem: "{bed} in bedroom {n}",
    ensuite: "ensuite",
    bathTypes: { shower: "shower", bath: "bath" } as Record<string, string>,
    workspace: { desk: "a desk", deskChair: "a desk and chair", full: "a desk, chair and monitor" } as Record<string, string>,
    kitchen: { oven: "oven", hob: "hob", microwave: "microwave", dishwasher: "dishwasher", fridgeFreezer: "fridge-freezer", kettle: "kettle", toaster: "toaster", coffee: "coffee machine", basics: "washing-up basics" } as Record<string, string>,
    laundry: { washer: "washing machine", dryer: "tumble dryer", rack: "drying rack", iron: "iron" } as Record<string, string>,
    heating: { central: "central heating", underfloor: "underfloor heating", logBurner: "log burner", fan: "fan", aircon: "air conditioning" } as Record<string, string>,
    outdoor: { balcony: "balcony", patio: "patio", privateGarden: "private garden", sharedGarden: "shared garden", roofTerrace: "roof terrace" } as Record<string, string>,
    family: { travelCot: "travel cot", highChair: "high chair", stairGate: "stair gate" } as Record<string, string>,
    shared: { kitchen: "kitchen", bathroom: "bathroom", living: "living room", garden: "garden" } as Record<string, string>,
    checkIn: { keypad: "keypad", keySafe: "key safe", smartLock: "smart lock" } as Record<string, string>,
    floors: { ground: "ground floor", "1": "first floor", "2": "second floor", "3": "third floor or above" } as Record<string, string>,
    /** "Why it's quiet": street chips merge into one place; extras follow "with". */
    quiet: {
      places: { quietStreet: "quiet street", residential: "residential street", culDeSac: "cul-de-sac" } as Record<string, string>,
      merged: { "quietStreet+residential": "quiet residential street" } as Record<string, string>,
      extras: { doubleGlazing: "double glazing", noThrough: "no through traffic" } as Record<string, string>,
      sentence: "{place}[ with {extras}]",
      extrasOnly: "{extras}",
      article: "a {place}",
    },
  },

  /** Minutes phrases (same forms as the scorer's "minutes to a place" pattern). {n}, {place}. */
  minutes: {
    walk: "{n}-minute walk to {place}",
    drive: "{n}-minute drive to {place}",
    cycle: "{n}-minute cycle to {place}",
    bus: "{n} minutes by bus to {place}",
    train: "{n} minutes by train to {place}",
    tram: "{n} minutes by tram to {place}",
    tube: "{n} minutes by tube to {place}",
  } as Record<string, string>,
  /** "Make it fit" step 3: short forms (still match the scorer's pattern). */
  minutesShort: {
    walk: "{n}-min walk to {place}",
    drive: "{n}-min drive to {place}",
    cycle: "{n}-min cycle to {place}",
    bus: "{n} min by bus to {place}",
    train: "{n} min by train to {place}",
    tram: "{n} min by tram to {place}",
    tube: "{n} min by tube to {place}",
  } as Record<string, string>,
  /** Place types that count as transport (for the "near transport" fact). */
  transportTypes: ["station"],
  transportModes: ["train", "tram", "tube", "bus"],

  /** Warm tone: connecting words only (never facts). Applied in order, whole phrases. */
  warm: [
    { from: "Please note:", to: "Good to know:" },
    { from: "Ideal for ", to: "Made for " },
    { from: "With ", to: "You’ll find " },
    { from: "Also nearby:", to: "Also close by:" },
    { from: "You’ll have the whole", to: "You get the whole" },
    { from: "We’ll meet you", to: "We’ll be there" },
  ],

  /**
   * "Make it fit": applied one at a time until the listing description fits.
   * Nothing is deleted: each item moves to another section.
   */
  fitSteps: [
    { id: "signOff", label: "your sign-off", to: "notes" },
    { id: "place3", label: "the third place", to: "space" },
    { id: "short", label: "long forms (short forms used)", to: "listing" },
    { id: "honest", label: "the honest note", to: "notes" },
    { id: "fact2", label: "the second ‘ideal for’ fact", to: "space" },
  ] as { id: "signOff" | "place3" | "short" | "honest" | "fact2"; label: string; to: "listing" | "space" | "access" | "notes" }[],
  fitMessages: {
    moved: "Moved {item} to {section}.",
    shortened: "Used short forms in the {section}.",
    still: "Shorten your standout feature or area name.",
    over: "Over by {n} characters",
  },

  /** Section labels (the scorer's stored names are used for the limits). */
  sectionNames: { listing: "Listing description", space: "The space", access: "Guest access", notes: "Other things to note" },

  /** Limits on what the host types. */
  inputLimits: { standout: 60, honestCustom: 100, signOff: 60, parkingNote: 80, places: 5, minutes: 120 },

  /** "What this means". */
  meaning: {
    good: "Your description is clear and within the limits. Read it once out loud, check every fact, then copy each section into Airbnb.",
    over: "Your listing description is {n} characters too long. Use ‘Make it fit’ or shorten the highlighted sentence.",
    missing: "Add {need} for {guest} to make your description answer what they search for.",
    building: "Keep adding facts: each one gives guests, and search, something specific to match.",
    goodFrom: 50,
  },

  /** "Try an example": the test 1 fixture, clearly labelled as example data. */
  example: {
    propertyType: "flat",
    bedrooms: 2,
    maxGuests: 4,
    sizeM2: 45,
    area: "Ancoats",
    town: "",
    floor: "2",
    lift: false,
    standout: "a canal view from the living room",
    guestTypes: ["remote", "couples"],
    beds: ["king", "double"],
    ensuites: [false, false],
    bathrooms: 1,
    bathTypes: [],
    workspace: "full",
    workspaceLocation: "bedroom 2",
    wifiMbps: 300,
    kitchen: [],
    laundry: [],
    heating: [],
    outdoor: "",
    outdoorSeating: null,
    family: [],
    dogs: false,
    maxDogs: null,
    quiet: [],
    checkIn: "",
    checkInTime: "",
    checkOutTime: "",
    parking: "",
    parkingSpaces: null,
    parkingNote: "",
    privacy: "whole",
    sharedAreas: [],
    longStays: false,
    places: [
      { name: "Piccadilly station", minutes: 12, mode: "walk", type: "station" },
      { name: "Northern Quarter", minutes: 5, mode: "walk", type: "cityCentre" },
      { name: "Etihad Stadium", minutes: 10, mode: "drive", type: "stadium" },
    ],
    honest: ["stairsNoLift"],
    honestCustom: "",
    tone: "plain",
    hook: "feature",
    signOff: "",
    houseRules: null,
  },
};
