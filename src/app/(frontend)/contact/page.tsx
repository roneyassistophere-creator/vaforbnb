import type { Metadata } from 'next'
import React from 'react'

import { MultiStepExpertForm } from '@/components/MultiStepExpertForm'
import { AnimatedCounter } from '@/components/motion/AnimatedCounter'
import { FloatingOrb } from '@/components/motion/FloatingOrb'
import { Reveal } from '@/components/motion/Reveal'
import { getContactForm } from '@/utilities/getContactForm'
import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { jsonLdScript, webPageSchema, breadcrumbSchema } from '@/utilities/jsonld'
import { eyebrow, heading, lede } from '@/utilities/typography'
import siteConfig from '@/config/site'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('contact').catch(() => null)
  return generatePageMeta({ slug: 'contact', seoDoc, fallbackTitle: 'Contact' })
}

export default async function ContactPage() {
  const [seoDoc, form] = await Promise.all([
    getPageSEO('contact').catch(() => null),
    getContactForm().catch(() => null),
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            webPageSchema({
              name: seoDoc?.meta?.title ?? 'Contact',
              description:
                seoDoc?.meta?.description ??
                `Get in touch with ${siteConfig.name}. We would love to discuss your properties and operational goals.`,
              url: `${siteConfig.url}/contact`,
              type: 'ContactPage',
            }),
            breadcrumbSchema([
              { name: 'Home', href: '/' },
              { name: 'Contact', href: '/contact' },
            ]),
          ]),
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-28 pb-20 text-center sm:pt-36 sm:pb-24">
        <FloatingOrb
          duration={18}
          className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-coral-soft blur-3xl sm:h-96 sm:w-96"
        />
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <p className={`mb-6 ${eyebrow}`}>Get In Touch</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mb-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Talk to an <span className="text-primary">Expert.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className={lede}>
              Ready to free your time, improve guest reviews, and optimize your nightly rates?
              Reach out and our operations team will get back to you within 15 minutes.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container mx-auto grid max-w-5xl gap-16 md:grid-cols-2">
          {/* Contact details */}
          <Reveal x={-40}>
            <h2 className="mb-6 text-xl font-semibold">Contact Information</h2>
            <dl className="flex flex-col gap-5 text-sm">
              {siteConfig.contact.email && (
                <div>
                  <dt className="mb-1 text-muted-foreground">Email</dt>
                  <dd>
                    <a
                      href={`mailto:${siteConfig.contact.email}`}
                      className="transition-colors hover:text-primary"
                    >
                      {siteConfig.contact.email}
                    </a>
                  </dd>
                </div>
              )}
              {siteConfig.contact.phone && (
                <div>
                  <dt className="mb-1 text-muted-foreground">Phone</dt>
                  <dd>
                    <a
                      href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`}
                      className="transition-colors hover:text-primary"
                    >
                      {siteConfig.contact.phone}
                    </a>
                  </dd>
                </div>
              )}
              {siteConfig.contact.address && (
                <div>
                  <dt className="mb-1 text-muted-foreground">Address</dt>
                  <dd className="whitespace-pre-line">{siteConfig.contact.address}</dd>
                </div>
              )}
            </dl>

            {siteConfig.social.length > 0 && (
              <div className="mt-10">
                <h3 className="mb-4 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Follow Us
                </h3>
                <div className="flex flex-wrap gap-3">
                  {siteConfig.social.map(({ platform, href }) => (
                    <a
                      key={platform}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="hover"
                      className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:border-primary/50 hover:text-primary"
                    >
                      {platform}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10 border-t border-border pt-8">
              <AnimatedCounter end={15} suffix="m" prefix="< " className="text-3xl font-bold text-primary" />
              <p className="mt-1 text-xs text-muted-foreground">Typical operational response time</p>
            </div>
          </Reveal>

          {/* Contact form */}
          <Reveal x={40} delay={0.15}>
            <div className="rounded-3xl border border-border/80 bg-card/80 p-6 sm:p-8 shadow-xl shadow-black/5">
              <MultiStepExpertForm formId={form?.id} />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
