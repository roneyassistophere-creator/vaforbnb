/**
 * Stored content for the House rules generator, seeded into the `figures`
 * table as structured content (edit it there). Every sentence the tool writes
 * comes from these templates. {braces} are filled from the host's answers.
 */

export type RuleSection = { key: string; heading: string };

/** Fixed order and headings. */
export const sections: RuleSection[] = [
  { key: "arrival", heading: "Arrival and departure" },
  { key: "guests", heading: "Guests and visitors" },
  { key: "pets", heading: "Pets" },
  { key: "noise", heading: "Noise and parties" },
  { key: "smoking", heading: "Smoking and fire safety" },
  { key: "parking", heading: "Parking" },
  { key: "rubbish", heading: "Rubbish and recycling" },
  { key: "home", heading: "Looking after the home" },
  { key: "leaving", heading: "Before you leave" },
  { key: "cameras", heading: "Cameras and monitoring" },
  { key: "other", heading: "Other rules" },
  { key: "help", heading: "Need help?" },
];

export type RuleTemplate = {
  key: string;
  section: string;
  order: number;
  friendly: string;
  short: string;
  /** Always included; can't be removed. */
  locked?: boolean;
  /** Left out of the listing version (covered by platform settings). */
  listing?: boolean;
  /** Shown on the printable sign (in this order). */
  sign?: number;
  /** Icon on the sign. */
  icon?: string;
};

export const templates: RuleTemplate[] = [
  { key: "checkin", section: "arrival", order: 1, friendly: "Check-in is from {checkinTime}.", short: "Check-in from {checkinTime}.", listing: false, sign: 1, icon: "clock" },
  { key: "selfCheckin", section: "arrival", order: 2, friendly: "It’s self check-in: we’ll send you the details before you arrive.", short: "Self check-in. Details sent before arrival." },
  { key: "checkout", section: "arrival", order: 3, friendly: "Please check out by {checkoutTime}.", short: "Check-out by {checkoutTime}.", listing: false, sign: 2, icon: "clock" },
  { key: "lateCheckout.ask", section: "arrival", order: 4, friendly: "Would you like a later check-out? Just ask and we’ll do our best.", short: "Late check-out: ask us." },
  { key: "lateCheckout.no", section: "arrival", order: 4, friendly: "We can’t offer late check-out, as we need time to get the home ready for the next guests.", short: "No late check-out." },
  { key: "lateCheckout.fee", section: "arrival", order: 4, friendly: "Late check-out may be available for a fee, as shown in the listing. Please ask before your stay.", short: "Late check-out available for a fee (see listing). Ask first." },

  { key: "maxGuests", section: "guests", order: 1, friendly: "The home is for up to {maxGuests} guests.", short: "Maximum {maxGuests} guests.", listing: false, sign: 3, icon: "people" },
  { key: "visitors.none", section: "guests", order: 2, friendly: "Please don’t bring visitors. Only booked guests can stay.", short: "No visitors. Booked guests only." },
  { key: "visitors.arrangement", section: "guests", order: 2, friendly: "Visitors are welcome by arrangement, so please ask us first. Only booked guests can stay overnight.", short: "Visitors by arrangement only. No overnight visitors." },
  { key: "visitors.daytime", section: "guests", order: 2, friendly: "Daytime visitors are welcome. Only booked guests can stay overnight.", short: "Daytime visitors only. Booked guests only overnight." },
  { key: "children.yes", section: "guests", order: 3, friendly: "Children are welcome.", short: "Children welcome." },
  { key: "children.underAge", section: "guests", order: 3, friendly: "Please note the home isn’t suitable for children under {childAge}.", short: "Not suitable for children under {childAge}." },
  { key: "children.noInfants", section: "guests", order: 3, friendly: "Please note the home isn’t suitable for infants.", short: "Not suitable for infants." },

  { key: "pets.no", section: "pets", order: 1, friendly: "We can’t take pets, but assistance dogs are always welcome.", short: "No pets. Assistance dogs welcome.", listing: false, sign: 6, icon: "paw" },
  { key: "pets.yes", section: "pets", order: 1, friendly: "Pets are welcome (up to {maxPets}).", short: "Pets welcome, maximum {maxPets}.", listing: false, sign: 6, icon: "paw" },
  { key: "pets.ask", section: "pets", order: 1, friendly: "Pets by arrangement – please ask before you book.", short: "Pets by arrangement. Please ask.", listing: false, sign: 6, icon: "paw" },
  { key: "petFee", section: "pets", order: 2, friendly: "A pet fee applies, as shown in the listing.", short: "Pet fee applies (see listing)." },
  { key: "assistanceDogs", section: "pets", order: 3, friendly: "Assistance dogs are always welcome.", short: "Assistance dogs are always welcome.", locked: true },

  { key: "quiet", section: "noise", order: 1, friendly: "Please keep noise down between {quietFrom} and {quietTo}. Our neighbours thank you!", short: "Quiet hours {quietFrom}–{quietTo}.", listing: false, sign: 4, icon: "moon" },
  { key: "parties", section: "noise", order: 2, friendly: "No parties or events, please.", short: "No parties or events.", locked: true, listing: false, sign: 5, icon: "no" },

  { key: "smoking.none", section: "smoking", order: 1, friendly: "Please don’t smoke or vape anywhere on the property.", short: "No smoking or vaping.", listing: false, sign: 7, icon: "no" },
  { key: "smoking.outside", section: "smoking", order: 1, friendly: "Smoking is allowed outside only, in {smokingArea}. Please don’t smoke or vape indoors.", short: "Smoking outside only ({smokingArea}). No smoking or vaping indoors.", listing: false, sign: 7, icon: "no" },
  { key: "noFlames", section: "smoking", order: 2, friendly: "Please don’t use candles or open flames.", short: "No candles or open flames." },
  { key: "alarms", section: "smoking", order: 3, friendly: "Please don’t cover or remove the smoke or carbon monoxide alarms.", short: "Don’t cover or remove smoke or CO alarms." },

  { key: "parking", section: "parking", order: 1, friendly: "{parking}", short: "{parking}" },
  { key: "rubbish", section: "rubbish", order: 1, friendly: "{rubbish}", short: "{rubbish}", sign: 8, icon: "bin" },
  { key: "collectionDay", section: "rubbish", order: 2, friendly: "Bin collection day is {collectionDay}.", short: "Collection day: {collectionDay}." },

  { key: "home.shoes", section: "home", order: 1, friendly: "Please remove your shoes indoors.", short: "Shoes off indoors." },
  { key: "home.lock", section: "home", order: 2, friendly: "Please keep doors and windows locked when you go out.", short: "Lock doors and windows when you go out." },
  { key: "home.damage", section: "home", order: 3, friendly: "Please tell us straight away about any damage or problems.", short: "Report any damage or problems straight away." },
  { key: "home.furniture", section: "home", order: 4, friendly: "Please don’t move the furniture.", short: "Don’t move furniture." },
  { key: "home.heating", section: "home", order: 5, friendly: "Please turn off the heating when windows are open.", short: "Heating off when windows are open." },

  { key: "tasks", section: "leaving", order: 1, friendly: "Before you leave, please: {tasks}.", short: "Before you leave: {tasks}." },

  { key: "cameras.outdoor", section: "cameras", order: 1, friendly: "For your security, there’s an outdoor camera at the {cameraLocations}. It records {recording}. There are no cameras inside the home.", short: "Outdoor camera at the {cameraLocations} ({recording}). No indoor cameras." },
  { key: "noiseMonitor", section: "cameras", order: 2, friendly: "There’s a sound-level monitor in the home. It measures noise levels only and doesn’t record conversations.", short: "Sound-level monitor in use (noise levels only, no recording)." },

  { key: "help", section: "help", order: 1, friendly: "If anything’s wrong, message us straight away.", short: "Problems? Message us straight away.", sign: 9, icon: "message" },
  { key: "contactHours", section: "help", order: 2, friendly: "We’re available {contactHours}.", short: "Contact hours: {contactHours}." },
];

export type CheckerRule = {
  /** "amber" notes never block; "red" leaves the rule out of the outputs until reworded. */
  level: "amber" | "red";
  message: string;
  why: string;
  /** UK Rules Hub anchor for "Why?". */
  anchor: string;
  words: string[];
  /** If any of these appear, the rule isn't flagged (e.g. "assistance" for dogs). */
  except?: string[];
  /** Dogs rule: these words AND one of `words` must appear. */
  restrict?: string[];
};

export const checker: Record<"charges" | "discrimination" | "dogs" | "indoor" | "refunds", CheckerRule> = {
  charges: {
    level: "amber",
    message: "Charges must be fair and shown before guests book. Hidden fines in house rules can be unfair. Consider using your platform’s damage process instead.",
    why: "Under the Digital Markets, Competition and Consumers Act 2024 and consumer law, compulsory charges must be shown in the price before booking, and surprise penalties can be unfair terms.",
    anchor: "all-in-pricing",
    words: ["£", "fine", "fined", "fines", "penalty", "penalties", "charge", "charged", "charges", "deposit", "forfeit"],
  },
  discrimination: {
    level: "red",
    message: "House rules can’t discriminate against guests (Equality Act 2010). Please reword this rule.",
    why: "The Equality Act 2010 makes it unlawful to refuse or treat guests worse because of race, nationality, religion or belief, sex, sexual orientation, gender reassignment, disability, age, pregnancy or maternity, or marriage and civil partnership.",
    anchor: "assistance-dogs",
    words: [
      "race", "racial", "nationality", "nationalities", "foreigner", "foreigners", "immigrant", "immigrants", "ethnic", "ethnicity",
      "religion", "religious", "muslim", "muslims", "christian", "christians", "jewish", "jews", "hindu", "hindus", "sikh", "sikhs",
      "gay", "gays", "lesbian", "lgbt", "lgbtq", "transgender", "trans people", "sexuality",
      "disabled", "disability", "wheelchair", "pregnant", "pregnancy",
      "black people", "white people", "asian", "asians", "travellers", "gypsies",
      "guests from", "people from", "anyone from", "nobody from", "no one from",
    ],
  },
  dogs: {
    level: "amber",
    message: "Remember, assistance dogs must always be welcome. We’ve kept that rule in.",
    why: "Refusing a disabled guest because of their assistance dog is likely to be unlawful under the Equality Act 2010, even with a no-pets rule.",
    anchor: "assistance-dogs",
    words: ["dog", "dogs", "animal", "animals", "pet", "pets"],
    restrict: ["no", "not", "never", "banned", "forbidden", "prohibited"],
    except: ["assistance", "guide dog", "guide dogs", "service dog", "service dogs"],
  },
  indoor: {
    level: "red",
    message: "Indoor cameras aren’t allowed on Airbnb. Remove this rule and any indoor cameras.",
    why: "Airbnb banned indoor security cameras from 30 April 2024. Outdoor cameras and doorbells must be disclosed, and recording people indoors raises serious privacy and data protection issues.",
    anchor: "cameras",
    words: ["camera inside", "cameras inside", "indoor camera", "indoor cameras", "cctv in", "cctv inside", "recording indoors", "camera in the", "cameras in the", "hidden camera", "hidden cameras", "camera in each", "camera in every"],
    except: ["garden", "driveway", "front door", "outside", "outdoor", "porch", "doorbell", "car park", "gate"],
  },
  refunds: {
    level: "amber",
    message: "Your cancellation policy is set in your booking platform. Don’t contradict it in house rules.",
    why: "Guests book under the cancellation policy shown on the platform. A different rule in your house rules can confuse guests and may not be enforceable.",
    anchor: "cancellation-policy",
    words: ["no refund", "no refunds", "non-refundable", "not refundable", "nonrefundable"],
  },
};

export const checkerLimits = {
  maxTasks: 4,
  tooManyTasks: {
    message: "Long check-out lists annoy guests and can hurt reviews. Keep it to a few simple tasks.",
    why: "Airbnb asks hosts to keep check-out tasks reasonable, and guests often mention long lists in reviews.",
    anchor: "cancellation-policy",
  },
  maxLines: 30,
  tooLong: { message: "Shorter rules get read. Consider removing a few.", why: "Guests skim. A short list of clear rules gets followed more than a long one.", anchor: "fire-risk-assessment" },
  feeNote: "Show this fee in your listing before guests book.",
};

/** Platform setting labels; {value} is filled from the answers. */
export const platformLabels: { airbnb: { key: string; label: string }[]; booking: { key: string; label: string }[] } = {
  airbnb: [
    { key: "pets", label: "Pets allowed: {value}" },
    { key: "events", label: "Events allowed: No" },
    { key: "smoking", label: "Smoking, vaping, e-cigarettes allowed: {value}" },
    { key: "quiet", label: "Quiet hours: {value}" },
    { key: "checkin", label: "Check-in window starts: {value}" },
    { key: "checkout", label: "Checkout time: {value}" },
    { key: "guests", label: "Number of guests: {value}" },
    { key: "photography", label: "Commercial photography and filming: (your choice)" },
    { key: "devices", label: "Disclose outdoor cameras / noise monitors in safety devices: {value}" },
  ],
  booking: [
    { key: "checkin", label: "Check-in from: {value}" },
    { key: "checkout", label: "Check-out until: {value}" },
    { key: "pets", label: "Pets: {value}" },
    { key: "events", label: "Parties/events allowed: No" },
    { key: "smoking", label: "Smoking allowed: {value}" },
    { key: "quiet", label: "Quiet hours: {value}" },
  ],
};
