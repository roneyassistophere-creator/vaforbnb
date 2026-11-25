"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { track, type ToolEvent } from "@/lib/analytics";

/** A link that records an analytics event (tool slug only) when clicked. */
export function TrackedLink({ event, toolSlug, onClick, ...props }: ComponentProps<typeof Link> & { event: ToolEvent; toolSlug: string }) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        track(event, toolSlug);
        onClick?.(e);
      }}
    />
  );
}
