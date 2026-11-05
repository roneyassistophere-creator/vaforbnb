import { Briefcase, BookOpen, FileText, ShieldCheck, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type NavGrandchild = {
  label: string
  href: string
}

export type NavChild = {
  label: string
  href: string
  children?: NavGrandchild[]
}

// A single tile in a card-grid dropdown (see NavLink.cards) — an icon badge,
// a title, and a one-line description, rendered as a bento-style card rather
// than a plain text link.
export type NavCard = {
  label: string
  description: string
  href: string
  icon: LucideIcon
  /** 'lg' = top-row feature tile, 'sm' = compact tile below it. @default 'sm' */
  size?: 'lg' | 'sm'
}

export type NavLink = {
  label: string
  href: string
  external?: boolean
  icon?: LucideIcon
  children?: NavChild[]
  /** Card-grid dropdown content (mutually exclusive with `children`). */
  cards?: NavCard[]
  /** Render as a prominent CTA button instead of a standard nav link */
  isButton?: boolean
}

export type FooterLinkGroup = {
  heading: string
  links: { label: string; href: string }[]
}

export type SocialLink = {
  platform: string
  href: string
  icon: 'twitter' | 'linkedin' | 'github' | 'instagram' | 'facebook' | 'youtube'
}

export type SiteConfig = {
  name: string
  tagline: string
  description: string
  url: string
  logo: {
    text: string
    imagePath?: string
  }
  seo: {
    titleTemplate: string
    defaultTitle: string
    defaultDescription: string
    defaultOgImage: string
    twitterHandle: string
    googleVerification: string
    bingVerification: string
  }
  nav: NavLink[]
  footerLinks: FooterLinkGroup[]
  contact: {
    email: string
    phone?: string
    address?: string
  }
  social: SocialLink[]
  org: {
    legalName: string
    foundingYear: number
    areaServed: string
  }
}

const siteConfig: SiteConfig = {
  // ─── Identity ──────────────────────────────────────────────────────────────
  name: 'Assist BNB',
  tagline: 'Your team for short-term rental growth.',
  description:
    'Assist BNB is a UK-based Airbnb and short-term rental operations partner — guest communication, cleaning coordination, listing optimisation, and backend systems that scale your STR business.',
  url: process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000',

  // ─── Logo ──────────────────────────────────────────────────────────────────
  logo: {
    text: 'Assist BNB',
    // imagePath: '/logo.svg',
  },

  // ─── SEO defaults ──────────────────────────────────────────────────────────
  seo: {
    titleTemplate: '%s | Assist BNB',
    defaultTitle: 'Assist BNB — Airbnb & Short-Term Rental Operations',
    defaultDescription:
      'Assist BNB handles guest communication, cleaning coordination, listing optimisation, and backend systems for UK Airbnb and short-term rental hosts.',
    defaultOgImage: '/website-template-OG.webp',
    twitterHandle: '@assistbnb',
    googleVerification: process.env.GOOGLE_SITE_VERIFICATION ?? '',
    bingVerification: process.env.BING_SITE_VERIFICATION ?? '',
  },

  // ─── Navigation ────────────────────────────────────────────────────────────
  // Smooth scroll anchors for homepage sections with About fanning out as a
  // bento card dropdown.
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Reviews', href: '/#reviews' },
    { label: 'Conversions', href: '/#conversions' },
    { label: 'Process', href: '/#process' },
    { label: 'Solutions', href: '/#services' },
    { label: 'Pricing', href: '/#pricing' },
    {
      label: 'About',
      href: '/about',
      cards: [
        {
          label: 'About Us',
          description: 'Who we are and our hosting philosophy.',
          href: '/about',
          icon: Users,
          size: 'lg',
        },
        {
          label: 'Careers',
          description: "Open roles in short-term rental operations.",
          href: '/careers',
          icon: Briefcase,
          size: 'lg',
        },
        {
          label: 'Blog',
          description: 'STR insights, tips, and operational playbooks.',
          href: '/blog',
          icon: BookOpen,
        },
        {
          label: 'Privacy Policy',
          description: 'How we protect your data.',
          href: '/privacy',
          icon: ShieldCheck,
        },
        {
          label: 'Terms of Service',
          description: 'Standard client and host terms.',
          href: '/terms',
          icon: FileText,
        },
      ],
    },
    { label: 'Book Now', href: '/contact', isButton: true },
  ],

  // ─── Footer links ──────────────────────────────────────────────────────────
  footerLinks: [
    {
      heading: 'Company',
      links: [
        { label: 'Home', href: '/' },
        { label: 'About Us', href: '/about' },
        { label: 'Solutions', href: '/#services' },
        { label: 'Pricing', href: '/#pricing' },
        { label: 'Careers', href: '/careers' },
        { label: 'Book Now', href: '/contact' },
      ],
    },
    {
      heading: 'Content',
      links: [{ label: 'Blog', href: '/#blog' }],
    },
    {
      heading: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
      ],
    },
  ],

  // ─── Contact ───────────────────────────────────────────────────────────────
  contact: {
    email: 'hello@assistbnb.com',
    phone: '+44 20 0000 0000',
    address: '86-90 Paul Street, London, EC2A 4NE, United Kingdom',
  },

  // ─── Social ────────────────────────────────────────────────────────────────
  social: [
    { platform: 'Twitter / X', href: 'https://twitter.com/assistbnb', icon: 'twitter' },
    { platform: 'LinkedIn', href: 'https://linkedin.com/company/assistbnb', icon: 'linkedin' },
    { platform: 'Instagram', href: 'https://instagram.com/assistbnb', icon: 'instagram' },
  ],

  // ─── Organization (used for JSON-LD structured data) ───────────────────────
  org: {
    legalName: 'Assist BNB Ltd',
    foundingYear: 2021,
    areaServed: 'United Kingdom',
  },
}

export default siteConfig
