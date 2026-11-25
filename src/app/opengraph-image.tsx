import { ImageResponse } from "next/og";
import { brand } from "@/config/brand";

export const alt = `${brand.name}: ${brand.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social card for every page. Add an opengraph-image file in a route folder to override. */
export default function OpengraphImage() {
  const { colors } = brand;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: colors.sand,
          color: colors.ink,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="72" height="72" viewBox="0 0 100 100">
            <rect width="100" height="100" rx="24" fill={colors.ink} />
            <g transform="translate(20 20) scale(0.6)">
              <path d="M20 44 L50 14 L80 44" fill="none" stroke={colors.coral} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 58 L50 88 L80 58" fill="none" stroke="#FFFFFF" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 800, letterSpacing: -1.5 }}>
            {brand.wordmark.start}
            <span style={{ fontWeight: 400, color: "#6B7680" }}>{brand.wordmark.middle}</span>
            {brand.wordmark.end}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 72, lineHeight: 1.05, fontWeight: 700, letterSpacing: -2, maxWidth: 980 }}>
            Your UK Airbnb virtual assistant team.
          </div>
          <div style={{ fontSize: 32, color: colors.brand }}>We run the daily work, you keep the control.</div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#46525C" }}>{brand.hours.label}</div>
      </div>
    ),
    size,
  );
}
