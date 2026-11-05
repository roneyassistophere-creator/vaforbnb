import { getPayload } from 'payload'
import { cache } from 'react'
import configPromise from '@payload-config'

export const getContactForm = cache(async () => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'forms',
    where: { title: { equals: 'Contact' } },
    limit: 1,
    overrideAccess: false,
  })

  return result.docs?.[0] ?? null
})
