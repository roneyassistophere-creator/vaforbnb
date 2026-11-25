"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type Ctx = { text: string | null; setText: (s: string | null) => void };
const Context = createContext<Ctx>({ text: null, setText: () => {} });

/** Lets "What this means" follow the register's state (the text only: never guest data). */
export function RegisterResultProvider({ children }: { children: ReactNode }) {
  const [text, setText] = useState<string | null>(null);
  return <Context.Provider value={{ text, setText }}>{children}</Context.Provider>;
}

export const useRegisterResult = () => useContext(Context);

export function WhatThisMeans({ className, fallback }: { className?: string; fallback: string }) {
  const { text } = useRegisterResult();
  return (
    <p className={className} aria-live="polite">
      {text ?? fallback}
    </p>
  );
}
