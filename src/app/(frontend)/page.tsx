import type { Metadata } from 'next'
import React from 'react'

import { ClientsSection } from '@/components/sections/ClientsSection'
import { ConvertedDirectBookings } from '@/components/sections/ConvertedDirectBookings'
import { Hero } from '@/components/sections/Hero'
import { ClientReviews } from '@/components/sections/ClientReviews'
import { OurStories } from '@/components/sections/OurStories'
import { Philosophy } from '@/components/sections/Philosophy'
import { PricingSection } from '@/components/sections/PricingSection'
import { ProcessTimeline } from '@/components/sections/ProcessTimeline'
import { ServicesBento } from '@/components/sections/ServicesBento'
import { StatsSection } from '@/components/sections/StatsSection'
import { TrustMarquee } from '@/components/sections/TrustMarquee'
import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { jsonLdScript, webPageSchema, breadcrumbSchema } from '@/utilities/jsonld'
import siteConfig from '@/config/site'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  let seoDoc = null
  try {
    seoDoc = await getPageSEO('home')
  } catch {
    seoDoc = null
  }
  return generatePageMeta({ slug: '/', seoDoc, fallbackTitle: siteConfig.seo.defaultTitle })
}

export default async function HomePage() {
  let seoDoc = null
  try {
    seoDoc = await getPageSEO('home')
  } catch {
    seoDoc = null
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            webPageSchema({
              name: seoDoc?.meta?.title ?? siteConfig.seo.defaultTitle,
              description: seoDoc?.meta?.description ?? siteConfig.seo.defaultDescription,
              url: siteConfig.url,
            }),
            breadcrumbSchema([{ name: 'Home', href: '/' }]),
          ]),
        }}
      />

      <Hero />
      <ClientsSection />
      <StatsSection />
      <ClientReviews />
      <Philosophy />
      <ConvertedDirectBookings />
      <OurStories />
      <ProcessTimeline />
      <ServicesBento />
      <PricingSection />
      <TrustMarquee />
    </>
  )
}
