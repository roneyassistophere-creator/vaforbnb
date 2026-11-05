'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { SmartLink } from '@/components/SmartLink'
import { Magnetic } from '@/components/motion/Magnetic'
import siteConfig from '@/config/site'
import type { NavCard } from '@/config/site'

// The header is theme-aware, so these use semantic tokens.
const linkClasses = (active: boolean) =>
  clsx(
    'relative py-1 text-[14px] lg:text-[15px] font-medium tracking-normal transition-colors whitespace-nowrap',
    active ? 'text-foreground font-semibold' : 'text-foreground/75 hover:text-foreground',
  )

// Feature tile in the "About" dropdown's left block — a bare outline icon
// top-left (no badge behind it, matching the reference exactly), a soft glow
// tucked in the opposite corner standing in for the reference's photo/texture
// accent, and the title + description pinned to the bottom.
function FeatureCard({ card, active, onNavigate }: { card: NavCard; active: boolean; onNavigate?: () => void }) {
  const Icon = card.icon

  return (
    <Link
      href={card.href}
      onClick={onNavigate}
      data-cursor="hover"
      className={clsx(
        'group relative flex h-44 flex-col justify-between overflow-hidden rounded-2xl border p-4 transition-colors',
        active
          ? 'border-primary/40 bg-card'
          : 'border-border bg-card/50 hover:border-primary/40 hover:bg-card',
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-80"
      />
      <Icon
        size={22}
        strokeWidth={1.5}
        className={clsx(
          'relative shrink-0 transition-colors',
          active ? 'text-primary' : 'text-foreground/70 group-hover:text-primary',
        )}
      />
      <div className="relative">
        <p className="text-[15px] font-semibold text-popover-foreground">{card.label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
      </div>
    </Link>
  )
}

// Secondary-destination row in the dropdown's right column — title + description
// on the left, a bare outline icon on the right, same style as the reference's
// Gallery/Resume/Chat list.
function ListRow({ card, active, onNavigate }: { card: NavCard; active: boolean; onNavigate?: () => void }) {
  const Icon = card.icon

  return (
    <Link
      href={card.href}
      onClick={onNavigate}
      data-cursor="hover"
      className={clsx(
        'group flex flex-1 items-center justify-between gap-3 rounded-2xl border p-4 transition-colors',
        active
          ? 'border-primary/40 bg-card'
          : 'border-border bg-card/50 hover:border-primary/40 hover:bg-card',
      )}
    >
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold text-popover-foreground">{card.label}</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{card.description}</span>
      </span>
      <Icon
        size={20}
        strokeWidth={1.5}
        className={clsx(
          'shrink-0 transition-colors',
          active ? 'text-primary' : 'text-foreground/60 group-hover:text-primary',
        )}
      />
    </Link>
  )
}

const Underline = ({ active }: { active: boolean }) => (
  <span
    aria-hidden="true"
    className={clsx(
      'pointer-events-none absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover/link:scale-x-100',
      active && 'scale-x-100',
    )}
  />
)

export const HeaderNav: React.FC<{ activeSection?: string }> = ({ activeSection = 'home' }) => {
  const pathname = usePathname()
  const [openHref, setOpenHref] = useState<string | null>(null)
  const navRef = useRef<HTMLElement>(null)

  // Close on navigation
  useEffect(() => {
    setOpenHref(null)
  }, [pathname])

  // Close on click outside the nav
  useEffect(() => {
    if (!openHref) return
    const onPointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenHref(null)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [openHref])

  // Close on Escape
  useEffect(() => {
    if (!openHref) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenHref(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openHref])

  return (
    <nav ref={navRef} className="hidden items-center gap-4.5 xl:gap-6 2xl:gap-8 lg:flex">
      {siteConfig.nav.map((item) => {
        let isActive = false

        if (pathname === '/') {
          if (item.href === '/') {
            isActive = activeSection === 'home' || !activeSection
          } else if (item.href.startsWith('/#')) {
            const hash = item.href.slice(2)
            if (hash === 'services') {
              isActive = activeSection === 'services' || activeSection === 'solutions'
            } else {
              isActive = activeSection === hash
            }
          }
        } else {
          isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(item.href + '/')
        }

        const hasChildren = !!item.children?.length
        const hasCards = !!item.cards?.length

        if (item.isButton) {
          return (
            <Magnetic key={item.label} strength={0.25}>
              <SmartLink
                href={item.href}
                data-cursor="hover"
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(255,56,92,0.35)] active:scale-[0.98]"
              >
                {item.label}
              </SmartLink>
            </Magnetic>
          )
        }

        if (!hasChildren && !hasCards) {
          return (
            <SmartLink
              key={item.label}
              href={item.href}
              data-cursor="hover"
              className={clsx(linkClasses(isActive), 'group/link')}
            >
              {item.label}
              <Underline active={isActive} />
            </SmartLink>
          )
        }

        const isOpen = openHref === item.href

        if (hasCards) {
          const feature = item.cards!.filter((c) => c.size === 'lg')
          const list = item.cards!.filter((c) => c.size !== 'lg')

          // "About" — a bento card-grid dropdown styled after a reference the
          // client supplied: a plain rounded dark panel (no colored accent
          // border), bare outline icons (no badge behind them), a left block
          // of large feature cards, and a narrower right column of secondary
          // destinations as full-width rows — instead of the plain
          // text-column mega menu below.
          return (
            <div key={item.label}>
              <button
                onClick={() => setOpenHref(isOpen ? null : item.href)}
                aria-haspopup="true"
                aria-expanded={isOpen}
                data-cursor="hover"
                className={clsx(linkClasses(isActive), 'group/link flex items-center gap-1')}
              >
                {item.label}
                <ChevronDown
                  className={clsx('w-3 h-3 transition-transform duration-300', isOpen && 'rotate-180')}
                />
                <Underline active={isActive} />
              </button>

              {isOpen && (
                <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
                  <div className="w-[min(94vw,40rem)] rounded-2xl border border-border bg-popover/95 p-3 shadow-2xl shadow-black/30 backdrop-blur-md">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.6fr_1fr]">
                      {feature.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                          {feature.map((card) => (
                            <FeatureCard key={card.href} card={card} active={pathname === card.href} />
                          ))}
                        </div>
                      )}
                      {list.length > 0 && (
                        <div className="flex flex-col gap-3">
                          {list.map((card) => (
                            <ListRow key={card.href} card={card} active={pathname === card.href} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        }

        // Item with children — full-width mega menu split into one column per child
        return (
          <div key={item.label}>
            <button
              onClick={() => setOpenHref(isOpen ? null : item.href)}
              aria-haspopup="true"
              aria-expanded={isOpen}
              data-cursor="hover"
              className={clsx(linkClasses(isActive), 'group/link flex items-center gap-1')}
            >
              {item.label}
              <ChevronDown
                className={clsx('w-3 h-3 transition-transform duration-300', isOpen && 'rotate-180')}
              />
              <Underline active={isActive} />
            </button>

            {/* Mega panel — anchored to <header> (the nearest positioned ancestor),
                so it's centered on the screen and starts flush at the header's bottom edge.
                Keep <header> `sticky` (not `fixed`) — this absolute positioning depends on it. */}
            {isOpen && (
              <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
                <div className="w-[min(94vw,52rem)] border-t-2 border-t-primary border-x border-b border-border bg-popover/95 shadow-2xl shadow-black/30 backdrop-blur-md">
                  <div className="grid grid-cols-3 divide-x divide-border px-10 py-10">
                    {item.children!.map((child) => {
                      const childActive =
                        pathname === child.href || pathname.startsWith(child.href + '/')

                      return (
                        <div key={child.href} className="px-8 first:pl-0 last:pr-0">
                          <Link
                            href={child.href}
                            data-cursor="hover"
                            className={clsx(
                              'mb-4 inline-block font-mono text-[13px] font-semibold uppercase tracking-wider transition-colors hover:text-primary',
                              childActive ? 'text-primary' : 'text-popover-foreground',
                            )}
                          >
                            {child.label}
                          </Link>
                          <ul className="space-y-2.5">
                            {child.children?.map((sub) => (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  data-cursor="hover"
                                  className={clsx(
                                    'block text-sm transition-colors hover:text-primary',
                                    pathname === sub.href ? 'font-medium text-primary' : 'text-muted-foreground',
                                  )}
                                >
                                  {sub.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-end border-t border-border px-10 py-4">
                    <Link
                      href={item.href}
                      data-cursor="hover"
                      className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
                    >
                      View all {item.label.toLowerCase()} →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
