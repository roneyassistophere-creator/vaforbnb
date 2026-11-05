// Shared type-scale class strings, used across marketing pages/sections so
// every part of the site reads as one system. Plain class-string constants
// rather than wrapper components — a shared string applied to a hand-picked
// <h1>/<h2> can't silently break the page's heading hierarchy the way a
// polymorphic <Heading as="h2"> component could.
//
// The whole site now flips via `data-theme` on <html>, so every heading can
// use semantic tokens. The `*OnDark` names are kept (they're imported across
// ~8 section files) but are now identical to their base twins — text-primary
// is green in both themes, text-foreground / text-muted-foreground follow the
// theme. Safe to merge the two sets and drop the `OnDark` suffix later.

export const eyebrow = 'text-xs font-semibold uppercase tracking-[0.25em] text-primary'
export const heading =
  'font-extrabold tracking-tight leading-[1.1] text-3xl sm:text-4xl lg:text-5xl text-foreground'
export const lede = 'text-base sm:text-lg leading-relaxed text-muted-foreground'

// Oversized hero/section-opener headline, set in the display face.
export const displayHeading =
  'font-display font-semibold tracking-tight leading-[0.95] text-5xl sm:text-6xl lg:text-display-lg text-foreground'

export const eyebrowOnDark = eyebrow
export const headingOnDark = heading
export const ledeOnDark = lede
export const displayHeadingOnDark = displayHeading
