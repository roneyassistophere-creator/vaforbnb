import Link from "next/link";
import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { routes } from "@/config/navigation";
import { definePageSeo } from "@/lib/seo";

const seo = definePageSeo({
  path: "/404",
  title: "Page not found",
  description: "This page doesn’t exist.",
  noIndex: true,
});

export const metadata: Metadata = { title: seo.title, robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <PageShell seo={seo} flavor="home">
      <section className="sec bg-sand">
        <div className="wrap text-center">
          <p className="eyebrow">404</p>
          <h1 className="h2">
            We couldn’t find <em>that page</em>
          </h1>
          <p className="lead mx-auto mb-8">It may have moved. Try one of these instead.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={routes.home} className="btn btn-ink">
              Home
            </Link>
            <Link href={routes.services} className="btn btn-outline">
              Services
            </Link>
            <Link href={routes.freeTools} className="btn btn-outline">
              Free tools
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
