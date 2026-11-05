'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { X, Sparkles } from 'lucide-react'
import { useLenis } from 'lenis/react'
import { MultiStepExpertForm } from './index'

type ExpertModalProps = {
  isOpen: boolean
  onClose: () => void
  formId?: number
}

export function ExpertModal({ isOpen, onClose, formId }: ExpertModalProps) {
  const [mounted, setMounted] = useState(false)
  const lenis = useLenis()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      lenis?.stop()
    } else {
      document.body.style.overflow = ''
      lenis?.start()
    }
    return () => {
      document.body.style.overflow = ''
      lenis?.start()
    }
  }, [isOpen, lenis])

  // Escape to close
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          data-lenis-prevent
        >
          {/* Frosted Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border/80 bg-background/95 p-6 sm:p-8 shadow-2xl shadow-black/40 backdrop-blur-2xl"
          >
            {/* Ambient Coral Glow in top-right */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/15 blur-3xl"
            />

            {/* Close Button */}
            <button
              onClick={onClose}
              data-cursor="hover"
              aria-label="Close dialog"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-muted/60 text-muted-foreground transition hover:border-primary/40 hover:bg-card hover:text-foreground focus:outline-hidden"
            >
              <X size={16} />
            </button>

            {/* Header Badge */}
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles size={12} />
              <span>Talk to an Expert</span>
            </div>

            {/* Multi-step Form */}
            <MultiStepExpertForm
              formId={formId}
              onCancel={onClose}
              className="mt-4"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
