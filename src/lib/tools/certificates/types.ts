export type Nation = "england" | "london" | "scotland" | "wales" | "ni";
export const nationLabels: Record<Nation, string> = {
  england: "England",
  london: "London",
  scotland: "Scotland",
  wales: "Wales",
  ni: "Northern Ireland",
};
/** Key used in the stored tag tables (London follows England). */
export const tagNation = (n: Nation) => (n === "london" ? "england" : n);

export type ItemKey = "gas" | "eicr" | "fra" | "pat" | "legionella" | "licence" | "niCert" | "insurance";
export type Tag = "required" | "recommended";

/** A host's own reminder: last done + months, or a fixed due date. */
export type CustomItem = {
  id: string;
  name: string;
  mode: "interval" | "fixed";
  last?: string;
  months?: number;
  due?: string;
};

export type PropertyData = {
  id: string;
  name: string;
  nation: Nation;
  hasGas: boolean;
  /** Last-done date (interval items) or the due date (renewals), YYYY-MM-DD. */
  dates: Partial<Record<ItemKey, string>>;
  /** Gas "done early": the due date on the previous certificate. */
  gasPrevDue?: string;
  /** EICR: "Next inspection date" written on the report. */
  eicrNext?: string;
  /** PAT interval chosen by the host (months). */
  patMonths?: number;
  custom: CustomItem[];
  example?: boolean;
};

export type Settings = {
  /** Days before the due date for the calendar alert (default from stored figures). */
  remindDays?: number;
  secondReminder: boolean;
  includeOverdue: boolean;
  /** Calendar file for the selected property or all of them. */
  scope: "property" | "all";
};

export type Store = {
  version: 1;
  properties: PropertyData[];
  activePropertyId: string;
  settings: Settings;
};

export type Status = "overdue" | "soon" | "ok" | "missing";

export type ScheduleRow = {
  /** `${propertyId}:${key}` */
  id: string;
  /** Item key, or the custom item's id. */
  key: string;
  builtIn: ItemKey | null;
  name: string;
  propertyId: string;
  propertyName: string;
  tag: Tag | null;
  /** Last-done date (interval items). */
  lastDone: string | null;
  due: string | null;
  /** Due date − today, in whole days. */
  days: number | null;
  status: Status;
  /** Due date − the reminder days. */
  remindOn: string | null;
  /** How the due date was worked out. */
  basis: string | null;
  /** Renewal or fixed-date item (the date entered is the due date). */
  fixed: boolean;
  error?: string;
  todo: string;
  /** UK Rules Hub anchor. */
  anchor?: string;
};
