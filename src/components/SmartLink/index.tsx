'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLenis } from 'lenis/react'
import React, { useCallback } from 'react'

type SmartLinkProps = Omit<React.ComponentProps<typeof Link>, 'href'> & {
  href: string
  /** Runs right before we navigate/scroll — e.g. close the mobile menu. */
  onNavigate?: () => void
}

/**
 * Drop-in replacement for next/link that makes same-page `/#section` jumps work.
 *
 * A plain <Link> to `/#work` on the home page gets intercepted by the router,
 * which runs its own hash scroll — and Lenis (which owns the real scroll
 * position) snaps it back on the next frame, so the page never actually moves.
 * Here we take over for that one case: cancel the navigation, hand the scroll
 * to Lenis so it animates smoothly to the target, then sync the URL by hand.
 *
 * Cross-page hash links (`/#work` from `/about`) and plain links fall straight
 * through to normal <Link> behaviour.
 */
export function SmartLink({ href, onNavigate, onClick, ...props }: SmartLinkProps) {
  const pathname = usePathname()
  const lenis = useLenis()

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e)
      if (e.defaultPrevented) return

      // If clicking Home while already on the home page, scroll smoothly to the top.
      if (href === '/' && pathname === '/') {
        e.preventDefault()
        onNavigate?.()
        if (lenis) {
          lenis.scrollTo(0, {
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            force: true,
          })
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
        return
      }

      const hashIndex = href.indexOf('#')
      if (hashIndex === -1) {
        onNavigate?.()
        return
      }

      const targetPath = href.slice(0, hashIndex) || '/'
      if (targetPath !== pathname) {
        onNavigate?.()
        return // different page — let <Link> do the navigation
      }

      const target = document.querySelector(href.slice(hashIndex))
      if (!target) {
        onNavigate?.()
        return
      }

      e.preventDefault()
      onNavigate?.()

      const targetId = href.slice(hashIndex + 1)
      const headerEl = document.querySelector('header')
      const headerHeight = headerEl ? headerEl.offsetHeight : 76

      const currentScroll = lenis ? lenis.scroll : window.scrollY
      const targetRect = target.getBoundingClientRect()
      const targetTop = targetRect.top + currentScroll

      let destinationScroll: number

      if (targetId === 'process') {
        // For process (sticky pinned horizontal roadmap), land exactly where pinning engages
        destinationScroll = Math.max(0, targetTop)
      } else {
        // Frame the target section cleanly right beneath the fixed header
        // This eliminates clipping at the bottom and prevents previous section bleed at the top
        destinationScroll = Math.max(0, targetTop - headerHeight)
      }

      if (lenis) {
        lenis.scrollTo(destinationScroll, {
          duration: 1.15,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          force: true,
        })
      } else {
        window.scrollTo({
          top: destinationScroll,
          behavior: 'smooth',
        })
      }

      history.pushState(null, '', href)
    },
    [href, onNavigate, onClick, pathname, lenis],
  )

  return <Link href={href} onClick={handleClick} {...props} />
}
