/**
 * Ensures noindex PageSEO docs exist for placeholder legal pages, so search
 * engines skip them until real legal review replaces the placeholder text.
 * Safe to re-run: skips any pageSlug that already has a doc.
 *
 * Run with: pnpm run seed:page-seo
 */

import { getPayload } from 'payload'
import configPromise from '@payload-config'

const docs: { pageSlug: string; title: string; description: string }[] = [
  {
    pageSlug: 'privacy',
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your information.',
  },
  {
    pageSlug: 'terms',
    title: 'Terms of Service',
    description: 'The terms governing use of our site and services.',
  },
]

async function run() {
  const payload = await getPayload({ config: configPromise })

  for (const doc of docs) {
    const existing = await payload.find({
      collection: 'page-seo',
      where: { pageSlug: { equals: doc.pageSlug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`✅ PageSEO for "${doc.pageSlug}" already exists — skipping.`)
      continue
    }

    await payload.create({
      collection: 'page-seo',
      data: {
        pageSlug: doc.pageSlug,
        noindex: true,
        meta: { title: doc.title, description: doc.description },
      },
    })
    console.log(`✅ PageSEO for "${doc.pageSlug}" created (noindex).`)
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('page-seo seed failed:', err)
    process.exit(1)
  })
