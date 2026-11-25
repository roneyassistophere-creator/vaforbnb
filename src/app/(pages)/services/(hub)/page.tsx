import { brand } from "@/config/brand";
import { prices, showPrice } from "@/config/pricing";
import { packages, services } from "@/content/services";
import { cn } from "@/lib/cn";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Faq } from "@/components/ui/Faq";
import { Icon } from "@/components/ui/Icon";
import { SmartLink } from "@/components/ui/SmartLink";
import { ServiceFinder } from "./_components/ServiceFinder";
import { always, faq, steps } from "./content";
import { seo } from "./seo";

export default function ServicesPage() {
  return (
    <>
      <ServiceFinder breadcrumbs={<Breadcrumbs seo={seo} />} />

      {/* PACKAGES COMPARE */}
      <section className="sec bg-white" id="packages">
        <div className="wrap grid grid-cols-1 items-start gap-12 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <p className="eyebrow">Packages</p>
            <h2 className="h2">Prefer a package? Here’s what’s in each</h2>
            <p className="lead mb-[22px]">
              Most hosts start with Run, then add Grow or Build when they’re ready. You can also pick single services.
            </p>
            <div className="grid gap-2.5">
              {packages.map((k) => (
                <div key={k.key} className="flex items-center gap-3.5 rounded-[14px] bg-cloud px-4 py-3.5">
                  <span
                    className="font-sora flex size-9 flex-none items-center justify-center rounded-[10px] font-bold"
                    style={{ background: k.bg, color: k.fg }}
                  >
                    {k.n}
                  </span>
                  <div>
                    <p className="m-0 text-[15px] font-extrabold">{k.title}</p>
                    <p className="m-0 mt-0.5 text-[13px] text-muted">
                      {k.line} · from {showPrice(prices[k.key])}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="bg-cloud">
                  <th className="px-[18px] py-3.5 text-left text-xs font-extrabold tracking-[1px] text-muted uppercase">Service</th>
                  {packages.map((p) => (
                    <th key={p.key} className="px-2.5 py-3.5 font-extrabold">
                      {p.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} className="border-t border-line-4">
                    <th scope="row" className="px-[18px] py-3 text-left font-bold">
                      {s.name}
                    </th>
                    {packages.map((p) => {
                      const yes = s.pack === p.key;
                      return (
                        <td key={p.key} className={cn("px-2.5 py-3 text-center font-extrabold", yes ? "text-green" : "text-faint")}>
                          <span aria-hidden="true">{yes ? "✓" : "—"}</span>
                          <span className="sr-only-label">{yes ? "Included" : "Not included"}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="m-0 border-t border-line-4 px-[18px] py-3 text-xs text-subtle">
              ✓ included · — not in this package (can be added as a single service). Final mix confirmed when prices are
              set.
            </p>
          </div>
        </div>
      </section>

      {/* INCLUDED IN EVERY SERVICE */}
      <section className="sec" id="every-service">
        <div className="wrap">
          <div className="mb-9 max-w-[640px]">
            <p className="eyebrow">Every service, every plan</p>
            <h2 className="h2">What you get, whichever services you choose</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {always.map((a) => (
              <div key={a.h} className="card p-6">
                <Icon name={a.icon} size={26} color="#B8383A" />
                <h3 className="m-0 mt-3.5 mb-1.5 text-base font-extrabold">{a.h}</h3>
                <p className="m-0 text-sm leading-[1.55] text-body">{a.t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW WE START */}
      <section className="bg-white py-14 md:py-[72px]">
        <div className="wrap grid grid-cols-1 items-stretch gap-5 md:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <p className="eyebrow">Getting started</p>
            <h2 className="h2 md:text-[30px]">Start in three steps</h2>
            <p className="lead text-[15px]">No long contract to read first. A call, an audit, then we get to work.</p>
          </div>
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl bg-cloud p-[22px]">
              <span className="font-sora mb-3.5 inline-flex size-[34px] items-center justify-center rounded-full bg-ink font-bold text-white">
                {s.n}
              </span>
              <h3 className="m-0 mb-1.5 text-base font-extrabold">{s.h}</h3>
              <p className="m-0 text-sm leading-[1.55] text-body">{s.t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="sec">
        <div className="wrap grid grid-cols-1 items-start gap-12 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2 className="h2">Questions about our services</h2>
            <p className="lead mb-5">More answers on each service page.</p>
            <SmartLink href={brand.links.bookCall} className="btn btn-outline">
              Book a 20-minute call
            </SmartLink>
          </div>
          <Faq items={faq} variant="services" />
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="wrap">
          <div className="grid grid-cols-1 items-center gap-8 rounded-3xl bg-coral p-7 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] md:p-12">
            <div>
              <h2 className="font-sora m-0 mb-2.5 text-[30px] leading-[1.1] font-semibold tracking-[-1.2px] text-ink md:text-[38px]">
                Not sure which services you need?
              </h2>
              <p className="m-0 text-base leading-[1.6] text-ink">
                Send us your listing. We’ll review it for free and tell you honestly what we’d fix first, even if that’s
                nothing we sell.
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <SmartLink href={brand.links.freeAudit} className="btn btn-ink">
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
