'use client'

import { cn } from '@/utilities/ui'
import { useMotionValueEvent, useScroll } from 'motion/react'
import { usePathname } from 'next/navigation'
import { useLenis } from 'lenis/react'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import { MobileMenu } from './MobileMenu'

// Scroll threshold, in px, before the header gains a solid frosted backdrop.
const SCROLL_THRESHOLD = 30

// Fixed header with glass backdrop and dynamic active section tracking.
export const HeaderClient: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('home')
  const pathname = usePathname()
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > SCROLL_THRESHOLD)
  })

  // Synchronized scroll spy tracking which homepage section is currently in view
  const updateActiveSection = useCallback(() => {
    if (pathname !== '/') {
      setActiveSection('')
      return
    }

    const currentScroll = window.scrollY
    if (currentScroll < 260) {
      setActiveSection('home')
      return
    }

    // Check sections from bottom to top so the current active section wins
    const sections = [
      { id: 'pricing', el: document.getElementById('pricing') },
      { id: 'services', el: document.getElementById('services') || document.getElementById('solutions') },
      { id: 'process', el: document.getElementById('process') },
      { id: 'conversions', el: document.getElementById('conversions') },
      { id: 'reviews', el: document.getElementById('reviews') },
    ]

    const viewportTrigger = window.innerHeight * 0.38 // Trigger line at 38% down viewport

    for (const sec of sections) {
      if (!sec.el) continue
      const rect = sec.el.getBoundingClientRect()
      // Active if section has crossed trigger line and is still visible above the bottom
      if (rect.top <= viewportTrigger && rect.bottom > 80) {
        setActiveSection(sec.id)
        return
      }
    }

    if (currentScroll < 600) {
      setActiveSection('home')
    }
  }, [pathname])

  // Real-time synchronization with Lenis smooth scrolling
  useLenis(updateActiveSection)

  useEffect(() => {
    updateActiveSection()
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection, { passive: true })
    return () => {
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [updateActiveSection])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-30 w-full text-foreground transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300',
        scrolled
          ? 'border-b border-border/80 bg-background/85 py-3.5 backdrop-blur-xl shadow-xs'
          : 'border-b border-transparent bg-background/30 py-4 backdrop-blur-md sm:bg-transparent sm:backdrop-blur-none sm:py-5',
      )}
    >
      <div className="mx-auto flex w-[86%] items-center justify-between lg:w-[84vw] xl:w-[73vw]">
        <Link href="/" data-cursor="hover" className="flex items-center gap-2">
          <Logo loading="eager" priority="high" />
          <span className="h-2 w-2 animate-pulse-slow rounded-full bg-brand-coral-bright" />
        </Link>

        <div className="flex items-center gap-4 lg:gap-6">
          <HeaderNav activeSection={activeSection} />
          <MobileMenu activeSection={activeSection} />
        </div>
      </div>
    </header>
  )
}
