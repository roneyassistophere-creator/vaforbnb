"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { InfoBadge } from "@/components/tools/Badges";
import { copy } from "@/content/tools/bookingPerformanceCopy";

const Context = createContext(false);

/** True when the host arrived from the Growing host kit (?kit=growing). Only known in the browser. */
export function PerfProvider({ children }: { children: ReactNode }) {
  const [inKit, setInKit] = useState(false);
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the URL is only known in the browser
      setInKit(new URLSearchParams(window.location.search).get("kit") === "growing");
    } catch {
      // ignore
    }
  }, []);
  return <Context.Provider value={inKit}>{children}</Context.Provider>;
}

export const useInKit = () => useContext(Context);

export function KitBadge() {
  return useInKit() ? (
    <InfoBadge dot="#5B3FA0">
      <span data-kit-badge>{copy.kit.badge}</span>
    </InfoBadge>
  ) : null;
}
