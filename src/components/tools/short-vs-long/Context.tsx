"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Inputs } from "@/lib/tools/short-vs-long";

type Ctx = { inputs: Inputs | null; valid: boolean; setResult: (i: Inputs | null, valid: boolean) => void };
const Context = createContext<Ctx>({ inputs: null, valid: false, setResult: () => {} });

/** Shares the current inputs with "What this means" (rendered after the server-side cards). */
export function SvlProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ inputs: Inputs | null; valid: boolean }>({ inputs: null, valid: false });
  const setResult = useCallback((inputs: Inputs | null, valid: boolean) => setState({ inputs, valid }), []);
  const value = useMemo(() => ({ ...state, setResult }), [state, setResult]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useSvl = () => useContext(Context);
