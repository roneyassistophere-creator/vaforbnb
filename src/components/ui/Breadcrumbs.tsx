import Link from "next/link";
import { Fragment } from "react";
import { cn } from "@/lib/cn";
import type { PageSeo } from "@/lib/seo";

type Props = {
  seo: PageSeo;
  separator?: "/" | "›";
  onDark?: boolean;
  className?: string;
};

/** Visible breadcrumb trail, driven by the page's `seo.breadcrumbs` (also used for JSON-LD). */
export function Breadcrumbs({ seo, separator = "/", onDark = false, className }: Props) {
  const trail = [{ name: "Home", path: "/" }, ...(seo.breadcrumbs ?? [])];
  const muted = onDark ? "text-faint" : "text-muted";
  return (
    <nav aria-label="Breadcrumb" className={cn("text-[13px]", muted, className)}>
      {trail.map((c, i) => {
        const last = i === trail.length - 1;
        return (
          <Fragment key={c.name}>
            {i > 0 && <span aria-hidden="true"> {separator} </span>}
            {last ? (
              <span aria-current="page" className={cn("font-bold", onDark ? "text-white" : "text-ink")}>
                {c.name}
              </span>
            ) : c.path ? (
              <Link href={c.path} className={cn("no-underline hover:underline", muted)}>
                {c.name}
              </Link>
            ) : (
              <span>{c.name}</span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
