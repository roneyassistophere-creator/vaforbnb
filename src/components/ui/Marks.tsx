import { cn } from "@/lib/cn";

/** Green circular tick used in lists. */
export function Tick({ size = 18, className }: { size?: number; className?: string }) {
  const icon = size >= 20 ? 12 : 10;
  return (
    <span
      className={cn("inline-flex flex-none items-center justify-center rounded-full bg-green-50", className)}
      style={{ width: size, height: size }}
    >
      <svg width={icon} height={icon} viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M5 12.5l4.5 4.5L19 7.5"
          fill="none"
          stroke="#1F6B45"
          strokeWidth={size >= 20 ? 3 : 3.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** Red circular cross used in "never" / "not a fit" lists. */
export function Cross({ size = 18, className }: { size?: number; className?: string }) {
  const icon = size >= 20 ? 10 : 9;
  return (
    <span
      className={cn("inline-flex flex-none items-center justify-center rounded-full bg-coral-50", className)}
      style={{ width: size, height: size }}
    >
      <svg width={icon} height={icon} viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M6 6l12 12 M18 6L6 18"
          fill="none"
          stroke="#B8383A"
          strokeWidth={size >= 20 ? 3.4 : 3.6}
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

/** Grey circular dash used for "paid separately" lists. */
export function Dash({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex flex-none items-center justify-center rounded-full bg-fog", className)}
      style={{ width: size, height: size }}
    >
      <svg width={10} height={10} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 12h12" fill="none" stroke="#5F6B75" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/** Plain stroke tick without a circle. */
export function CheckStroke({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#1F6B45" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
