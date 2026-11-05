import { getPayload } from 'payload'
import { cache } from 'react'
import configPromise from '@payload-config'

// Safeguard against unhandled rejections during background config resolution
if (configPromise && typeof (configPromise as any).catch === 'function') {
  ;(configPromise as any).catch(() => {})
}

export const getPageSEO = cache(async (slug: string) => {
  try {
    const payload = await getPayload({ config: configPromise }).catch(() => null)
    if (!payload) return null

    const result = await payload
      .find({
        collection: 'page-seo',
        where: { pageSlug: { equals: slug } },
        limit: 1,
        overrideAccess: false,
        depth: 1,
      })
      .catch(() => null)

    return result?.docs?.[0] ?? null
  } catch {
    // Graceful fallback to default siteConfig SEO when database is unavailable or connecting fails
    return null
  }
})

