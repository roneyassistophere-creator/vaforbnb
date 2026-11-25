"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { InfoBadge } from "@/components/tools/Badges";
import { copy } from "@/content/tools/profitCopy";

export type Kit = "new-host" | "growing" | null;
const Context = createContext<Kit>(null);

/** Which starter kit the host arrived from (?kit=new-host or ?kit=growing). Only known in the browser. */
export function ProfitProvider({ children }: { children: ReactNode }) {
  const [kit, setKit] = useState<Kit>(null);
  useEffect(() => {
    try {
      const k = new URLSearchParams(window.location.search).get("kit");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the URL is only known in the browser
      setKit(k === "new-host" || k === "growing" ? k : null);
    } catch {
      // ignore
    }
  }, []);
  return <Context.Provider value={kit}>{children}</Context.Provider>;
}

export const useKit = () => useContext(Context);

export function KitBadge() {
  const kit = useKit();
  if (!kit) return null;
  return (
    <InfoBadge dot="#F0595A">
      <span data-kit-badge>{kit === "new-host" ? copy.kit.newHost.badge : copy.kit.growing.badge}</span>
    </InfoBadge>
  );
}
