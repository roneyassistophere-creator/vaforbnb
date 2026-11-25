"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { whatThisMeans, type Outcome } from "@/lib/tools/business-rates";

const Ctx = createContext<{ outcome: Outcome | null; setOutcome: (o: Outcome | null) => void }>({ outcome: null, setOutcome: () => {} });

/** Lets "What this means" follow the checker's live result. */
export function BusinessRatesResultProvider({ children }: { children: ReactNode }) {
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  return <Ctx.Provider value={{ outcome, setOutcome }}>{children}</Ctx.Provider>;
}

export const useBusinessRatesResult = () => useContext(Ctx);

export function WhatThisMeans({ className }: { className?: string }) {
  const { outcome } = useBusinessRatesResult();
  return (
    <p className={className} aria-live="polite">
      {whatThisMeans(outcome)}
    </p>
  );
}
