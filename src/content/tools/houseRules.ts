/** Interface copy for the House rules generator. Edit freely. */
export { storageKey, toolPath, toolSlug } from "./houseRulesId";

export const sectionTitles = [
  "Your property",
  "Arrival and departure",
  "Guests",
  "Pets",
  "Noise and parties",
  "Smoking",
  "Parking, rubbish and the home",
  "Cameras and extra rules",
] as const;

export const presetTasks = ["Load the dishwasher", "Take out the rubbish", "Leave keys in the lockbox", "Turn off lights and heating", "Strip the beds"];
export const presetLocations = ["Front door", "Driveway", "Garden", "Side gate"];

export const homeToggles: { key: "shoes" | "lock" | "damage" | "furniture" | "alarms" | "heating"; label: string }[] = [
  { key: "shoes", label: "Please remove shoes indoors" },
  { key: "lock", label: "Keep doors and windows locked when you go out" },
  { key: "damage", label: "Tell us straight away about any damage or problems" },
  { key: "furniture", label: "Please don’t move furniture" },
  { key: "alarms", label: "Don’t cover or remove smoke or carbon monoxide alarms" },
  { key: "heating", label: "Turn off the heating when windows are open" },
];

export const copy = {
  privacy: "Your answers stay on this device.",
  progress: "{done} of {total} sections done",
  example: "Try an example",
  exampleBanner: "You’re looking at example answers.",
  reset: "Reset to defaults",
  clear: "Clear my answers",
  clearConfirm: "Clear all your answers and start again?",
  locked: {
    assistanceDogs: "Required: refusing assistance dogs is likely to be unlawful under the Equality Act 2010.",
    parties: "Airbnb doesn’t allow parties or events.",
  },
  noIndoor: "Indoor cameras aren’t allowed on Airbnb.",
  tabs: { full: "Full rules", listing: "Listing version", platform: "Platform settings", sign: "Printable sign" },
  actions: {
    copy: "Copy text",
    copied: "Copied",
    pdf: "Download PDF",
    txt: "Download text (.txt)",
    copyChecklist: "Copy checklist",
    toGuide: "Use these rules in my welcome guide",
    toBuilder: "Add house rule highlights to Other things to note",
    toGuideSaved: "Saved on this device for the Welcome guide builder.",
  },
  listing: {
    intro: "For your listing’s “additional rules” box. Pets, parties, smoking, quiet hours, times and guest numbers are left out: guests see those from your listing settings.",
    over: "Over the limit by {n} characters. Remove an extra rule or shorten one.",
  },
  platform: { intro: "Switch these on or off in your listing settings so they match your written rules. Menu names change: check against your platform." },
  previewButton: "Preview my rules",
  backButton: "Back to questions",
  storageFailed: "This browser isn’t saving your answers. Copy or download your rules before you leave.",
  why: "Why?",
};
