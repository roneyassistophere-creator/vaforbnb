/**
 * Ensures the "Contact" form-builder Form document exists — the contact page
 * posts submissions against it via /api/form-submissions. Safe to re-run:
 * does nothing if a form titled "Contact" already exists.
 *
 * Run with: pnpm exec tsx --tsconfig tsconfig.json src/seed/contact-form.ts
 */

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import siteConfig from '@/config/site'

const txt = (text: string) => ({ type: 'text', text, format: 0, version: 1 })
const p = (...children: object[]) => ({
  type: 'paragraph',
  children,
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
})
const richText = (text: string) => ({
  root: {
    type: 'root',
    children: [p(txt(text))],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

async function run() {
  const payload = await getPayload({ config: configPromise })

  const existing = await payload.find({
    collection: 'forms',
    where: { title: { equals: 'Contact' } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    console.log('✅ Contact form already exists — skipping.')
    return
  }

  await payload.create({
    collection: 'forms',
    data: {
      title: 'Contact',
      submitButtonLabel: 'Send Message',
      confirmationType: 'message',
      confirmationMessage: richText("Thanks — we'll get back to you within one business day."),
      fields: [
        { blockType: 'text', name: 'name', label: 'Name', required: true, width: 50 },
        { blockType: 'email', name: 'email', label: 'Email', required: true, width: 50 },
        { blockType: 'text', name: 'subject', label: 'Subject', required: false },
        { blockType: 'textarea', name: 'message', label: 'Message', required: true },
      ],
      emails: [
        {
          emailTo: siteConfig.contact.email,
          subject: 'New contact form submission — {{subject}}',
          message: richText('New message from {{name}} <{{email}}>:\n\n{{message}}'),
        },
      ],
    },
  })

  console.log('✅ Contact form created.')
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Contact form seed failed:', err)
    process.exit(1)
  })
