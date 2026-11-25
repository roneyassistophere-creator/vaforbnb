"use client";

import { useState } from "react";
import { brand } from "@/config/brand";
import { formatMoney, prices, showPrice } from "@/config/pricing";

export function CommissionCompare() {
  const [rev, setRev] = useState("2000");
  const [com, setCom] = useState("20");

  const revenue = Math.max(0, parseFloat(rev) || 0);
  const rate = Math.max(0, parseFloat(com) || 0);
  const comCost = (revenue * rate) / 100;
  const runPrice = prices.run;

  const diffLine =
    runPrice > 0
      ? comCost > runPrice
        ? `On these numbers, a fixed fee costs ${formatMoney(comCost - runPrice)} less per month. Remember to compare what each includes.`
        : "On these numbers, commission costs less. A fixed fee helps most as your income grows."
      : "Our Run price will show here once it’s set.";

  return (
    <div className="card p-6 md:p-7">
      <div className="mb-[22px] grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <div>
          <label htmlFor="rev" className="mb-1.5 block text-[13px] font-extrabold">
            Monthly booking income per property (£)
          </label>
          <input
            id="rev"
            type="number"
            inputMode="decimal"
            min={0}
            value={rev}
            onChange={(e) => setRev(e.target.value)}
            className="field border-[1.5px] text-base font-bold"
          />
        </div>
        <div>
          <label htmlFor="com" className="mb-1.5 block text-[13px] font-extrabold">
            Commission rate you were quoted (%)
          </label>
          <input
            id="com"
            type="number"
            inputMode="decimal"
            min={0}
            max={60}
            value={com}
            onChange={(e) => setCom(e.target.value)}
            className="field border-[1.5px] text-base font-bold"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2" aria-live="polite">
        <div className="rounded-2xl bg-cloud p-5">
          <p className="m-0 mb-1.5 text-[13px] font-bold text-muted">Commission model</p>
          <p className="font-jakarta m-0 mb-1 text-[30px] font-extrabold">{formatMoney(comCost)}</p>
          <p className="m-0 text-xs text-muted">per month, rises with income</p>
        </div>
        <div className="rounded-2xl bg-coral-50 p-5">
          <p className="m-0 mb-1.5 text-[13px] font-bold text-brand">{brand.name} Run</p>
          <p className="font-jakarta m-0 mb-1 text-[30px] font-extrabold">{showPrice(runPrice)}</p>
          <p className="m-0 text-xs text-muted">per month, stays the same</p>
        </div>
      </div>
      <p className="mt-4 mb-0 text-sm font-bold">{diffLine}</p>
    </div>
  );
}
