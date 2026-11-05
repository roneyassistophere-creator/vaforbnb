'use client'

import React from 'react'
import { PhotoGallery } from '@/components/ui/gallery'

export function OurStories() {
  return (
    <PhotoGallery
      eyebrow="Inside Assist BNB Properties"
      title={
        <>
          Our <span className="text-primary">Stories</span>
        </>
      }
      buttonText="View All Stories"
      buttonHref="/contact"
    />
  )
}
