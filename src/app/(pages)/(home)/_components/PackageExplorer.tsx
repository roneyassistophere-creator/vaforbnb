"use client";

import { useState } from "react";
import { anchors } from "@/config/navigation";
import { prices, showPrice } from "@/config/pricing";
import { services, type PackageKey } from "@/content/services";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { SmartLink } from "@/components/ui/SmartLink";
import { packageIntro } from "../content";

const TABS: PackageKey[] = ["run", "grow", "build"];

export function PackageExplorer() {
  const [pk, setPk] = useState<PackageKey>("run");
  const intro = packageIntro[pk];
  const items = services.filter((s) => s.pack === pk);

  return (
    <div className="grid grid-cols-1 items-start gap-14 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <div className="md:sticky md:top-6">
        <p className="eyebrow">Everything we can take off your plate</p>
        <h2 className="h2">
          Run it, grow it, or <em>build systems</em>
        </h2>
        <p className="lead mb-[26px]">
          One property virtual assistant team for every part of your short-term rental business. Choose a package, or
          just the services you need.
        </p>
        <div role="tablist" aria-label="Packages" className="mb-[22px] inline-flex gap-1 rounded-full bg-sand-200 p-1">
          {TABS.map((k) => {
            const on = pk === k;
            return (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls="package-panel"
                onClick={() => setPk(k)}
                className={cn(
                  "min-h-[44px] cursor-pointer rounded-full border-none px-[18px] text-sm font-bold",
                  on ? "bg-ink text-white" : "bg-transparent text-ink",
                )}
              >
                {packageIntro[k].title}
              </button>
            );
          })}
        </div>
        <div className="rounded-[18px] bg-sand p-[22px]">
          <p className="font-serif m-0 mb-1.5 text-[28px]">{intro.title}</p>
          <p className="m-0 mb-3.5 text-[15px] leading-[1.6] text-body">{intro.who}</p>
          <p className="m-0 text-sm font-bold">
            From {showPrice(prices[pk])} {intro.unit}
          </p>
        </div>
      </div>

      <div id="package-panel" role="tabpanel" className="grid border-t border-sand-line">
        {items.map((i) => (
          <SmartLink
            key={i.id}
            href={anchors.service(i.id)}
            className="group grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-[18px] border-b border-sand-line px-1 py-[22px] text-ink no-underline hover:text-ink"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-coral-50">
              <Icon name={i.icon} color="#B8383A" />
            </span>
            <span>
              <span className="mb-[3px] block text-lg font-extrabold tracking-[-0.3px]">{i.name}</span>
              <span className="block text-sm text-muted">{i.summary}</span>
            </span>
            <span className="text-xl text-brand transition-transform group-hover:translate-x-1">→</span>
          </SmartLink>
        ))}
      </div>
    </div>
  );
}
