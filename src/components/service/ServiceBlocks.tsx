import type { ReactNode } from "react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import type { FaqEntry } from "@/lib/seo";
import { SmartLink } from "@/components/ui/SmartLink";

/** Building blocks shared by the individual service pages (/services/*). */

/** Pink pill label with a coral dot, used above section headings. */
export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "m-0 mb-[18px] inline-flex items-center gap-2 rounded-full bg-coral-50 px-3.5 py-[7px] text-[13px] font-bold text-ink",
        className,
      )}
    >
      <i className="inline-block size-[7px] rounded-full bg-coral" aria-hidden="true" />
      {children}
    </p>
  );
}

/** Centred section heading: kicker, h2 and lead. */
export function SectionHead({
  kicker,
  title,
  lead,
  className,
  kickerClassName,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
  kickerClassName?: string;
}) {
  return (
    <div className={cn("mx-auto mb-14 max-w-[760px] text-center", className)}>
      {kicker && <Kicker className={kickerClassName}>{kicker}</Kicker>}
      <h2 className="h2">{title}</h2>
      {lead && <p className="lead">{lead}</p>}
    </div>
  );
}

type Cta = { label: string; href: string };

/** Dark "Included in the Run package" band at the bottom of service pages. */
export function PackageCta({
  id = "call",
  kicker = "Included in the Run package",
  title,
  text,
  primary = { label: "Book a 20-minute call", href: brand.links.bookCall },
  secondary = { label: "Get a free listing audit", href: brand.links.freeAudit },
}: {
  id?: string;
  kicker?: string;
  title: ReactNode;
  text: ReactNode;
  primary?: Cta;
  secondary?: Cta | null;
}) {
  return (
    <section id={id} className="bg-ink text-white">
      <div className="wrap py-16 text-center md:py-[88px]">
        <p className="m-0 mb-3.5 text-[13px] font-extrabold tracking-[1.4px] text-coral-200 uppercase">{kicker}</p>
        <h2 className="mx-auto mb-4 max-w-[760px] text-[32px] leading-[1.1] font-extrabold tracking-[-1.6px] md:text-[44px]">
          {title}
        </h2>
        <p className="mx-auto mb-8 max-w-[640px] text-[17px] leading-[1.6] text-mist">{text}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <SmartLink href={primary.href} className="btn btn-coral">
            {primary.label}
          </SmartLink>
          {secondary && (
            <SmartLink
              href={secondary.href}
              className="btn border-[1.5px] border-[#4A5A66] bg-transparent text-white hover:border-white hover:text-white"
            >
              {secondary.label}
            </SmartLink>
          )}
        </div>
      </div>
    </section>
  );
}

/** Open (non-accordion) two-column FAQ grid. */
export function FaqGrid({ items }: { items: FaqEntry[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-14 md:grid-cols-2">
      {items.map((q) => (
        <div key={q.q} className="border-t border-line py-[26px]">
          <h3 className="m-0 mb-2.5 text-lg font-extrabold">{q.q}</h3>
          <p className="m-0 text-[15px] leading-[1.65] text-body">{q.a}</p>
        </div>
      ))}
    </div>
  );
}

/** Boxed accordion FAQ using native <details> (works without JavaScript). */
export function DetailsFaq({ items, className, boxClassName }: { items: FaqEntry[]; className?: string; boxClassName?: string }) {
  return (
    <div className={cn("grid grid-cols-1 items-start gap-2.5 md:grid-cols-2", className)}>
      {items.map((q) => (
        <details key={q.q} className={cn("group rounded-[18px] bg-[#F6F8FA] px-[22px]", boxClassName)}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[17px] font-extrabold text-ink [&::-webkit-details-marker]:hidden">
            {q.q}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="flex-none transition-transform group-open:rotate-45"
            >
              <path d="M12 5v14M5 12h14" stroke="#14212B" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </summary>
          <p className="m-0 mb-5 text-[15px] leading-[1.65] text-body">{q.a}</p>
        </details>
      ))}
    </div>
  );
}

export type RelatedLink = { k: string; h: string; href: string };

/** Row of related pages, with an optional sources note underneath. */
export function RelatedLinks({ items, sources, className }: { items: RelatedLink[]; sources?: ReactNode; className?: string }) {
  return (
    <section className={cn("bg-sand", className)}>
      <div className="wrap py-[72px]">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          {items.map((r) => (
            <SmartLink
              key={r.h}
              href={r.href}
              className="box-border flex min-h-[76px] items-center justify-between gap-3 rounded-2xl bg-white px-6 py-[22px] text-ink no-underline hover:text-ink hover:shadow-[0_10px_28px_rgba(20,33,43,0.08)]"
            >
              <span>
                <span className="mb-1 block text-xs font-extrabold tracking-[1px] text-brand uppercase">{r.k}</span>
                <span className="text-base font-extrabold">{r.h}</span>
              </span>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="flex-none">
                <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="#14212B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </SmartLink>
          ))}
        </div>
        {sources && <div className="mt-9 text-[13px] leading-[1.7] text-muted">{sources}</div>}
      </div>
    </section>
  );
}

/** Dashed placeholder cards for proof numbers that still need real evidence. */
export function ProofGrid({ items }: { items: { v: string; k: string; e: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
      {items.map((p) => (
        <div key={p.k} className="rounded-[18px] border-2 border-dashed border-line-strong p-[26px]">
          <div className="mb-2 text-[40px] font-extrabold tracking-[-1.5px]">{p.v}</div>
          <p className="m-0 mb-3.5 text-[15px] leading-[1.45] font-bold">{p.k}</p>
          <p className="m-0 text-[13px] text-muted">{p.e}</p>
        </div>
      ))}
    </div>
  );
}

/** "Reviewed by" line used under sources. */
export const reviewedBy = (updated: string) =>
  `Reviewed by ${brand.team.founder.name}, ${brand.team.founder.role} · Updated ${updated}.`;
