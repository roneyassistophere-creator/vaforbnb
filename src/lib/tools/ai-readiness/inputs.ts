/** What the host enters, plus the example listings. Nothing here leaves the device. */

export type SectionId = "description" | "space" | "access" | "notes";
export const sectionIds: SectionId[] = ["description", "space", "access", "notes"];

export type Inputs = {
  title: string;
  sections: Record<SectionId, string>;
  /** "Paste everything in one box". */
  oneBox: boolean;
  all: string;
  town: string;
  station: string;
  landmark: string;
  propertyType: string;
  bedrooms: number;
  maxGuests: number;
  guestTypes: string[];
  amenities: string[];
  /** "" = not answered; otherwise a parking option id (including "none"). */
  parking: string;
  captions: boolean;
  bedSizes: boolean;
  /** null = detect from the text (Mbps), otherwise the host's answer. */
  wifiSpeed: boolean | null;
  honest: boolean;
};

export const LIMITS = { title: 200, section: 12000, all: 40000, place: 80, bedrooms: 30, guests: 50 };

export const defaultInputs = (): Inputs => ({
  title: "",
  sections: { description: "", space: "", access: "", notes: "" },
  oneBox: false,
  all: "",
  town: "",
  station: "",
  landmark: "",
  propertyType: "flat",
  bedrooms: 1,
  maxGuests: 2,
  guestTypes: [],
  amenities: [],
  parking: "",
  captions: false,
  bedSizes: false,
  wifiSpeed: null,
  honest: false,
});

/** The description sections joined (or the one box). */
export function descriptionOf(i: Inputs): string {
  if (i.oneBox) return i.all.trim();
  return sectionIds
    .map((id) => i.sections[id].trim())
    .filter(Boolean)
    .join("\n\n");
}

/** Text analysed = the title plus every description section, joined with line breaks. */
export function fullTextOf(i: Inputs): string {
  return [i.title.trim(), descriptionOf(i)].filter(Boolean).join("\n");
}

export const hasText = (i: Inputs) => fullTextOf(i).length > 0;

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const int = (v: unknown, min: number, max: number, d: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : d);
const strList = (v: unknown, max: number) => (Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string").map((x) => x.slice(0, 40)))].slice(0, max) : []);

/** Make saved (possibly old or edited) inputs safe to use. */
export function cleanInputs(x: unknown): Inputs {
  const d = defaultInputs();
  if (!x || typeof x !== "object") return d;
  const o = x as Partial<Inputs>;
  const s = (o.sections ?? {}) as Partial<Record<SectionId, unknown>>;
  return {
    title: str(o.title, LIMITS.title),
    sections: { description: str(s.description, LIMITS.section), space: str(s.space, LIMITS.section), access: str(s.access, LIMITS.section), notes: str(s.notes, LIMITS.section) },
    oneBox: o.oneBox === true,
    all: str(o.all, LIMITS.all),
    town: str(o.town, LIMITS.place),
    station: str(o.station, LIMITS.place),
    landmark: str(o.landmark, LIMITS.place),
    propertyType: str(o.propertyType, 20) || d.propertyType,
    bedrooms: int(o.bedrooms, 0, LIMITS.bedrooms, d.bedrooms),
    maxGuests: int(o.maxGuests, 1, LIMITS.guests, d.maxGuests),
    guestTypes: strList(o.guestTypes, 3),
    amenities: strList(o.amenities, 40),
    parking: str(o.parking, 20),
    captions: o.captions === true,
    bedSizes: o.bedSizes === true,
    wifiSpeed: o.wifiSpeed === true ? true : o.wifiSpeed === false ? false : null,
    honest: o.honest === true,
  };
}

/** A weak sample listing (invented), clearly labelled as example data in the tool. */
export const exampleInputs = (): Inputs => ({
  ...defaultInputs(),
  title: "Cosy flat in a great location!!",
  sections: {
    description:
      "Lovely cosy flat, close to everything. Perfect for business or leisure. Spacious living room and an AMAZING kitchen. Fast WiFi and parking available. A real home from home!",
    space: "",
    access: "",
    notes: "",
  },
  town: "Leeds",
  station: "Leeds station",
  landmark: "St James's Hospital",
  propertyType: "flat",
  bedrooms: 2,
  maxGuests: 4,
  guestTypes: ["remote", "contractors"],
  amenities: ["wifi", "kitchen", "washer"],
});

/** The same sample, rewritten with clear facts: shows how far the score can move. */
export const improvedExampleInputs = (): Inputs => ({
  ...exampleInputs(),
  title: "Quiet 2-bed Leeds flat with desk and parking",
  sections: {
    description:
      "Quiet 2-bedroom flat (58 m²) on a residential street with double-glazed windows. It’s an 8-minute walk to Leeds station and 10 minutes by car to St James's Hospital.\n\nWi-Fi is 200 Mbps (tested November 2026). There’s a desk with an office chair and a monitor in bedroom 2.",
    space:
      "Bedroom 1: king bed. Bedroom 2: two singles and the desk. Full kitchen with oven, hob, dishwasher and microwave. Washing machine and drying rack.\n\nFree parking on the driveway for one car or van.",
    access: "Self check-in with a keypad from 3pm. The whole flat is yours. Weekly and monthly stays welcome.",
    notes: "The flat is on the first floor, up one flight of stairs, with no lift.",
  },
  amenities: ["wifi", "workspace", "washer", "selfCheckin", "kitchen", "parking"],
  parking: "free",
  captions: true,
  bedSizes: true,
  honest: true,
});
