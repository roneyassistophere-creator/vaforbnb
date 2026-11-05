'use client'

import React from 'react'
import { cn } from '@/lib/utils'

// Define the type for individual logo props
export interface Logo {
  src: string
  alt: string
  gradient: {
    from: string
    via: string
    to: string
  }
}

// Define the props for the main component
export interface MarqueeLogoScrollerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode
  description: React.ReactNode
  logos: Logo[]
  speed?: 'normal' | 'slow' | 'fast'
  variant?: 'default' | 'coral'
  ariaLabel?: string
}

/**
 * A responsive, self-contained, and infinitely scrolling marquee component.
 * Supports a full-width 'coral' variant matching the brand's bold ribbon styling.
 */
const MarqueeLogoScroller = React.forwardRef<HTMLDivElement, MarqueeLogoScrollerProps>(
  (
    {
      title,
      description,
      logos,
      speed = 'normal',
      variant = 'default',
      ariaLabel,
      className,
      ...props
    },
    ref,
  ) => {
    // Map speed prop to animation duration
    const durationMap = {
      normal: '40s',
      slow: '80s',
      fast: '5s',
    }
    const animationDuration = durationMap[speed]
    const isCoral = variant === 'coral'

    return (
      <>
        {/* The @keyframes for the marquee animation are defined directly here for robustness. */}
        <style>{`
          @keyframes marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}</style>

        <section
          ref={ref}
          aria-label={ariaLabel || (typeof title === 'string' ? title : undefined)}
          className={cn(
            'relative w-full overflow-hidden',
            isCoral
              ? 'bg-brand-coral-deep text-white py-20 sm:py-24 md:py-28'
              : 'bg-transparent text-foreground py-14 sm:py-18',
            className,
          )}
          {...props}
        >
          {/* Header Section */}
          <div className="mx-auto w-[86%] md:w-[73vw]">
            <div
              className={cn(
                'grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 lg:gap-8 pb-8 md:pb-12 border-b',
                isCoral ? 'border-white/20' : 'border-border',
              )}
            >
              <h2
                className={cn(
                  'text-3xl sm:text-4xl md:text-5xl tracking-tight font-display text-balance leading-tight',
                  isCoral ? 'text-white' : 'text-foreground',
                )}
              >
                {title}
              </h2>
              <p
                className={cn(
                  'self-start lg:justify-self-end text-balance text-base sm:text-lg leading-relaxed',
                  isCoral ? 'text-white/80' : 'text-muted-foreground',
                )}
              >
                {description}
              </p>
            </div>
          </div>

          {/* Marquee Section */}
          <div className="relative w-full overflow-hidden pt-8 md:pt-10">
            {isCoral ? (
              <>
                {/* Fade edges using coral deep gradient */}
                <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-24 sm:w-40 bg-linear-to-r from-brand-coral-deep to-transparent" />
                <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-24 sm:w-40 bg-linear-to-l from-brand-coral-deep to-transparent" />
              </>
            ) : (
              <div
                className="pointer-events-none absolute inset-0 z-10"
                style={{
                  maskImage:
                    'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                }}
              />
            )}

            <div
              className="flex w-max items-center gap-5 py-2 pr-5 hover:[animation-play-state:paused] transition-all duration-300 ease-in-out"
              style={{
                animation: `marquee ${animationDuration} linear infinite`,
              }}
            >
              {/* Render logos twice to create a seamless loop */}
              {[...logos, ...logos].map((logo, index) => (
                <div
                  key={index}
                  className={cn(
                    'group relative size-28 shrink-0 sm:size-32 md:size-36 aspect-square flex items-center justify-center rounded-2xl p-2 overflow-hidden shadow-md transition-all duration-300 hover:scale-105',
                    isCoral
                      ? 'bg-white/10 backdrop-blur-xs border border-white/25 hover:border-white/70 hover:bg-white/20 hover:shadow-xl'
                      : 'bg-card border border-border/80 hover:border-primary/50 hover:shadow-lg',
                  )}
                >
                  {/* Gradient background revealed on hover */}
                  <div
                    style={
                      {
                        '--from': logo.gradient.from,
                        '--via': logo.gradient.via,
                        '--to': logo.gradient.to,
                      } as React.CSSProperties
                    }
                    className="absolute inset-0 scale-150 opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-100 bg-linear-to-br from-[var(--from)] via-[var(--via)] to-[var(--to)]"
                  />
                  {/* Logo Image container */}
                  <div className="relative z-10 flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-white p-2 shadow-sm transition-transform duration-300 group-hover:scale-[1.02]">
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      className="h-full w-full object-contain rounded-lg"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </>
    )
  },
)

MarqueeLogoScroller.displayName = 'MarqueeLogoScroller'

export { MarqueeLogoScroller }
