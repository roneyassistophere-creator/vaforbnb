import { getPayload } from 'payload'
import { cache } from 'react'
import configPromise from '@payload-config'

export const getLatestPosts = cache(async (limit = 3) => {
  const payload = await getPayload({ config: configPromise })

  // overrideAccess: false (no draft: true) is enough on its own to exclude
  // drafts — matches the pattern already used by blog/page.tsx, which
  // doesn't filter on _status directly either.
  const result = await payload.find({
    collection: 'posts',
    sort: '-publishedAt',
    limit,
    overrideAccess: false,
    depth: 1,
  })

  return result.docs
})
