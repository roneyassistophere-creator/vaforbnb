export * from "./areas";
export * from "./calculate";
export * from "./log";
export * from "./summary";

/** Stored figures the calculator reads (areas are found by their `levy.calc.` prefix). */
export const isLevyFigure = (key: string) => key.startsWith("levy.calc.") || key === "vat.standardRate" || key === "rulesLastChecked";
