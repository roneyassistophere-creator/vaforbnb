/**
 * Shared colours for tool badges and groups. Reused by every free tool so
 * results look the same across the site.
 */

export type BadgeTone = { bg: string; fg: string };

/** Rule status badges (same colours as the UK Rules Hub). */
export const statusMeta = {
  "law-now": { label: "Law now", bg: "#E8EEF3", fg: "#14212B" },
  coming: { label: "Coming", bg: "#FFF2CC", fg: "#6B4A00" },
  "platform-rule": { label: "Platform rule", bg: "#EEEAF6", fg: "#4B3A75" },
  "contract-rule": { label: "Contract", bg: "#EDF0F2", fg: "#3A4650" },
} as const satisfies Record<string, BadgeTone & { label: string }>;

export type StatusKey = keyof typeof statusMeta;

/** Result groups. */
export const groupMeta = {
  "must-do": { label: "Must do now", bg: "#FDECEC", fg: "#B8383A", dot: "#F0595A" },
  "coming-soon": { label: "Coming soon", bg: "#FFF2CC", fg: "#6B4A00", dot: "#E0A800" },
  "check-contract": { label: "Check your contract", bg: "#EDF0F2", fg: "#3A4650", dot: "#7A8691" },
} as const satisfies Record<string, BadgeTone & { label: string; dot: string }>;

export type GroupKey = keyof typeof groupMeta;
