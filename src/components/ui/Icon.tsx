import { ICONS, type IconName } from "@/lib/icons";

type Props = {
  name?: IconName;
  /** Raw path data, used when `name` isn't given. */
  d?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
};

export function Icon({ name, d, size = 22, color = "currentColor", strokeWidth = 1.8, className }: Props) {
  const path = name ? ICONS[name] : d;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SearchIcon({ size = 18, color = "#5F6B75" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="flex-none">
      <circle cx="11" cy="11" r="7" fill="none" stroke={color} strokeWidth="2" />
      <path d="M16 16l5 5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
