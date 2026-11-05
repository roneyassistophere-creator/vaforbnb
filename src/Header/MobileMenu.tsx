'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Facebook, Github, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react'
import { motion } from 'motion/react'
import { useLenis } from 'lenis/react'
import clsx from 'clsx'
import { SmartLink } from '@/components/SmartLink'
import siteConfig from '@/config/site'
import type { SocialLink } from '@/config/site'

// Matches nexus-studio's Navbar.jsx mobile-menu stagger exactly — same
// x-offset, delay-per-item, duration and cubic-bezier ease, hardcoded here
// (rather than the sitewide EASE_OUT) so this one animation stays pinned to
// nexus's literal curve regardless of what the shared easing token becomes.
const NEXUS_EASE = [0.25, 0.46, 0.45, 0.94] as const

const socialIcons: Record<SocialLink['icon'], React.ComponentType<{ size?: number }>> = {
  twitter: Twitter,
  linkedin: Linkedin,
  github: Github,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
}

// ─── Full-screen nav row — large label, optional inline group breakdown ───────

function FullScreenNavRow({
  item,
  index,
  isOpen,
  onClose,
  activeSection,
}: {
  item: (typeof siteConfig.nav)[number]
  index: number
  isOpen: boolean
  onClose: () => void
  activeSection?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const pathname = usePathname()
  const hasChildren = !!item.children?.length
  const hasCards = !!item.cards?.length

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

  const labelClasses = clsx(
    'font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight transition-colors',
    isActive ? 'text-primary' : 'text-foreground hover:text-primary',
  )

  return (
    <motion.div
      className="flex flex-col items-start"
      initial={{ opacity: 0, x: -60 }}
      animate={isOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -60 }}
      transition={{ duration: 0.5, delay: isOpen ? index * 0.07 : 0, ease: NEXUS_EASE }}
    >
      {item.isButton ? (
        <div className="mt-2 pt-2">
          <SmartLink
            href={item.href}
            onNavigate={onClose}
            data-cursor="hover"
            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 font-display text-base sm:text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-95"
          >
            {item.label}
          </SmartLink>
        </div>
      ) : !hasChildren && !hasCards ? (
        <SmartLink href={item.href} onNavigate={onClose} data-cursor="hover" className={labelClasses}>
          {item.label}
        </SmartLink>
      ) : (
        <>
          <button
            onClick={() => setExpanded((p) => !p)}
            aria-expanded={expanded}
            data-cursor="hover"
            className={clsx(labelClasses, 'flex items-center gap-3')}
          >
            {item.label}
            <ChevronDown
              className={clsx(
                'h-6 w-6 text-muted-foreground transition-transform duration-300',
                expanded ? 'rotate-180' : '',
              )}
            />
          </button>

          {expanded && hasCards && (
            <div className="mt-6 flex w-full flex-col gap-3">
              {item.cards!.map((card) => {
                const Icon = card.icon
                return (
                  <Link
                    key={card.href}
                    href={card.href}
                    onClick={onClose}
                    data-cursor="hover"
                    className="flex items-center gap-4 rounded-xl border border-border bg-card/60 p-4 transition-colors hover:border-primary/40 hover:bg-card"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-foreground/5 text-foreground/70">
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
                        {card.label}
                      </span>
                      <span className="block truncate text-sm text-muted-foreground">{card.description}</span>
                    </span>
                  </Link>
                )
              })}
            </div>
          )}

          {expanded && hasChildren && (
            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-14">
              {item.children!.map((child) => (
                <div key={child.href} className="text-center sm:text-left">
                  <Link
                    href={child.href}
                    onClick={onClose}
                    className="mb-2 inline-block font-mono text-[13px] font-semibold uppercase tracking-wider text-foreground transition-colors hover:text-primary"
                  >
                    {child.label}
                  </Link>
                  <ul className="space-y-1.5">
                    {child.children?.map((sub) => (
                      <li key={sub.href}>
                        <Link
                          href={sub.href}
                          onClick={onClose}
                          className="block text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}

// ─── Hamburger trigger + full-screen menu ──────────────────────────────────────

export const MobileMenu: React.FC<{ activeSection?: string }> = ({ activeSection = 'home' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const lenis = useLenis()

  useEffect(() => {
    setMounted(true)
    return () => {
      document.documentElement.classList.remove('mobile-menu-open')
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  const open = () => {
    setIsOpen(true)
    document.documentElement.classList.add('mobile-menu-open')
    document.body.style.overflow = 'hidden'
    lenis?.stop()
  }

  const close = () => {
    setIsOpen(false)
    document.documentElement.classList.remove('mobile-menu-open')
    document.body.style.overflow = ''
    lenis?.start()
  }

  return (
    <>
      {/* Animated hamburger. lg:hidden: desktop already has the full HeaderNav,
          this trigger (and the full-screen menu it opens) is mobile/tablet only. */}
      <button
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        onClick={isOpen ? close : open}
        className="flex h-8 w-8 flex-col items-center justify-center text-foreground focus:outline-none lg:hidden"
      >
        <span
          className={clsx(
            'block h-0.5 w-5 origin-center bg-current transition-all duration-300',
            isOpen ? 'translate-y-1.25 rotate-45' : 'mb-1',
          )}
        />
        <span
          className={clsx(
            'block h-0.5 w-5 bg-current transition-all duration-300',
            isOpen ? 'scale-x-0 opacity-0' : 'mb-1',
          )}
        />
        <span
          className={clsx(
            'block h-0.5 w-5 origin-center bg-current transition-all duration-300',
            isOpen ? '-translate-y-1.25 -rotate-45' : '',
          )}
        />
      </button>

      {/* Portal: full-screen menu. No logo/close row in here — nexus-studio's
          own mobile overlay sits BELOW its header (z-40 vs z-50), so the real
          header (with its hamburger already morphed to a close icon) stays
          visible and clickable on top; ours now mirrors that exactly via the
          drawer's z-20 vs the header's z-30, so a second close affordance
          would just be redundant. */}
      {mounted &&
        createPortal(
          <div className="mobile-menu-drawer flex flex-col justify-center px-6 py-16" data-lenis-prevent>
            <nav className="my-auto flex flex-col gap-4 sm:gap-6 pt-16 pb-20">
              {siteConfig.nav.map((item, index) => (
                <FullScreenNavRow
                  key={item.label}
                  item={item}
                  index={index}
                  isOpen={isOpen}
                  onClose={close}
                  activeSection={activeSection}
                />
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={isOpen ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: isOpen ? 0.5 : 0 }}
              className="absolute bottom-12 left-6 flex items-center gap-6 text-muted-foreground"
            >
              {siteConfig.social.map((s) => {
                const Icon = socialIcons[s.icon]
                return (
                  <a
                    key={s.platform}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.platform}
                    className="transition-colors hover:text-foreground"
                  >
                    <Icon size={18} />
                  </a>
                )
              })}
            </motion.div>

            <div className="absolute right-6 bottom-12 text-xs text-muted-foreground/70">
              &copy; {new Date().getFullYear()} {siteConfig.name}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
