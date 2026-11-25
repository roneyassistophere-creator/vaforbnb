"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { whatThisMeans, type Area, type LevyResult } from "@/lib/tools/visitor-levy";

type Shown = { area: Area | null; result: LevyResult | null } | null;
const Ctx = createContext<{ shown: Shown; setShown: (s: Shown) => void }>({ shown: null, setShown: () => {} });

/** Lets "What this means" follow the calculator's live result. */
export function LevyResultProvider({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState<Shown>(null);
  return <Ctx.Provider value={{ shown, setShown }}>{children}</Ctx.Provider>;
}

export const useLevyResult = () => useContext(Ctx);

export function WhatThisMeans({ className, fallback }: { className?: string; fallback: string }) {
  const { shown } = useLevyResult();
  return (
    <p className={className} aria-live="polite">
      {shown ? whatThisMeans(shown.area, shown.result) : fallback}
    </p>
  );
}
