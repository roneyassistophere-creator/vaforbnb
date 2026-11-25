import { brand } from "@/config/brand";
import { routes } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Faq } from "@/components/ui/Faq";
import { Cross, Tick } from "@/components/ui/Marks";
import { SmartLink } from "@/components/ui/SmartLink";
import { PersonaExplorer } from "./_components/PersonaExplorer";
import { faq, fitNo, fitYes, nations, sizes, stack } from "./content";
import { seo } from "./seo";


export default function WhoWeHelpPage() {
  return (
    <>
      <PersonaExplorer breadcrumbs={<Breadcrumbs seo={seo} onDark />} />

      {/* BY PORTFOLIO SIZE */}
      <section className="sec bg-cloud-2">
        <div className="wrap">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">By portfolio size</p>
              <h2 className="h2 m-0">One property or fifty, the support grows with you</h2>
            </div>
            <p className="lead max-w-[380px]">
              You don’t need many properties to work with us. Here’s what support usually looks like at each stage.
            </p>
          </div>
          <div className="grid grid-cols-1 overflow-hidden rounded-[22px] border border-line bg-white sm:grid-cols-2 md:grid-cols-4">
            {sizes.map((z, i) => (
              <div
                key={z.n}
                className={cn(
                  "flex flex-col gap-3 px-6 py-7",
                  i > 0 && "border-t border-line sm:border-t-0 md:border-l",
                  i === 2 && "sm:border-t md:border-t-0",
                  i === 3 && "sm:border-t sm:border-l md:border-t-0",
                )}
              >
                <p className="font-outfit m-0 text-4xl font-semibold tracking-[-1px] text-brand">{z.n}</p>
                <p className="m-0 text-xs font-extrabold tracking-[1px] text-muted uppercase">{z.l}</p>
                <h3 className="m-0 text-[15px] font-extrabold">{z.h}</h3>
                <ul className="m-0 grid flex-1 list-none gap-[7px] p-0">
                  {z.pts.map((x) => (
                    <li key={x} className="flex items-start gap-2 text-[13px] leading-normal text-ink-soft">
                      <span className="mt-[7px] size-[5px] flex-none rounded-full bg-coral" />
                      {x}
                    </li>
                  ))}
                </ul>
                <span className="self-start rounded-full bg-fog px-2.5 py-[5px] text-xs font-extrabold">{z.pkg}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHERE IN THE UK */}
      <section className="sec">
        <div className="wrap grid grid-cols-1 items-start gap-14 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <p className="eyebrow">Across the UK</p>
            <h2 className="h2">Every nation has different rules. We keep track.</h2>
            <p className="lead mb-[22px]">
              Our team works with hosts in England, Scotland, Wales and Northern Ireland. We help you keep dates, records
              and listing details in order, and our free UK Rules Hub explains the rules in plain English.
            </p>
            <SmartLink href={routes.ukRules} className="btn btn-outline">
              Open the UK Rules Hub
            </SmartLink>
            <p className="mt-3.5 mb-0 text-xs text-subtle">
              General information, not legal advice. Last checked: {brand.content.rulesLastChecked}.
            </p>
          </div>
          <div className="grid gap-2.5">
            {nations.map((n) => (
              <div
                key={n.t}
                className="grid grid-cols-1 items-center gap-[18px] rounded-2xl border border-line px-5 py-[18px] md:grid-cols-[180px_minmax(0,1fr)]"
              >
                <span className="flex items-center gap-2.5">
                  <span className="size-2.5 rounded-[3px]" style={{ background: n.c }} />
                  <span className="text-base font-extrabold">{n.t}</span>
                </span>
                <span className="text-sm leading-[1.55] text-body">{n.r}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOOLS WE WORK WITH */}
      <section className="pb-[88px]">
        <div className="wrap">
          <div className="rounded-[22px] bg-sand p-7 md:p-9">
            <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
              <div>
                <h2 className="font-outfit m-0 mb-1.5 text-2xl font-semibold tracking-[-0.6px]">We work inside your setup</h2>
                <p className="m-0 text-sm leading-[1.6] text-body">
                  No need to change platforms. We work in the tools you already use, and help set one up if you need it.
                </p>
              </div>
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {stack.map((s) => (
                  <li key={s} className="rounded-xl border border-sand-edge bg-white px-3.5 py-2.5 text-sm font-bold">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 mb-0 text-xs text-subtle">
              Platform names are used for information only. Confirm this list matches the tools your team uses.
            </p>
          </div>
        </div>
      </section>

      {/* HONEST FIT */}
      <section className="sec bg-cloud-2">
        <div className="wrap">
          <div className="mb-10 text-center">
            <p className="eyebrow">Honest fit</p>
            <h2 className="h2">Are we right for you?</h2>
            <p className="lead mx-auto max-w-[560px]">
              We’d rather tell you now than waste your time. Here’s when we work well, and when we don’t.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-[22px] border border-line bg-white p-8">
              <h3 className="font-outfit m-0 mb-[18px] text-[22px] font-semibold text-green">A great fit if you…</h3>
              <ul className="m-0 grid list-none gap-3.5 p-0">
                {fitYes.map((x) => (
                  <li key={x} className="flex items-start gap-3 text-[15px] leading-normal font-semibold">
                    <Tick className="mt-0.5" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[22px] border border-line bg-white p-8">
              <h3 className="font-outfit m-0 mb-[18px] text-[22px] font-semibold text-brand">Probably not a fit if you…</h3>
              <ul className="m-0 grid list-none gap-3.5 p-0">
                {fitNo.map((x) => (
                  <li key={x} className="flex items-start gap-3 text-[15px] leading-normal text-body">
                    <Cross className="mt-0.5" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec">
        <div className="wrap grid grid-cols-1 items-start gap-12 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2 className="h2">Questions about working with us</h2>
            <p className="lead mb-5">Still unsure if we’re right for your setup? Ask us.</p>
            <SmartLink href={brand.links.bookCall} className="btn btn-outline">
              Book a 20-minute call
            </SmartLink>
          </div>
          <Faq items={faq} variant="who" />
        </div>
      </section>

      {/* CTA */}
      <section className="pb-[88px]">
        <div className="wrap">
          <div className="rounded-[26px] bg-ink px-6 py-14 text-center text-white md:px-12">
            <h2 className="font-outfit mx-auto mb-3 max-w-[720px] text-[32px] leading-[1.1] font-semibold tracking-[-1.2px] md:text-[42px]">
              Whatever your setup, let’s see where we can help
            </h2>
            <p className="mx-auto mb-7 max-w-[540px] text-base leading-[1.6] text-mist">
              Send us your listing for a free audit, or book a 20-minute call. Honest advice, no obligation.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <SmartLink href={brand.links.freeAudit} className="btn btn-coral">
                Get a free listing audit
              </SmartLink>
              <SmartLink href={brand.links.bookCall} className="btn btn-white">
                Book a 20-minute call
              </SmartLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
