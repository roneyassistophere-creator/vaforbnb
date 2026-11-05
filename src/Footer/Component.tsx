import Link from 'next/link'
import React from 'react'

import { Logo } from '@/components/Logo/Logo'
import { SmartLink } from '@/components/SmartLink'
import siteConfig from '@/config/site'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border bg-background text-foreground">
      <div className="mx-auto w-[86%] py-12 md:w-[73vw]">
        {/* Top row: logo + link groups */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1 group">
            <Link href="/" aria-label={siteConfig.name} data-cursor="hover" className="inline-flex items-center gap-2">
              <Logo />
              <span className="max-w-0 overflow-hidden whitespace-nowrap font-mono text-xs uppercase tracking-wider text-primary opacity-0 transition-all duration-300 group-hover:max-w-[10rem] group-hover:opacity-100">
                STR Operations
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">{siteConfig.tagline}</p>
          </div>

          {siteConfig.footerLinks.map((group) => (
            <div key={group.heading}>
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {group.heading}
              </p>
              <ul className="flex flex-col gap-2">
                {group.links.map(({ label, href }) => (
                  <li key={href}>
                    <SmartLink
                      href={href}
                      data-cursor="hover"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {label}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row: copyright */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground/70">
            &copy;{' '}
            <span
              title="Our founding year — and still growing."
              className="cursor-help hover:text-primary"
            >
              {siteConfig.org.foundingYear}
            </span>
            –{currentYear} {siteConfig.org.legalName || siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
