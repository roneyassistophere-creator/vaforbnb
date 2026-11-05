import type { Metadata } from 'next'
import React from 'react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { jsonLdScript, webPageSchema, breadcrumbSchema } from '@/utilities/jsonld'
import siteConfig from '@/config/site'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('privacy').catch(() => null)
  return generatePageMeta({ slug: 'privacy', seoDoc, fallbackTitle: 'Privacy Policy' })
}

const legalBases = [
  { title: 'Consent', body: 'Where you have given clear consent for us to process your data for a specific purpose.' },
  { title: 'Contract', body: 'Where processing is necessary to perform a contract with you, such as delivering our services.' },
  { title: 'Legitimate Interest', body: 'Where processing is necessary for our legitimate business interests, provided this does not override your rights.' },
  { title: 'Legal Obligation', body: 'Where we are required to process data to comply with the law.' },
]

export default async function PrivacyPage() {
  const seoDoc = await getPageSEO('privacy').catch(() => null)
  const effectiveDate = `1 ${new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date())}`

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            webPageSchema({
              name: seoDoc?.meta?.title ?? 'Privacy Policy',
              description: seoDoc?.meta?.description ?? `Privacy Policy for ${siteConfig.name}.`,
              url: `${siteConfig.url}/privacy`,
            }),
            breadcrumbSchema([
              { name: 'Home', href: '/' },
              { name: 'Privacy Policy', href: '/privacy' },
            ]),
          ]),
        }}
      />

      <section className="py-24 bg-muted text-center px-4">
        <div className="container max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Effective date: {effectiveDate}</p>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container max-w-3xl prose">
          <h2>1. Introduction</h2>
          <p>
            {siteConfig.org.legalName} (&quot;{siteConfig.name}&quot;, &quot;we&quot;, &quot;us&quot;) respects your privacy and is
            committed to protecting the personal data of our clients, website visitors, and their
            guests. This policy explains what information we collect, how we use it, and the
            rights you have over it.
          </p>

          <h2>2. Information We Collect</h2>
          <h3>Personal Information</h3>
          <p>
            Name, email address, phone number, business/property details, and any information you
            provide when contacting us or engaging our services.
          </p>
          <h3>Usage Data</h3>
          <p>
            Standard technical data such as IP address, browser type, and pages visited, collected
            automatically when you use our website.
          </p>
          <h3>Communication Data</h3>
          <p>
            Records of correspondence between you (or your guests) and our team, kept to deliver
            and improve our services.
          </p>

          <h2>3. How We Use Your Information</h2>
          <p>
            To deliver the services you have engaged us for, communicate with you and your guests
            on your behalf, improve our operations, and meet our legal obligations.
          </p>

          <h2>4. Legal Basis for Processing (UK GDPR)</h2>
          <div className="not-prose grid sm:grid-cols-2 gap-6 my-6">
            {legalBases.map((basis) => (
              <div key={basis.title} className="rounded-lg border border-border p-6">
                <h3 className="font-semibold mb-2">{basis.title}</h3>
                <p className="text-sm text-muted-foreground">{basis.body}</p>
              </div>
            ))}
          </div>

          <h2>5. How We Store and Protect Your Data</h2>
          <p>
            We use reputable, secure providers to store data and restrict access to team members
            who need it to deliver our services. Access to guest-facing platforms is granted
            through revocable methods wherever supported.
          </p>

          <h2>6. Data Sharing</h2>
          <p>
            We do not sell your personal data. We may share data with trusted third-party tools
            used to deliver our services (for example, property management or scheduling
            software), and where required by law.
          </p>

          <h2>7. Cookies</h2>
          <p>
            Our website may use cookies to understand usage and improve the site. You can control
            cookies through your browser settings.
          </p>

          <h2>8. Your Rights</h2>
          <p>
            Under UK GDPR you have the right to access, correct, or delete your personal data,
            restrict or object to processing, and withdraw consent at any time. Contact us using
            the details below to exercise any of these rights.
          </p>

          <h2>9. Data Retention</h2>
          <p>
            We retain personal data only for as long as necessary to provide our services and
            meet our legal and accounting obligations.
          </p>

          <h2>10. Third-Party Links</h2>
          <p>
            Our website may link to third-party sites. We are not responsible for the privacy
            practices of those sites.
          </p>

          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. Material changes will be reflected by an
            updated effective date at the top of this page.
          </p>

          <h2>12. Contact Us</h2>
          <p>
            If you have any questions about this policy or how your data is handled, contact us at{' '}
            <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>
            {siteConfig.contact.address && <> or write to us at {siteConfig.contact.address}.</>}
          </p>
        </div>
      </section>
    </>
  )
}
