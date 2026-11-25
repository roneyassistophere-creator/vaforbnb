import { connection } from "next/server";
import { Suspense } from "react";
import { getComplianceData } from "@/lib/server/compliance";
import { londonToday } from "@/lib/tools/compliance";
import { ComplianceChecker } from "./ComplianceChecker";

/**
 * Server side of the checker: reads rules and figures (cached) at request
 * time and hands them to the browser component. The browser never queries
 * the database.
 */
async function CheckerWithData() {
  await connection();
  const { rules, figures } = await getComplianceData();
  return <ComplianceChecker rules={rules} figures={figures} today={londonToday()} />;
}

function CheckerSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]" aria-busy="true" aria-label="Loading the checker">
      <div className="h-[460px] animate-pulse rounded-[20px] border border-line bg-white" />
      <div className="h-[320px] animate-pulse rounded-[20px] bg-ink" />
    </div>
  );
}

export function ComplianceCheckerSection() {
  return (
    <Suspense fallback={<CheckerSkeleton />}>
      <CheckerWithData />
    </Suspense>
  );
}

/** Re-exported for existing imports; the badge is shared by all tools. */
export { RulesLastCheckedBadge } from "../RulesLastChecked";
