import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

const isInternalRoute = (href: string) =>
  href.startsWith("/") && !href.startsWith("//") && !/\.[a-z0-9]{2,5}$/i.test(href.split(/[?#]/)[0]);

/**
 * Uses next/link for in-app routes and a plain <a> for mailto:, external URLs
 * and file downloads.
 */
export function SmartLink({ href, children, ...rest }: Props) {
  if (isInternalRoute(href)) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  const external = /^https?:\/\//.test(href);
  const download = href.startsWith("/") && !isInternalRoute(href);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...(download ? { download: "" } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}
