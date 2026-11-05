'use client'

import React from 'react'
import { MarqueeLogoScroller, type Logo } from '@/components/ui/marquee-logo-scroller'

const clientLogos: Logo[] = [
  {
    src: '/assets/clients/Capital%20Retreats%20Logo.webp',
    alt: 'Capital Retreats',
    gradient: { from: '#ff5a66', via: '#ff385c', to: '#d70438' },
  },
  {
    src: '/assets/clients/Direct2Host%20Logo.webp',
    alt: 'Direct2Host',
    gradient: { from: '#ff385c', via: '#e11d48', to: '#9f1239' },
  },
  {
    src: '/assets/clients/Elevate%20Living%20Estates%20Logo.webp',
    alt: 'Elevate Living Estates',
    gradient: { from: '#fb7185', via: '#f43f5e', to: '#be123c' },
  },
  {
    src: '/assets/clients/Finesse%20Stays%20Logo.webp',
    alt: 'Finesse Stays',
    gradient: { from: '#ff5a66', via: '#ff385c', to: '#881337' },
  },
  {
    src: '/assets/clients/Hedgerow%20Properties%20Logo.webp',
    alt: 'Hedgerow Properties',
    gradient: { from: '#fda4af', via: '#ff385c', to: '#d70438' },
  },
  {
    src: '/assets/clients/Hofin%20Stays%20Logo.webp',
    alt: 'Hofin Stays',
    gradient: { from: '#ff385c', via: '#f43f5e', to: '#b91c1c' },
  },
  {
    src: '/assets/clients/Invicta%20Stays%20Logo.webp',
    alt: 'Invicta Stays',
    gradient: { from: '#ff5a66', via: '#e11d48', to: '#9f1239' },
  },
  {
    src: '/assets/clients/Live%20London%20Live%20Logo.webp',
    alt: 'Live London Live',
    gradient: { from: '#f43f5e', via: '#ff385c', to: '#d70438' },
  },
  {
    src: '/assets/clients/Oak%20Stays%20Logo.webp',
    alt: 'Oak Stays',
    gradient: { from: '#ff385c', via: '#be123c', to: '#4c0519' },
  },
  {
    src: '/assets/clients/One%20Castle%20Logo.webp',
    alt: 'One Castle',
    gradient: { from: '#fb7185', via: '#ff385c', to: '#be123c' },
  },
  {
    src: '/assets/clients/Remigro%20Short%20Lets%20Logo.webp',
    alt: 'Remigro Short Lets',
    gradient: { from: '#ff5a66', via: '#f43f5e', to: '#9f1239' },
  },
  {
    src: '/assets/clients/Seaside%20Logo.webp',
    alt: 'Seaside',
    gradient: { from: '#ff385c', via: '#e11d48', to: '#d70438' },
  },
  {
    src: '/assets/clients/Sleeepova%20Short%20lets%20Logo.webp',
    alt: 'Sleeepova Short Lets',
    gradient: { from: '#fda4af', via: '#fb7185', to: '#e11d48' },
  },
  {
    src: '/assets/clients/Vip%20Accommodation%20Logo.webp',
    alt: 'VIP Accommodation',
    gradient: { from: '#ff5a66', via: '#ff385c', to: '#881337' },
  },
  {
    src: '/assets/clients/Zen%20Nights%20Logo.webp',
    alt: 'Zen Nights',
    gradient: { from: '#ff385c', via: '#f43f5e', to: '#be123c' },
  },
  {
    src: '/assets/clients/1.webp',
    alt: 'Client Partner 1',
    gradient: { from: '#ff5a66', via: '#ff385c', to: '#d70438' },
  },
  {
    src: '/assets/clients/2.webp',
    alt: 'Client Partner 2',
    gradient: { from: '#fb7185', via: '#e11d48', to: '#9f1239' },
  },
  {
    src: '/assets/clients/3.webp',
    alt: 'Client Partner 3',
    gradient: { from: '#fda4af', via: '#f43f5e', to: '#be123c' },
  },
  {
    src: '/assets/clients/4.webp',
    alt: 'Client Partner 4',
    gradient: { from: '#ff5a66', via: '#ff385c', to: '#881337' },
  },
  {
    src: '/assets/clients/5.webp',
    alt: 'Client Partner 5',
    gradient: { from: '#ff385c', via: '#f43f5e', to: '#b91c1c' },
  },
  {
    src: '/assets/clients/6.webp',
    alt: 'Client Partner 6',
    gradient: { from: '#f43f5e', via: '#ff385c', to: '#d70438' },
  },
  {
    src: '/assets/clients/7.webp',
    alt: 'Client Partner 7',
    gradient: { from: '#ff385c', via: '#be123c', to: '#4c0519' },
  },
  {
    src: '/assets/clients/8.webp',
    alt: 'Client Partner 8',
    gradient: { from: '#fb7185', via: '#ff385c', to: '#be123c' },
  },
  {
    src: '/assets/clients/9.webp',
    alt: 'Client Partner 9',
    gradient: { from: '#ff5a66', via: '#f43f5e', to: '#9f1239' },
  },
  {
    src: '/assets/clients/10.webp',
    alt: 'Client Partner 10',
    gradient: { from: '#ff385c', via: '#e11d48', to: '#d70438' },
  },
  {
    src: '/assets/clients/11.webp',
    alt: 'Client Partner 11',
    gradient: { from: '#fda4af', via: '#fb7185', to: '#e11d48' },
  },
]

export function ClientsSection() {
  return (
    <MarqueeLogoScroller
      variant="coral"
      ariaLabel="Trusted by Leading Short-Term Rental Hosts"
      title={
        <>
          <span className="block font-bold text-white">
            Trusted by Leading
          </span>
          <span className="block mt-1 font-light text-white/80">
            Short-Term Rental Hosts
          </span>
        </>
      }
      description="Independent operators, aparthotel brands, and property investors across the UK rely on Assist BNB for seamless 24/7 guest communications and backend operations."
      logos={clientLogos}
      speed="normal"
    />
  )
}
