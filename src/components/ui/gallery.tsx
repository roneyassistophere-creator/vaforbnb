'use client'

import { type Ref, forwardRef, useEffect, useRef, useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import Link from 'next/link'
import { motion, useInView, useMotionValue } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type Direction = 'left' | 'right'

export interface GalleryPhoto {
  id: number | string
  src: string
  alt?: string
  direction?: Direction
}

export interface PhotoGalleryProps {
  animationDelay?: number
  eyebrow?: string
  title?: React.ReactNode
  buttonText?: string
  buttonHref?: string
  photos?: GalleryPhoto[]
  className?: string
}

// Mashed-up photo sequence (breaking serial 1-10 order for a vibrant, organic collage)
const MASHED_PHOTOS: GalleryPhoto[] = [
  {
    id: 7,
    direction: 'left',
    src: '/assets/our-stories/story-07.webp',
    alt: 'Assist BNB luxury property story 07',
  },
  {
    id: 2,
    direction: 'right',
    src: '/assets/our-stories/story-02.webp',
    alt: 'Assist BNB boutique suite story 02',
  },
  {
    id: 9,
    direction: 'left',
    src: '/assets/our-stories/story-09.webp',
    alt: 'Assist BNB host hospitality story 09',
  },
  {
    id: 4,
    direction: 'right',
    src: '/assets/our-stories/story-04.webp',
    alt: 'Assist BNB skyline view story 04',
  },
  {
    id: 1,
    direction: 'left',
    src: '/assets/our-stories/story-01.webp',
    alt: 'Assist BNB premium stay story 01',
  },
  {
    id: 8,
    direction: 'right',
    src: '/assets/our-stories/story-08.webp',
    alt: 'Assist BNB outdoor retreat story 08',
  },
  {
    id: 3,
    direction: 'left',
    src: '/assets/our-stories/story-03.webp',
    alt: 'Assist BNB modern kitchen story 03',
  },
  {
    id: 10,
    direction: 'right',
    src: '/assets/our-stories/story-10.webp',
    alt: 'Assist BNB evening villa story 10',
  },
  {
    id: 5,
    direction: 'left',
    src: '/assets/our-stories/story-05.webp',
    alt: 'Assist BNB curated lounge story 05',
  },
  {
    id: 6,
    direction: 'right',
    src: '/assets/our-stories/story-06.webp',
    alt: 'Assist BNB contemporary residence story 06',
  },
]

// Vertical stagger and organic tilt configuration
const STAGGER_CONFIG = [
  { y: -50, rotate: -5.5, zIndex: 14, order: 4 },
  { y: 46,  rotate: 4.5,  zIndex: 22, order: 3 },
  { y: -55, rotate: -3.5, zIndex: 30, order: 2 },
  { y: 50,  rotate: 4.0,  zIndex: 38, order: 1 },
  { y: -48, rotate: -2.0, zIndex: 48, order: 0 },
  { y: 52,  rotate: 3.0,  zIndex: 52, order: 0 },
  { y: -52, rotate: -3.5, zIndex: 44, order: 1 },
  { y: 46,  rotate: 4.0,  zIndex: 36, order: 2 },
  { y: -48, rotate: -4.5, zIndex: 28, order: 3 },
  { y: 52,  rotate: 5.5,  zIndex: 18, order: 4 },
]

export const PhotoGallery = ({
  animationDelay = 0.2,
  eyebrow = 'A Journey Through Visual Stories',
  title = (
    <>
      Our <span className="text-primary">Stories</span>
    </>
  ),
  buttonText = 'View All Stories',
  buttonHref = '/contact',
  photos = MASHED_PHOTOS,
  className,
}: PhotoGalleryProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [trackWidth, setTrackWidth] = useState<number>(1050)
  const isInView = useInView(containerRef, { once: true, amount: 0.15 })
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Track the exact width of the header container (w-[86%] md:w-[73vw])
  useEffect(() => {
    if (!trackRef.current) return
    const updateWidth = () => {
      if (trackRef.current) {
        setTrackWidth(trackRef.current.offsetWidth)
      }
    }
    updateWidth()
    const ro = new ResizeObserver(updateWidth)
    ro.observe(trackRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!isInView) return

    const visibilityTimer = setTimeout(() => {
      setIsVisible(true)
    }, animationDelay * 1000)

    const animationTimer = setTimeout(
      () => {
        setIsLoaded(true)
      },
      (animationDelay + 0.3) * 1000,
    )

    return () => {
      clearTimeout(visibilityTimer)
      clearTimeout(animationTimer)
    }
  }, [isInView, animationDelay])

  // Larger card sizes across devices
  const cardSize =
    trackWidth >= 1100 ? 240 : trackWidth >= 800 ? 215 : trackWidth >= 500 ? 180 : 140

  // Calculate dynamic X offset so Card 0 touches left header edge and Card 9 touches right header edge
  const availableSpan = Math.max(0, trackWidth - cardSize)
  const yMultiplier = trackWidth < 600 ? 0.6 : 1

  const photoVariants = {
    hidden: () => ({
      x: 0,
      y: 0,
      rotate: 0,
      scale: 0.95,
      opacity: 0.8,
    }),
    visible: (custom: { x: number; y: number; rotate: number; order: number }) => ({
      x: custom.x,
      y: custom.y,
      rotate: custom.rotate,
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 65,
        damping: 13,
        mass: 1,
        delay: custom.order * 0.08,
      },
    }),
  }

  // Combine mashed photos with dynamically calculated positions spanning edge-to-edge
  const items = photos.slice(0, 10).map((photo, i) => {
    const config = STAGGER_CONFIG[i] ?? { y: 0, rotate: 0, zIndex: 10, order: i }
    // Exact offset from center so index 0 left touches 0, index 9 right touches trackWidth
    const xOffset = ((i / 9) - 0.5) * availableSpan

    return {
      ...photo,
      order: config.order,
      x: xOffset,
      y: config.y * yMultiplier,
      rotate: config.rotate,
      zIndex: config.zIndex,
    }
  })

  return (
    <section
      ref={containerRef}
      className={cn('relative overflow-hidden bg-background py-20 sm:py-24 md:py-28', className)}
    >
      {/* Ambient background grid pattern matching Assist BNB design */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-size-[60px_60px] opacity-30 [background-image:linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_50%,#000_60%,transparent_100%)]"
      />

      {/* Header text remains untouched at standard balanced scale */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-sm">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          {title}
        </h2>
      </div>

      {/* Interactive Single-Row Photo Spread Aligned Exactly to Header Ends (w-[86%] md:w-[73vw]) */}
      <div
        ref={trackRef}
        className="relative z-10 mx-auto mt-12 w-[86%] md:w-[73vw] overflow-visible px-0 sm:mt-16"
      >
        <motion.div
          className="relative mx-auto flex w-full flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Card stage sized dynamically to match larger cards */}
          <div
            style={{ height: cardSize + 120 }}
            className="relative flex w-full items-center justify-center"
          >
            {/* Center origin wrapper */}
            <div
              style={{ width: cardSize, height: cardSize }}
              className="relative"
            >
              {[...items].reverse().map((photo) => (
                <motion.div
                  key={photo.id}
                  className="absolute top-0 left-0"
                  style={{ zIndex: photo.zIndex }}
                  variants={photoVariants}
                  initial="hidden"
                  animate={isLoaded ? 'visible' : 'hidden'}
                  custom={{
                    x: photo.x,
                    y: photo.y,
                    rotate: photo.rotate,
                    order: photo.order,
                  }}
                >
                  <Photo
                    width={cardSize}
                    height={cardSize}
                    src={photo.src}
                    alt={photo.alt ?? 'Assist BNB guest story'}
                    direction={photo.direction}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Call to action button */}
      <div className="relative z-10 mt-10 sm:mt-14 flex w-full justify-center">
        <Link href={buttonHref}>
          <Button
            size="lg"
            className="rounded-full bg-primary px-8 py-3.5 font-display text-sm sm:text-base font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-[0_0_25px_rgba(255,56,92,0.35)]"
          >
            {buttonText}
          </Button>
        </Link>
      </div>
    </section>
  )
}

function getRandomNumberInRange(min: number, max: number): number {
  if (min >= max) {
    throw new Error('Min value should be less than max value')
  }
  return Math.random() * (max - min) + min
}

const MotionImage = motion(
  forwardRef<HTMLImageElement, ImageProps>(function MotionImage(props, ref) {
    return <Image ref={ref} unoptimized {...props} />
  }),
)

export const Photo = ({
  src,
  alt,
  className,
  direction = 'left',
  width,
  height,
  ...props
}: {
  src: string
  alt: string
  className?: string
  direction?: Direction
  width: number
  height: number
}) => {
  const [rotation, setRotation] = useState<number>(0)
  const x = useMotionValue(200)
  const y = useMotionValue(200)

  useEffect(() => {
    const randomRotation = getRandomNumberInRange(1, 4) * (direction === 'left' ? -1 : 1)
    setRotation(randomRotation)
  }, [direction])

  function handleMouse(event: {
    currentTarget: { getBoundingClientRect: () => DOMRect }
    clientX: number
    clientY: number
  }) {
    const rect = event.currentTarget.getBoundingClientRect()
    x.set(event.clientX - rect.left)
    y.set(event.clientY - rect.top)
  }

  const resetMouse = () => {
    x.set(200)
    y.set(200)
  }

  return (
    <motion.div
      drag
      dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
      whileTap={{ scale: 1.12, zIndex: 9999 }}
      whileHover={{
        scale: 1.08,
        rotateZ: 2 * (direction === 'left' ? -1 : 1),
        zIndex: 9999,
      }}
      whileDrag={{
        scale: 1.1,
        zIndex: 9999,
      }}
      initial={{ rotate: 0 }}
      animate={{ rotate: rotation }}
      style={{
        width,
        height,
        perspective: 400,
        transform: 'rotate(0deg) rotateX(0deg) rotateY(0deg)',
        zIndex: 1,
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        touchAction: 'none',
      }}
      className={cn(className, 'relative mx-auto shrink-0 cursor-grab active:cursor-grabbing')}
      onMouseMove={handleMouse}
      onMouseLeave={resetMouse}
      draggable={false}
      tabIndex={0}
    >
      <div className="relative h-full w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-slate-950 shadow-md">
        <MotionImage
          className="rounded-2xl sm:rounded-3xl object-cover"
          fill
          sizes="(max-width: 768px) 220px, 220px"
          src={src}
          alt={alt}
          draggable={false}
          {...props}
        />
      </div>
    </motion.div>
  )
}
