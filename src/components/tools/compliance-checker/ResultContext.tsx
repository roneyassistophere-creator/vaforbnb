"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { whatThisMeans, whatThisMeansDefault } from "@/content/tools/complianceChecker";
import type { Answers, ComplianceResult } from "@/lib/tools/compliance";

type Shown = { result: ComplianceResult; answers: Answers } | null;
const Ctx = createContext<{ shown: Shown; setShown: (s: Shown) => void }>({ shown: null, setShown: () => {} });

/** Lets page sections (e.g. "What this means") react to the checker's result. */
export function ComplianceResultProvider({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState<Shown>(null);
  return <Ctx.Provider value={{ shown, setShown }}>{children}</Ctx.Provider>;
}

export const useComplianceResult = () => useContext(Ctx);

/** "What this means": a general paragraph, replaced by one chosen for the result. */
export function WhatThisMeans({ className }: { className?: string }) {
  const { shown } = useComplianceResult();
  return (
    <p className={className} aria-live="polite">
      {shown ? whatThisMeans(shown.result, shown.answers) : whatThisMeansDefault}
    </p>
  );
}
