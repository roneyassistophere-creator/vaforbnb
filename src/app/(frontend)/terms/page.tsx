import type { Metadata } from 'next'
import React from 'react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { jsonLdScript, webPageSchema, breadcrumbSchema } from '@/utilities/jsonld'
import siteConfig from '@/config/site'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('terms').catch(() => null)
  return generatePageMeta({ slug: 'terms', seoDoc, fallbackTitle: 'Terms of Service' })
}

export default async function TermsPage() {
  const seoDoc = await getPageSEO('terms').catch(() => null)
  const effectiveDate = `1 ${new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date())}`

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            webPageSchema({
              name: seoDoc?.meta?.title ?? 'Terms of Service',
              description: seoDoc?.meta?.description ?? `Terms of Service for ${siteConfig.name}.`,
              url: `${siteConfig.url}/terms`,
            }),
            breadcrumbSchema([
              { name: 'Home', href: '/' },
              { name: 'Terms of Service', href: '/terms' },
            ]),
          ]),
        }}
      />

      <section className="py-24 bg-muted text-center px-4">
        <div className="container max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Effective date: {effectiveDate}</p>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container max-w-3xl prose">
          <h2>1. Introduction</h2>
          <p>
            These terms govern your use of {siteConfig.name}&apos;s website and services. By
            engaging {siteConfig.org.legalName}, you agree to these terms.
          </p>

          <h2>2. Solutions</h2>
          <p>Our services may include, depending on what is agreed with you:</p>
          <ul>
            <li>Short-term rental virtual assistance</li>
            <li>Guest communication and operational support</li>
            <li>Listing optimisation and pricing management</li>
            <li>Systems building and consultancy</li>
            <li>Marketing and social media management</li>
          </ul>

          <h2>3. Client Responsibilities</h2>
          <p>
            You agree to provide accurate information about your properties, timely access to
            relevant platforms and accounts, and reasonable cooperation needed for us to deliver
            the agreed services.
          </p>

          <h2>4. Payments and Fees</h2>
          <p>
            Fees are set out in your proposal or agreement. Unless otherwise stated, all fees are
            non-refundable once services have been rendered.
          </p>

          <h2>5. Service Scope</h2>
          <p>
            The specific scope of services is defined in your individual proposal or agreement.
            Any work outside that scope will be discussed and agreed separately.
          </p>

          <h2>6. No Guaranteed Results</h2>
          <p>
            While we work to improve occupancy, revenue, and operational efficiency, we do not and
            cannot guarantee specific booking numbers, revenue figures, or occupancy rates, as
            these depend on factors outside our control.
          </p>

          <h2>7. Use of Third-Party Platforms</h2>
          <p>
            Our services rely on third-party platforms including Airbnb, Booking.com, property
            management systems, and social media platforms. We are not liable for outages, policy
            changes, listing suspensions, or other actions taken by these third parties.
          </p>

          <h2>8. Data and Access</h2>
          <p>
            Any access granted to your accounts or systems will be used solely to deliver the
            agreed services, in line with our{' '}
            <a href="/privacy">Privacy Policy</a>.
          </p>

          <h2>9. Confidentiality</h2>
          <p>
            We treat all client information as confidential and will not share it with other
            clients or third parties except as necessary to deliver our services.
          </p>

          <h2>10. Termination</h2>
          <p>
            Either party may terminate a services agreement in line with the notice period set
            out in that agreement.
          </p>

          <h2>11. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, {siteConfig.name} is not liable for loss of
            revenue, guest disputes, platform penalties, or other indirect losses. Our total
            liability is capped at the value of services paid in the preceding three months.
          </p>

          <h2>12. Intellectual Property</h2>
          <p>
            {siteConfig.name} retains ownership of any tools, templates, or systems we develop,
            unless otherwise agreed in writing.
          </p>

          <h2>13. Changes to These Terms</h2>
          <p>
            We may update these terms from time to time. Material changes will be reflected by an
            updated effective date at the top of this page.
          </p>

          <h2>14. Governing Law</h2>
          <p>These terms are governed by the laws of the United Kingdom.</p>

          <h2>15. Contact Information</h2>
          <p>
            Questions about these terms can be sent to{' '}
            <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>
            {siteConfig.contact.address && <> or {siteConfig.contact.address}.</>}
          </p>
        </div>
      </section>
    </>
  )
}
