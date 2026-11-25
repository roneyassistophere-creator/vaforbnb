import Link from "next/link";
import { brand } from "@/config/brand";

/** The VA for BnB chevron mark. `dark` = navy tile (header), `light` = coral tile (footer). */
export function LogoMark({ size = 32, variant = "dark" }: { size?: number; variant?: "dark" | "light" }) {
  const tile = variant === "dark" ? brand.colors.ink : brand.colors.coral;
  const top = variant === "dark" ? brand.colors.coral : brand.colors.white;
  const bottom = variant === "dark" ? brand.colors.white : brand.colors.ink;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className="flex-none">
      <rect width="100" height="100" rx="24" fill={tile} />
      <g transform="translate(20 20) scale(0.6)">
        <path d="M20 44 L50 14 L80 44" fill="none" stroke={top} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 58 L50 88 L80 58" fill="none" stroke={bottom} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function Wordmark({ onDark = false, size = 20 }: { onDark?: boolean; size?: number }) {
  return (
    <span
      className="font-extrabold"
      style={{ fontSize: size, letterSpacing: "-0.8px", color: onDark ? "#FFFFFF" : brand.colors.ink }}
    >
      {brand.wordmark.start}
      <span className="font-normal" style={{ color: onDark ? "#9AA6AF" : "#6B7680" }}>
        {brand.wordmark.middle}
      </span>
      {brand.wordmark.end}
    </span>
  );
}

export function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <Link
      href="/"
      aria-label={`${brand.name} home`}
      className="flex items-center gap-2.5 no-underline"
      style={{ color: onDark ? "#FFFFFF" : brand.colors.ink }}
    >
      <LogoMark size={onDark ? 30 : 32} variant={onDark ? "light" : "dark"} />
      <Wordmark onDark={onDark} size={onDark ? 19 : 20} />
    </Link>
  );
}
