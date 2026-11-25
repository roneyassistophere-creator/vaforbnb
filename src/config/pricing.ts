/**
 * Prices in GBP. A value of 0 shows the "£[PRICE]" placeholder everywhere,
 * so the site can launch before prices are final. Set real numbers here and
 * the home page, services hub, pricing cards and estimator all update.
 */
export const prices = {
  /** Run package, per property per month */
  run: 0,
  /** Guest communication only, per property per month */
  guestOnly: 0,
  /** Grow package, from (per service per month) */
  grow: 0,
  /** Build package, from (one-off) */
  build: 0,
  /** SEO for short lets, per month */
  seoMonthly: 0,
  /** Social media, per month */
  socialMonthly: 0,
  /** Direct booking website, one-off */
  websiteOneOff: 0,
  /** SOP library, one-off */
  sopOneOff: 0,
  /** Tailored SOPs, one-off (from) */
  sopTailored: 0,
  /** SOPs built from scratch, one-off (from) */
  sopCustom: 0,
  /** One-off listing rebuild (from) */
  listingRebuild: 0,
  /** Direct booking website care plan, per month (from) */
  websiteCare: 0,
} as const;

export type PriceKey = keyof typeof prices;

/** "From" price for each single service (keys match ids in src/content/services.ts). 0 = placeholder. */
export const singleServicePrices: Record<string, number> = {
  guest: 0,
  listing: 0,
  pricing: 0,
  clean: 0,
  laundry: 0,
  reviews: 0,
  finance: 0,
  website: 0,
  seo: 0,
  social: 0,
  sops: 0,
  cohost: 0,
};

export const PRICE_PLACEHOLDER = "£[PRICE]";

export const formatMoney = (n: number) =>
  "£" + Math.round(n).toLocaleString("en-GB");

/** "£120" when set, otherwise "£[PRICE]" */
export const showPrice = (n: number) => (n > 0 ? formatMoney(n) : PRICE_PLACEHOLDER);
