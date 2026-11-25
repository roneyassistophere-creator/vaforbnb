/** Identity of the UK event calendar (used by the catalogue, the pages and the admin area). */
export const toolSlug = "uk-event-calendar";
export const toolPath = `/free-tools/${toolSlug}`;
export const cityPath = (citySlug: string) => `${toolPath}/${citySlug}`;
/** Starred events and the last search, on the visitor's device only. */
export const storageKey = `vaforbnb:tool:${toolSlug}:v1`;
/** Cache tag for the public event data: admin changes clear it, so pages update straight away. */
export const eventsCacheTag = "events";
/** The next step for hosts: "Plan prices". */
export const pricingHref = "/services/pricing-optimisation";
