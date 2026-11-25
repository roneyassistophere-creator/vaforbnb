import { brand } from "@/config/brand";
import { footerColumns } from "@/config/navigation";
import { Logo } from "@/components/ui/Logo";
import { SmartLink } from "@/components/ui/SmartLink";

export function SiteFooter() {
  const { legal } = brand;
  return (
    <footer className="bg-ink-deep text-mist">
      <div className="wrap pt-14 pb-9">
        <div className="mb-9 flex flex-wrap justify-between gap-8">
          <div className="max-w-[320px]">
            <div className="mb-3.5">
              <Logo onDark />
            </div>
            <p className="m-0 text-sm leading-[1.6]">
              {brand.shortDescription} {brand.hours.label}.
            </p>
            {brand.contact.email && (
              <p className="mt-3 mb-0 text-sm">
                <a href={`mailto:${brand.contact.email}`} className="text-white no-underline hover:text-coral-200">
                  {brand.contact.email}
                </a>
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-12 text-sm">
            {footerColumns.map((col) => (
              <div key={col.heading} className="flex flex-col gap-2.5">
                <span className="font-extrabold text-white">{col.heading}</span>
                {col.links.map((l) => (
                  <SmartLink key={l.label} href={l.href} className="text-mist no-underline hover:text-white">
                    {l.label}
                  </SmartLink>
                ))}
              </div>
            ))}
          </div>
        </div>
        <p className="m-0 border-t border-night-line pt-5 text-[13px] text-faint">
          © {legal.copyrightYear} {brand.name}. {legal.registeredIn}. {legal.disclaimer}{" "}
          {legal.privacyUrl ? (
            <SmartLink href={legal.privacyUrl} className="text-faint hover:text-white">
              Privacy notice
            </SmartLink>
          ) : (
            "Privacy notice"
          )}{" "}
          ·{" "}
          {legal.termsUrl ? (
            <SmartLink href={legal.termsUrl} className="text-faint hover:text-white">
              Terms
            </SmartLink>
          ) : (
            "Terms"
          )}
        </p>
      </div>
    </footer>
  );
}
