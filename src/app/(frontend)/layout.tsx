import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Parisienne, Playfair_Display } from 'next/font/google'
import localFont from 'next/font/local'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'
import { jsonLdScript, organizationSchema, websiteSchema } from '@/utilities/jsonld'
import siteConfig from '@/config/site'

import './globals.css'

// Bold display face for headlines
const clashDisplay = localFont({
  src: [
    { path: '../../fonts/ClashDisplay/ClashDisplay-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../fonts/ClashDisplay/ClashDisplay-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../fonts/ClashDisplay/ClashDisplay-Semibold.woff2', weight: '600', style: 'normal' },
    { path: '../../fonts/ClashDisplay/ClashDisplay-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-clash-display',
  display: 'swap',
})

// Formal script face — used for signature in Philosophy section
const parisienne = Parisienne({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-parisienne',
  display: 'swap',
  fallback: ['cursive'],
})

// Serif italic for Philosophy pull-quote
const playfair = Playfair_Display({
  weight: ['400', '500', '600'],
  style: ['italic'],
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html
      className={cn(
        GeistSans.variable,
        GeistMono.variable,
        clashDisplay.variable,
        parisienne.variable,
        playfair.variable,
      )}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript([organizationSchema(siteConfig), websiteSchema(siteConfig)]),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <AdminBar adminBarProps={{ preview: isEnabled }} />
          <div id="page-wrapper">
            <Header />
            {children}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.seo.defaultTitle,
    template: siteConfig.seo.titleTemplate,
  },
  description: siteConfig.seo.defaultDescription,
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: siteConfig.seo.twitterHandle || undefined,
  },
  verification: {
    google: siteConfig.seo.googleVerification || undefined,
    other: siteConfig.seo.bingVerification
      ? { 'msvalidate.01': siteConfig.seo.bingVerification }
      : undefined,
  },
}
