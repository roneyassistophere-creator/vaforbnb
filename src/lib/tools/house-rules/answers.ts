import type { Tone } from "../templates";

export type Answers = {
  propertyName: string;
  tone: Tone;
  checkin: string;
  checkout: string;
  selfCheckIn: boolean;
  lateCheckout: "ask" | "no" | "fee";
  maxGuests: number;
  visitors: "none" | "arrangement" | "daytime";
  children: "yes" | "underAge" | "noInfants";
  childAge: number;
  pets: "no" | "yes" | "ask";
  maxPets: number;
  petFee: boolean;
  quietFrom: string;
  quietTo: string;
  noiseMonitor: boolean;
  smoking: "none" | "outside";
  smokingArea: string;
  noFlames: boolean;
  parking: string;
  rubbish: string;
  collectionDay: string;
  home: { shoes: boolean; lock: boolean; damage: boolean; furniture: boolean; alarms: boolean; heating: boolean };
  checkoutTasks: string[];
  cameras: boolean;
  cameraLocations: string[];
  recording: "video" | "videoSound";
  extraRules: string[];
  contactHours: string;
};

/** Limits on what the host can type. */
export const LIMITS = { extraRules: 5, extraRuleChars: 140, freeText: 200, tasks: 5, maxGuests: 20, maxPets: 5, shortText: 60 };

export const defaultAnswers = (): Answers => ({
  propertyName: "",
  tone: "friendly",
  checkin: "15:00",
  checkout: "11:00",
  selfCheckIn: false,
  lateCheckout: "ask",
  maxGuests: 4,
  visitors: "arrangement",
  children: "yes",
  childAge: 5,
  pets: "no",
  maxPets: 1,
  petFee: false,
  quietFrom: "22:00",
  quietTo: "08:00",
  noiseMonitor: false,
  smoking: "none",
  smokingArea: "",
  noFlames: true,
  parking: "",
  rubbish: "",
  collectionDay: "",
  home: { shoes: false, lock: true, damage: true, furniture: false, alarms: true, heating: false },
  checkoutTasks: [],
  cameras: false,
  cameraLocations: [],
  recording: "video",
  extraRules: [],
  contactHours: "",
});

/** "Try an example": a 2-bed flat, no pets, outdoor doorbell camera, two check-out tasks. */
export const exampleAnswers = (): Answers => ({
  ...defaultAnswers(),
  propertyName: "Flat 2, Harbour View",
  selfCheckIn: true,
  maxGuests: 4,
  parking: "One space in bay 12. The permit is in the kitchen drawer: please leave it on the dashboard.",
  rubbish: "General waste in the black bin, recycling in the blue bin under the sink. Bins are in the yard behind the building.",
  collectionDay: "Tuesday",
  checkoutTasks: ["Load the dishwasher", "Take out the rubbish"],
  cameras: true,
  cameraLocations: ["Front door"],
  recording: "video",
  contactHours: "8am to 10pm",
});

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const str = (v: unknown, max: number, d = "") => (typeof v === "string" ? v.slice(0, max) : d);
const time = (v: unknown, d: string) => (typeof v === "string" && TIME.test(v) ? v : d);
const int = (v: unknown, min: number, max: number, d: number) => (typeof v === "number" && Number.isInteger(v) && v >= min && v <= max ? v : d);
const oneOf = <T extends string>(v: unknown, list: readonly T[], d: T): T => (list.includes(v as T) ? (v as T) : d);
const bool = (v: unknown, d: boolean) => (typeof v === "boolean" ? v : d);
const strList = (v: unknown, n: number, max: number) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").map((x) => x.slice(0, max)).slice(0, n) : []);

/** Turn saved JSON into valid answers (anything missing falls back to the default). */
export function cleanAnswers(x: unknown): Answers {
  const d = defaultAnswers();
  if (!x || typeof x !== "object") return d;
  const o = x as Record<string, unknown>;
  const h = (o.home && typeof o.home === "object" ? o.home : {}) as Record<string, unknown>;
  return {
    propertyName: str(o.propertyName, LIMITS.shortText),
    tone: oneOf(o.tone, ["friendly", "short"] as const, d.tone),
    checkin: time(o.checkin, d.checkin),
    checkout: time(o.checkout, d.checkout),
    selfCheckIn: bool(o.selfCheckIn, d.selfCheckIn),
    lateCheckout: oneOf(o.lateCheckout, ["ask", "no", "fee"] as const, d.lateCheckout),
    maxGuests: int(o.maxGuests, 1, LIMITS.maxGuests, d.maxGuests),
    visitors: oneOf(o.visitors, ["none", "arrangement", "daytime"] as const, d.visitors),
    children: oneOf(o.children, ["yes", "underAge", "noInfants"] as const, d.children),
    childAge: int(o.childAge, 1, 17, d.childAge),
    pets: oneOf(o.pets, ["no", "yes", "ask"] as const, d.pets),
    maxPets: int(o.maxPets, 1, LIMITS.maxPets, d.maxPets),
    petFee: bool(o.petFee, d.petFee),
    quietFrom: time(o.quietFrom, d.quietFrom),
    quietTo: time(o.quietTo, d.quietTo),
    noiseMonitor: bool(o.noiseMonitor, d.noiseMonitor),
    smoking: oneOf(o.smoking, ["none", "outside"] as const, d.smoking),
    smokingArea: str(o.smokingArea, LIMITS.shortText),
    noFlames: bool(o.noFlames, d.noFlames),
    parking: str(o.parking, LIMITS.freeText),
    rubbish: str(o.rubbish, LIMITS.freeText),
    collectionDay: str(o.collectionDay, 20),
    home: {
      shoes: bool(h.shoes, d.home.shoes),
      lock: bool(h.lock, d.home.lock),
      damage: bool(h.damage, d.home.damage),
      furniture: bool(h.furniture, d.home.furniture),
      alarms: bool(h.alarms, d.home.alarms),
      heating: bool(h.heating, d.home.heating),
    },
    checkoutTasks: strList(o.checkoutTasks, LIMITS.tasks, LIMITS.shortText),
    cameras: bool(o.cameras, d.cameras),
    cameraLocations: strList(o.cameraLocations, 8, 40),
    recording: oneOf(o.recording, ["video", "videoSound"] as const, d.recording),
    extraRules: strList(o.extraRules, LIMITS.extraRules, LIMITS.extraRuleChars),
    contactHours: str(o.contactHours, LIMITS.shortText),
  };
}
