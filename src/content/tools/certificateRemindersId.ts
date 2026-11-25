/** Identity of the Certificate reminder builder (used by the catalogue and the page). */
export const toolSlug = "holiday-let-certificate-reminders";
export const toolPath = `/free-tools/${toolSlug}`;
export const storageKey = `vaforbnb:tool:${toolSlug}:v1`;
/** Opens the tool with one check highlighted, e.g. ?item=gas. */
export const reminderLink = (item: "gas" | "eicr" | "fra" | "pat" | "legionella") => `${toolPath}?item=${item}`;
