"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { whatThisMeans, type NightsResult } from "@/lib/tools/london-nights";

type Shown = { result: NightsResult; hasBookings: boolean } | null;
const Ctx = createContext<{ shown: Shown; setShown: (s: Shown) => void }>({ shown: null, setShown: () => {} });

/** Lets "What this means" follow the counter's live result. */
export function LondonNightsResultProvider({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState<Shown>(null);
  return <Ctx.Provider value={{ shown, setShown }}>{children}</Ctx.Provider>;
}

export const useLondonNightsResult = () => useContext(Ctx);

export function WhatThisMeans({ className }: { className?: string }) {
  const { shown } = useLondonNightsResult();
  return (
    <p className={className} aria-live="polite">
      {whatThisMeans(shown?.result ?? null, !!shown?.hasBookings)}
    </p>
  );
}
