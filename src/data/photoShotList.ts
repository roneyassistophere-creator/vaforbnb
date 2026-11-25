/**
 * Photo shot list planner: rules v1 (stored content).
 *
 * Seeded into the `figures` table as structured content and read from there,
 * so every order list, guest-type priority, per-item count, shot and staging
 * template, caption template, light and season tip and prep checklist can be
 * edited without a code change. Bump `version` when the output changes.
 *
 * Item kinds (what a shot is of): view, livingSpace, kitchenDiner, sleeping,
 * bedroom, kitchen, dining, bathroom, ensuite, workspace, laundry, outdoor,
 * hotTub, pool, gamesRoom, gym, fireplace, stairs, entrance, parking, access,
 * evCharger, local.
 *
 * Caption templates: {token} is replaced with the host's fact; text in
 * [square brackets] is dropped when any token inside it is empty. A caption
 * never contains a fact the host didn't enter.
 */

export const rules = {
  version: 1,
  versionDate: "2026-11-25",

  /* ---- Order ---------------------------------------------------------- */

  /**
   * First five. Slot 1 is the standout (cover). Slots 2–5 start at `slots[n]`
   * in `fill`; if that item doesn't exist or is already used, the next item
   * in `fill` is tried. No item appears twice.
   *  livingSpace = living room, or the kitchen-diner if open plan (a studio's main room)
   *  mainBedroom = bedroom 1 (a studio's sleeping area)
   *  kitchen     = kitchen, or the kitchen-diner
   *  secondOrPriority = the second selling point, or the guest-type priority
   */
  firstFive: {
    slots: ["livingSpace", "mainBedroom", "kitchen", "secondOrPriority"],
    fill: ["livingSpace", "mainBedroom", "kitchen", "secondOrPriority", "bathroom1", "bedroom2", "outdoor", "workspace"],
  },

  /**
   * Guest-type priority for slot 5 (when no second selling point is chosen):
   * the first guest type picked, the first of its items that exists and isn't
   * used. None → `fallback`. Items: workspace, view, parking, laundry,
   * outdoor, twinBunkBedroom, bathroom1, entrance, dining, livingSpace,
   * stepFreeEntrance, walkInShower.
   */
  guestPriority: {
    remote: [
      { item: "workspace", reason: "Remote workers look for a workspace." },
      { item: "view", reason: "Remote workers spend long days inside, so a view helps." },
    ],
    contractors: [
      { item: "parking", reason: "Contractors need to know where the van goes." },
      { item: "laundry", reason: "Contractors on longer stays look for laundry." },
    ],
    families: [
      { item: "outdoor", reason: "Families look for outside space." },
      { item: "twinBunkBedroom", reason: "Families look for where the children sleep." },
    ],
    couples: [
      { item: "view", reason: "Couples are drawn to a view." },
      { item: "bathroom1", reason: "Couples look closely at the bathroom." },
    ],
    business: [
      { item: "workspace", reason: "Business travellers look for a workspace." },
      { item: "entrance", reason: "Business travellers arrive late and look for self check-in." },
    ],
    pets: [
      { item: "outdoor", reason: "Pet owners look for outside space." },
      { item: "entrance", reason: "Pet owners check how they get in and out." },
    ],
    groups: [
      { item: "dining", reason: "Groups look for somewhere to eat together." },
      { item: "livingSpace", reason: "Groups look for space to sit together." },
    ],
    stepFree: [
      { item: "stepFreeEntrance", reason: "Guests needing step-free access check the entrance first." },
      { item: "walkInShower", reason: "Guests needing step-free access check the shower." },
    ],
  } as Record<string, { item: string; reason: string }[]>,
  guestPriorityFallback: { item: "bathroom1", reason: "Guests always look at the bathroom." },

  /** Why each first-five slot is there. */
  slotReasons: {
    cover: "Your standout feature is your cover photo: the big image in search.",
    livingSpace: "The living space is the next thing guests look for.",
    mainBedroom: "Guests want to see where they’ll sleep.",
    kitchen: "Guests check the kitchen early, especially for longer stays.",
    second: "Your second selling point, chosen by you.",
    bathroom1: "Guests always look at the bathroom.",
    bedroom2: "Shows there’s room for everyone.",
    outdoor: "Outside space helps a listing stand out.",
    workspace: "A workspace matters to a lot of guests.",
  } as Record<string, string>,

  /**
   * Photo tour: every remaining item, in this order. `group`: tour = "Photo
   * tour", extras = "Extras and honesty shots".
   */
  tourOrder: [
    { kind: "bedroom", group: "tour" },
    { kind: "bathroom", group: "tour" },
    { kind: "ensuite", group: "tour" },
    { kind: "dining", group: "tour" },
    { kind: "workspace", group: "tour" },
    { kind: "laundry", group: "tour" },
    { kind: "outdoor", group: "tour" },
    { kind: "view", group: "tour" },
    { kind: "hotTub", group: "tour" },
    { kind: "pool", group: "tour" },
    { kind: "gamesRoom", group: "tour" },
    { kind: "gym", group: "tour" },
    { kind: "fireplace", group: "tour" },
    { kind: "stairs", group: "extras" },
    { kind: "entrance", group: "extras" },
    { kind: "parking", group: "extras" },
    { kind: "access", group: "extras" },
    { kind: "evCharger", group: "extras" },
    { kind: "local", group: "extras" },
  ] as { kind: string; group: "tour" | "extras" }[],
  tourReasons: {
    tour: "Photo tour: every room needs at least one photo to appear there.",
    extras: "Extras: shows guests how they arrive, park and get around.",
    more: "More of a room from your first five.",
    honesty: "Honesty shot: helps avoid surprises.",
  },
  /** Local area shots: at most this many places. */
  maxPlaces: 3,
  /** Kinds counted in "[n] rooms in the photo tour". */
  roomKinds: ["livingSpace", "kitchenDiner", "sleeping", "bedroom", "kitchen", "dining", "bathroom", "ensuite", "workspace", "laundry", "outdoor", "gamesRoom", "gym"],

  /** Honest notes. `adds`: the shot it adds (stairs, or a shared entrance). */
  honestNotes: [
    { id: "stairsNoLift", label: "Stairs and no lift", adds: "stairs" },
    { id: "steepStairs", label: "Steep stairs", adds: "stairs" },
    { id: "sharedEntrance", label: "Shared entrance", adds: "sharedEntrance" },
    { id: "compactKitchen", label: "Compact kitchen" },
    { id: "streetNoise", label: "Street noise" },
    { id: "lowCeilings", label: "Low ceilings" },
    { id: "noOutdoor", label: "No outside space" },
  ] as { id: string; label: string; adds?: "stairs" | "sharedEntrance" }[],

  /* ---- Shots per item -------------------------------------------------- */

  /**
   * Shots per item kind, each with its type and orientation. The first shot
   * of the standout is the cover. Total photos = the sum over all items.
   */
  shots: {
    view: [{ id: "wide", type: "wide" }],
    livingSpace: [
      { id: "wide", type: "wide" },
      { id: "opposite", type: "wide" },
      { id: "detail", type: "detail" },
    ],
    kitchenDiner: [
      { id: "wide", type: "wide" },
      { id: "opposite", type: "wide" },
      { id: "detail", type: "detail" },
    ],
    sleeping: [
      { id: "wide", type: "wide" },
      { id: "detail", type: "detail" },
    ],
    bedroom: [
      { id: "wide", type: "wide" },
      { id: "detail", type: "detail" },
    ],
    kitchen: [
      { id: "wide", type: "wide" },
      { id: "detail", type: "detail" },
    ],
    bathroom: [{ id: "wide", type: "wide" }],
    ensuite: [{ id: "wide", type: "wide" }],
    outdoor: [
      { id: "wide", type: "wide" },
      { id: "detail", type: "detail" },
    ],
    default: [{ id: "wide", type: "wide" }],
  } as Record<string, { id: string; type: "wide" | "detail" }[]>,
  shotTypeLabels: { wide: "Wide", detail: "Detail" },
  orientation: "Landscape",

  /** "About [n] photos": a warning outside this range. Airbnb asks for at least `platformMin`. VERIFY. */
  photoCount: { min: 15, max: 40, platformMin: 5, typicalFrom: 20, typicalTo: 30 },
  photoCountWarnings: {
    low: "That’s only about {n} photos. Most homes need at least {min} to show every space.",
    high: "That’s about {n} photos. More than {max} can feel like a lot to scroll: keep the strongest of each room.",
  },

  /* ---- What to show and staging (per item kind and shot) ---------------- */

  templates: {
    view: { wide: { show: ["Shoot through an open window or from outside, with a little of the room in frame", "Keep the horizon level", "Make sure the view looks as it does on an ordinary day"], staging: ["Clean the window inside and out", "Move anything off the windowsill"] } },
    livingSpace: {
      wide: { show: ["Shoot from the corner by the door at chest height", "Get as much of the room in as you can without bending walls", "Lights on, blinds open"], staging: ["Plump the cushions and fold any throws", "Clear the coffee table except one item", "Hide remotes, cables and chargers"] },
      opposite: { show: ["Shoot from the opposite corner, so guests see the whole room", "Include the window if you can"], staging: ["Straighten rugs and furniture", "TV screen off"] },
      detail: { show: ["A close-up of what makes the room comfortable: the sofa, a reading corner or the fireplace", "Keep it in focus and well lit"], staging: ["One simple prop, like a book or a plant", "No personal photos or clutter"] },
    },
    kitchenDiner: {
      wide: { show: ["Shoot from the corner so the kitchen and dining area are both in frame", "Chest height, lights on, blinds open"], staging: ["Clear the worktops except the kettle and one item", "Chairs tucked in", "Tea towels folded"] },
      opposite: { show: ["Shoot from the dining end towards the kitchen", "Show how many people the table seats"], staging: ["Table clear or simply laid", "Bins and recycling out of sight"] },
      detail: { show: ["The appliances guests ask about: oven, hob, dishwasher, coffee machine", "Close enough to read what they are"], staging: ["Wipe fingerprints off steel and glass", "No washing-up liquid or sponges on show"] },
    },
    sleeping: {
      wide: { show: ["Shoot from the corner so guests see where the bed sits in the room", "Show the whole bed and the space around it"], staging: ["Crisp white bedding, pillows plumped", "Clear surfaces near the bed"] },
      detail: { show: ["A close-up of the bed and bedside light", "Show how the space is separated, if it is"], staging: ["Lamp on", "Hide cables and chargers"] },
    },
    bedroom: {
      wide: { show: ["Shoot from the doorway corner at chest height", "Show the whole bed and a bedside table", "Blinds open, lamps on"], staging: ["Crisp white bedding, pillows plumped", "Clear bedside tables", "Hide cables and chargers"] },
      detail: { show: ["A close-up of the bed so guests can see its size and the bedding", "Include the bedside lamp or storage"], staging: ["Smooth the duvet and straighten the pillows", "One folded towel or throw at most"] },
    },
    kitchen: {
      wide: { show: ["Shoot from the corner so the worktops and appliances are in frame", "Chest height, lights on, including under-cabinet lights"], staging: ["Clear the worktops except the kettle and one item", "Tea towels folded", "Bins out of sight"] },
      detail: { show: ["The appliances guests ask about: oven, hob, dishwasher, coffee machine", "Close enough to read what they are"], staging: ["Wipe fingerprints off steel and glass", "No washing-up liquid or sponges on show"] },
    },
    dining: { wide: { show: ["Shoot from a corner so guests can count the chairs", "Include the window or the room it sits in"], staging: ["Table clear or simply laid", "Chairs tucked in evenly"] } },
    bathroom: { wide: { show: ["Shoot from the doorway at chest height", "Show the shower or bath, the basin and the mirror", "Avoid catching yourself in the mirror"], staging: ["Toilet seat down", "Fresh towels folded on the rail", "No toiletries on show"] } },
    ensuite: { wide: { show: ["Shoot from the bedroom doorway into the ensuite, or from inside", "Show the shower and basin"], staging: ["Toilet seat down", "Fresh towels folded", "No toiletries on show"] } },
    workspace: { wide: { show: ["Shoot from behind the chair, so guests see the desk, chair and screen", "Include the window or lamp", "Show the plug sockets near the desk"], staging: ["Clear the desk except a lamp and a notebook", "Tidy cables out of sight"] } },
    laundry: { wide: { show: ["Show the washing machine (and dryer) clearly", "Include the drying rack or utility space"], staging: ["Doors closed", "No laundry or detergent on show"] } },
    outdoor: {
      wide: { show: ["Shoot from the house looking out, so guests see the whole space", "Show the seating and how private it is"], staging: ["Sweep and tidy the space", "Cushions out on the chairs", "Bins and hoses out of sight"] },
      detail: { show: ["A close-up of the seating, plants or the best spot to sit", "Show what guests will actually use"], staging: ["Table wiped and simply laid", "Remove dead plants"] },
    },
    hotTub: { wide: { show: ["Show the hot tub with the cover off and the water clear", "Include where it sits, so guests know how private it is"], staging: ["Clean the water and the surround", "Towels folded nearby"] } },
    pool: { wide: { show: ["Show the pool and the area around it", "Keep the water clear and still"], staging: ["Skim the water", "Loungers straight"] } },
    gamesRoom: { wide: { show: ["Show the whole room and what’s in it", "Shoot from the corner at chest height"], staging: ["Games tidied away or set up neatly", "Lights on"] } },
    gym: { wide: { show: ["Show each machine or piece of equipment clearly", "Include the room it’s in"], staging: ["Wipe down the equipment", "Weights racked"] } },
    fireplace: { wide: { show: ["Show the fireplace or log burner as part of the room", "Lit if it’s safe and allowed"], staging: ["Clean the glass", "Logs stacked neatly"] } },
    stairs: { wide: { show: ["Show the stairs guests will use, from the bottom", "Show how steep and narrow they are, honestly"], staging: ["Clear the stairs", "Lights on"] } },
    entrance: { wide: { show: ["Show the front door as guests will see it on arrival", "Include the key safe, keypad or lock, without showing any code"], staging: ["Sweep the step", "Bins out of sight"] } },
    parking: { wide: { show: ["Show exactly where guests park", "Include a landmark so they can find it"], staging: ["Cars off the driveway if you can", "Clear any bins or bikes"] } },
    access: { wide: { show: ["Show the feature clearly, with enough of the room for scale", "Shoot straight on so widths and levels are easy to judge"], staging: ["Clear the path or space around it", "Lights on"] } },
    evCharger: { wide: { show: ["Show the charger and where a car would park to use it"], staging: ["Cable coiled neatly"] } },
    local: { wide: { show: ["A clear shot of the place, taken on an ordinary day", "Only use a photo you took yourself"], staging: ["No people’s faces in the frame", "Keep it honest: no heavy filters"] } },
  } as Record<string, Record<string, { show: string[]; staging: string[] }>>,

  /* ---- Labels and captions --------------------------------------------- */

  labels: {
    view: "{view} view",
    livingSpace: "Living room",
    studioLiving: "Main room",
    kitchenDiner: "Kitchen-diner",
    sleeping: "Sleeping area",
    bedroom: "Bedroom {n}",
    kitchen: "Kitchen",
    dining: "Dining area",
    bathroom: "Bathroom {n}",
    ensuite: "Ensuite (bedroom {n})",
    workspace: "Workspace",
    laundry: "Laundry",
    hotTub: "Hot tub",
    pool: "Pool",
    gamesRoom: "Games room",
    gym: "Gym",
    fireplace: "Fireplace or log burner",
    stairs: "Stairs",
    entrance: "Entrance",
    sharedEntrance: "Shared entrance",
    parking: "Parking",
    evCharger: "EV charger",
    local: "Local area: {place}",
  } as Record<string, string>,

  captions: {
    view: "{view} view[ from the {viewFrom}]",
    livingSpace: "Living room[, {size} m² in total]",
    studioLiving: "Main room[, {size} m² in total]",
    kitchenDiner: "Open-plan kitchen-diner[ with {kitchenItems}]",
    sleeping: "Sleeping area[: {bed}]",
    bedroom: "Bedroom {n}[: {bed}][, {blackout}][, {ensuite}]",
    kitchen: "Kitchen[ with {kitchenItems}]",
    dining: "Dining area",
    bathroom: "Bathroom {n}",
    ensuite: "Ensuite to bedroom {n}",
    workspace: "Desk[, {workspaceKit}][ in {workspaceLocation}][, {mbps} Mbps Wi-Fi]",
    laundry: "{laundry}",
    outdoor: "{outdoor}",
    hotTub: "Hot tub",
    pool: "Pool",
    gamesRoom: "Games room",
    gym: "Gym",
    fireplace: "Fireplace or log burner",
    stairs: "Stairs[ to the {floor} floor][ ({noLift})]",
    entrance: "[Self check-in with a {checkIn}][ from {checkInTime}]",
    entranceNoMethod: "Front entrance",
    sharedEntrance: "Shared entrance[, self check-in with a {checkIn}][ from {checkInTime}]",
    parking: "{parkingType}[ for {parkingSpaces}]",
    access: "{access}",
    evCharger: "EV charger",
    local: "{minutesPhrase}",
    localNoMinutes: "{place}",
  } as Record<string, string>,
  /** Caption character limit (shown as a counter). VERIFY: Airbnb doesn't publish one. */
  captionLimit: 250,

  /** Words used in captions. */
  words: {
    beds: { superKing: "super king bed", king: "king bed", double: "double bed", smallDouble: "small double bed", single: "single bed", twin: "twin single beds", bunk: "bunk beds", sofaBed: "sofa bed" } as Record<string, string>,
    blackout: "blackout blinds",
    ensuite: "ensuite",
    workspaceFull: "chair and monitor",
    noLift: "no lift",
    floors: { ground: "ground", "1": "first", "2": "second", "3": "third", "4": "fourth" } as Record<string, string>,
    views: { canal: "Canal", sea: "Sea", river: "River", city: "City", countryside: "Countryside", park: "Park" } as Record<string, string>,
    checkIn: { keySafe: "key safe", keypad: "keypad", smartLock: "smart lock" } as Record<string, string>,
    parking: { driveway: "Driveway parking", garage: "Garage parking", street: "Street parking", permit: "Permit parking", carPark: "Car park nearby" } as Record<string, string>,
    cars: { one: "1 car", many: "{n} cars" },
    laundry: { washer: "washing machine", dryer: "tumble dryer", utility: "utility room" } as Record<string, string>,
    laundryJoin: "{first}[ and {rest}]",
    outdoor: { balcony: "Balcony", patio: "Patio", privateGarden: "Private garden", sharedGarden: "Shared garden", roofTerrace: "Roof terrace" } as Record<string, string>,
    access: { stepFree: "Step-free entrance", wideDoors: "Wide doorways", walkInShower: "Walk-in shower", grabRails: "Grab rails", groundFloorBedroom: "Ground-floor bedroom" } as Record<string, string>,
    extras: { hotTub: "Hot tub", fireplace: "Fireplace or log burner", gamesRoom: "Games room", gym: "Gym", evCharger: "EV charger", pool: "Pool" } as Record<string, string>,
    kitchenItems: ["oven", "hob", "microwave", "dishwasher", "fridge-freezer", "kettle", "toaster", "coffee machine", "air fryer", "slow cooker"],
  },

  /**
   * Minutes phrase, shared with the description builder: "12-minute walk to
   * Piccadilly station". {n} minutes, {place}.
   */
  minutesPhrases: { walk: "{n}-minute walk to {place}", drive: "{n}-minute drive to {place}", bus: "{n} minutes by bus to {place}", train: "{n} minutes by train to {place}", tube: "{n} minutes by tube to {place}", cycle: "{n}-minute cycle to {place}" } as Record<string, string>,

  /** Standout and second selling point: these kinds can be chosen (when ticked). */
  standoutKinds: ["view", "outdoor", "hotTub", "pool", "fireplace", "gamesRoom", "gym", "livingSpace", "kitchenDiner", "kitchen", "mainBedroom", "workspace", "dining"],

  /** Who usually stays (same ids as the AI-readiness scorer). */
  guestTypes: [
    { id: "remote", label: "Remote workers" },
    { id: "contractors", label: "Contractors" },
    { id: "families", label: "Families" },
    { id: "couples", label: "Couples" },
    { id: "business", label: "Business travellers" },
    { id: "pets", label: "Pet owners" },
    { id: "groups", label: "Groups" },
    { id: "stepFree", label: "Guests needing step-free access" },
  ],
  maxGuestTypes: 3,

  /* ---- Light ------------------------------------------------------------ */

  light: {
    east: "Shoot this room in the morning",
    west: "Shoot this room in the afternoon",
    south: "Mid-morning or mid-afternoon to avoid harsh midday light",
    north: "Soft light all day, so any time in daylight works",
    unknown: "Shoot in daylight, mid-morning to mid-afternoon",
    outside: "Golden hour (the hour before sunset) for outside shots",
  } as Record<string, string>,
  /** Kinds shot outside (they get the golden-hour tip). */
  outsideKinds: ["outdoor", "view", "hotTub", "pool", "parking", "local", "entrance", "evCharger"],

  seasons: {
    spring: [{ text: "Garden at its best: retake your outdoor cover photo" }],
    summer: [{ text: "Garden at its best: retake your outdoor cover photo" }],
    autumn: [{ text: "Rake leaves, check the garden furniture" }],
    winter: [
      { text: "Fireplace or log burner lit (if you have one) and heating on.", requires: "fireplace" },
      { text: "Remove festive decorations from your cover photo after the season." },
    ],
  } as Record<string, { text: string; requires?: string }[]>,

  /** Phone or camera settings, in plain English. */
  settings: [
    "Landscape (turn your phone sideways)",
    "1x lens, or ultra-wide only if walls stay straight",
    "Chest height",
    "Clean the lens",
    "Turn off heavy filters",
    "HDR on for bright windows",
    "A tripod is optional, but helps in darker rooms",
  ],
  shooterNotes: {
    phone: "A recent phone is enough. Shoot in daylight, landscape, from a corner at chest height.",
    camera: "Use a wide lens (around 16–24 mm on full frame) and a tripod, and keep verticals straight.",
    pro: "Send your photographer this list and the brief below, so nothing is missed.",
  } as Record<string, string>,
  brief:
    "Hi, here’s the shot list for {property}. Please shoot in landscape, at chest height, in daylight with the lights on. The first five photos matter most: {firstFive}. Every room needs at least one photo. Please keep photos accurate: no heavy filters or angles that change how the space looks. Captions are in the list. Thank you!",

  /* ---- Prep checklists -------------------------------------------------- */

  prep: {
    wholeHome: ["All lights on (warm white)", "Blinds and curtains open", "Bins out of sight", "Cars off the driveway", "No personal items or photos", "Toilet seats down", "Towels folded", "TV screens off", "Cables hidden"],
    byKind: {
      livingSpace: ["Cushions plumped", "Coffee table cleared", "Remotes put away"],
      kitchenDiner: ["Worktops cleared", "Chairs tucked in", "Fingerprints wiped off appliances"],
      sleeping: ["Bed made with fresh linen", "Bedside clear"],
      bedroom: ["Bed made with fresh linen", "Bedside tables clear", "Wardrobe doors shut"],
      kitchen: ["Worktops cleared", "Sink empty", "Fingerprints wiped off appliances"],
      dining: ["Table clear or simply laid", "Chairs tucked in"],
      bathroom: ["Toilet seat down", "Fresh towels folded", "Toiletries put away", "Mirror cleaned"],
      ensuite: ["Toilet seat down", "Fresh towels folded", "Mirror cleaned"],
      workspace: ["Desk cleared", "Cables tidied"],
      laundry: ["Machine doors shut", "No laundry on show"],
      outdoor: ["Swept and tidied", "Cushions out", "Hoses and bins out of sight"],
      hotTub: ["Cover off, water clear"],
      pool: ["Water skimmed"],
      fireplace: ["Glass cleaned", "Logs stacked"],
      stairs: ["Stairs cleared"],
      entrance: ["Step swept", "Bins moved"],
      parking: ["Space clear of cars and bikes"],
    } as Record<string, string[]>,
  },

  /* ---- Result copy ------------------------------------------------------- */

  meaning: {
    main: "Upload your photos in this order. Your first five decide whether guests click. Paste each caption so guests know exactly what they’re looking at.",
    honesty: "We’ve added a photo of {what} because you mentioned it. Showing it builds trust and protects your reviews.",
    honestyWhat: { stairs: "the stairs", sharedEntrance: "the shared entrance" } as Record<string, string>,
  },
  /** Where captions go in the Airbnb app. VERIFY: menu names change. */
  captionHint: "In the Airbnb app: Listings › your listing › Photo tour › tap a photo › Edit › Add a caption (menu names can vary).",

  /** "Try an example": the test 1 fixture, clearly labelled as example data. */
  example: {
    bedrooms: 2,
    beds: ["king", "double"],
    ensuites: [false, false],
    blackout: [true, false],
    bathrooms: 1,
    living: true,
    kitchen: true,
    dining: false,
    kitchenDiner: false,
    workspace: "full",
    workspaceLocation: "bedroom 2",
    laundry: ["washer"],
    outdoor: [],
    view: "canal",
    viewFrom: "",
    extras: [],
    checkIn: "keypad",
    parking: "permit",
    access: [],
    stairs: false,
    lift: false,
    floor: "2",
    standout: "view",
    second: "",
    guestTypes: ["remote"],
    wifiMbps: 300,
    kitchenItems: [],
    sizeM2: null,
    checkInTime: "",
    parkingSpaces: 1,
    places: [{ name: "Piccadilly station", minutes: 12, mode: "walk" }],
    honest: ["stairsNoLift"],
    season: "",
    windows: "",
    shooter: "phone",
  },
};

/** Airbnb's photo guidance (shown on the page and in How it works). VERIFY. */
export const source = {
  title: "Airbnb Resource Centre: How to add the best photos of your space",
  url: "https://www.airbnb.co.uk/resources/hosting-homes/a/how-to-add-the-best-photos-of-your-space-367",
  date: "2025-10-13",
};
