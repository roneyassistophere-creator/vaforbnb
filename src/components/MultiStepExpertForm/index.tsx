'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Send,
  HelpCircle,
  Clock,
} from 'lucide-react'
import clsx from 'clsx'
import { Magnetic } from '@/components/motion/Magnetic'

export type ExpertFormData = {
  // Step 1: Contact
  name: string
  email: string
  phone: string

  // Step 2: Company Info
  companyName: string
  propertyCount: string
  location: string

  // Step 3: Inquiry Topic
  topic: string
  notes: string
}

const PROPERTY_COUNT_OPTIONS = [
  '1 - 2 Units',
  '3 - 5 Units',
  '6 - 15 Units',
  '16+ Units',
]

const INQUIRY_TOPICS = [
  { id: 'full-operations', label: 'Full Operations Management', icon: '🛎️' },
  { id: 'guest-comm', label: '24/7 Guest Communications', icon: '💬' },
  { id: 'direct-booking', label: 'Direct Booking Engine', icon: '🌐' },
  { id: 'cleaning-sync', label: 'Cleaning & Turnover Coordination', icon: '🧹' },
  { id: 'listing-seo', label: 'Listing SEO & Dynamic Pricing', icon: '📈' },
  { id: 'consultation', label: 'General STR Consultation', icon: '🤝' },
]

const STEPS = [
  { id: 1, title: 'Contact', description: 'Your details' },
  { id: 2, title: 'Company Info', description: 'Portfolio size' },
  { id: 3, title: 'Inquiry Topic', description: 'How we can help' },
]

type MultiStepExpertFormProps = {
  formId?: number
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

export function MultiStepExpertForm({
  formId,
  onSuccess,
  onCancel,
  className,
}: MultiStepExpertFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState<ExpertFormData>({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    propertyCount: '3 - 5 Units',
    location: '',
    topic: 'Full Operations Management',
    notes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Please enter your full name.'
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Please enter your email address.'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address.'
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Please enter your phone or WhatsApp number.'
      }
    } else if (step === 2) {
      if (!formData.location.trim()) {
        newErrors.location = 'Please enter your property city or region.'
      }
      if (!formData.propertyCount) {
        newErrors.propertyCount = 'Please select your portfolio size.'
      }
    } else if (step === 3) {
      if (!formData.topic) {
        newErrors.topic = 'Please select an inquiry topic.'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setDirection(1)
      setCurrentStep((prev) => Math.min(prev + 1, 3))
    }
  }

  const handlePrev = () => {
    setDirection(-1)
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(3)) return

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      if (formId) {
        await fetch('/api/form-submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            form: formId,
            submissionData: Object.entries(formData).map(([field, value]) => ({
              field,
              value: String(value),
            })),
          }),
        }).catch(() => null)
      }

      setSubmitted(true)
      onSuccess?.()
    } catch {
      setErrorMessage('Something went wrong. Please try again or contact us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Slide animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -30 : 30,
      opacity: 0,
    }),
  }

  if (submitted) {
    return (
      <div className={clsx('flex flex-col items-center text-center py-8 px-4', className)}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <CheckCircle2 size={46} className="stroke-[2.2]" />
        </motion.div>

        <h3 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          We&apos;ve Received Your Inquiry!
        </h3>
        <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
          Thank you, <span className="font-semibold text-foreground">{formData.name}</span>. An Assist BNB short-term rental operations expert will contact you within <span className="font-semibold text-primary">15 minutes</span>.
        </p>

        <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-3 text-xs text-muted-foreground">
          <Clock size={16} className="text-primary" />
          <span>Priority response queued for <strong>{formData.phone}</strong> & <strong>{formData.email}</strong></span>
        </div>

        {onCancel && (
          <div className="mt-8">
            <button
              onClick={onCancel}
              className="rounded-full bg-primary px-8 py-3 font-display text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Done
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={clsx('w-full', className)}>
      {/* Stepper Progress Bar */}
      <div className="mb-8">
        <div className="relative flex items-center justify-between">
          {/* Background track line */}
          <div className="absolute left-0 top-1/2 -z-0 h-0.5 w-full -translate-y-1/2 bg-border" />
          {/* Active progress line */}
          <div
            className="absolute left-0 top-1/2 -z-0 h-0.5 -translate-y-1/2 bg-primary transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />

          {STEPS.map((step) => {
            const isDone = currentStep > step.id
            const isCurrent = currentStep === step.id

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (step.id < currentStep) {
                      setDirection(-1)
                      setCurrentStep(step.id)
                    }
                  }}
                  disabled={step.id > currentStep}
                  className={clsx(
                    'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300',
                    isDone
                      ? 'bg-primary text-primary-foreground'
                      : isCurrent
                        ? 'border-2 border-primary bg-background text-primary shadow-[0_0_15px_rgba(255,56,92,0.3)]'
                        : 'border border-border bg-card text-muted-foreground',
                  )}
                >
                  {isDone ? <Check size={16} className="stroke-[2.5]" /> : step.id}
                </button>
                <span
                  className={clsx(
                    'mt-2 text-xs font-medium tracking-tight whitespace-nowrap',
                    isCurrent
                      ? 'text-foreground font-semibold'
                      : isDone
                        ? 'text-primary'
                        : 'text-muted-foreground',
                  )}
                >
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content Form */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="relative min-h-[300px]">
          <AnimatePresence mode="wait" custom={direction}>
            {/* ─── STEP 1: CONTACT ────────────────────────────────────────── */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4"
              >
                <div className="mb-4">
                  <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                    Who should our expert reach out to?
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Provide your contact info so we can assign the right UK operations lead.
                  </p>
                </div>

                {/* Full Name */}
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/80">
                    <User size={14} className="text-primary" /> Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value })
                      if (errors.name) setErrors({ ...errors, name: '' })
                    }}
                    placeholder="e.g. Oliver Vance"
                    className={clsx(
                      'w-full rounded-xl border bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:outline-hidden focus:ring-2',
                      errors.name
                        ? 'border-destructive focus:ring-destructive/30'
                        : 'border-border hover:border-primary/40 focus:border-primary focus:ring-primary/20',
                    )}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-destructive">{errors.name}</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/80">
                    <Mail size={14} className="text-primary" /> Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value })
                      if (errors.email) setErrors({ ...errors, email: '' })
                    }}
                    placeholder="e.g. oliver@cotswoldstays.co.uk"
                    className={clsx(
                      'w-full rounded-xl border bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:outline-hidden focus:ring-2',
                      errors.email
                        ? 'border-destructive focus:ring-destructive/30'
                        : 'border-border hover:border-primary/40 focus:border-primary focus:ring-primary/20',
                    )}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-destructive">{errors.email}</p>
                  )}
                </div>

                {/* Phone / WhatsApp */}
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/80">
                    <Phone size={14} className="text-primary" /> Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value })
                      if (errors.phone) setErrors({ ...errors, phone: '' })
                    }}
                    placeholder="e.g. +44 7700 900123"
                    className={clsx(
                      'w-full rounded-xl border bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:outline-hidden focus:ring-2',
                      errors.phone
                        ? 'border-destructive focus:ring-destructive/30'
                        : 'border-border hover:border-primary/40 focus:border-primary focus:ring-primary/20',
                    )}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* ─── STEP 2: COMPANY INFO ──────────────────────────────────── */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5"
              >
                <div className="mb-4">
                  <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                    Tell us about your portfolio
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Helps our team prepare relevant revenue metrics & operational insights.
                  </p>
                </div>

                {/* Company / Brand Name */}
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/80">
                    <Building2 size={14} className="text-primary" /> Company or Host Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    placeholder="e.g. Apex Living / Independent Host"
                    className="w-full rounded-xl border border-border bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition hover:border-primary/40 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Portfolio Size Selector */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-foreground/80">
                    Number of Short-Term Rental Units *
                  </label>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {PROPERTY_COUNT_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, propertyCount: opt })
                        }
                        className={clsx(
                          'rounded-xl border py-2.5 px-3 text-center text-xs font-semibold transition-all duration-200',
                          formData.propertyCount === opt
                            ? 'border-primary bg-primary/10 text-primary shadow-xs'
                            : 'border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground',
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Property Locations */}
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/80">
                    <MapPin size={14} className="text-primary" /> Primary Location / City *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => {
                      setFormData({ ...formData, location: e.target.value })
                      if (errors.location) setErrors({ ...errors, location: '' })
                    }}
                    placeholder="e.g. London, Manchester, Edinburgh, Bath"
                    className={clsx(
                      'w-full rounded-xl border bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:outline-hidden focus:ring-2',
                      errors.location
                        ? 'border-destructive focus:ring-destructive/30'
                        : 'border-border hover:border-primary/40 focus:border-primary focus:ring-primary/20',
                    )}
                  />
                  {errors.location && (
                    <p className="mt-1 text-xs text-destructive">{errors.location}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* ─── STEP 3: INQUIRY TOPIC ─────────────────────────────────── */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5"
              >
                <div className="mb-4">
                  <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                    What would you like to discuss?
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Select your primary area of focus so we connect you with the appropriate specialist.
                  </p>
                </div>

                {/* Topic selection chips */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {INQUIRY_TOPICS.map(({ id, label, icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setFormData({ ...formData, topic: label })}
                      className={clsx(
                        'flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200',
                        formData.topic === label
                          ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary'
                          : 'border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground',
                      )}
                    >
                      <span className="text-xl">{icon}</span>
                      <span className="text-xs font-semibold">{label}</span>
                    </button>
                  ))}
                </div>

                {/* Additional notes */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/80">
                    Additional Details or Goals (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Tell us about current occupancy, pain points with guest messaging, or direct booking goals..."
                    className="w-full resize-none rounded-xl border border-border bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition hover:border-primary/40 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {errorMessage && (
          <p className="mt-4 text-xs text-destructive">{errorMessage}</p>
        )}

        {/* Buttons Row */}
        <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              data-cursor="hover"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-xs font-semibold text-muted-foreground transition hover:border-foreground/30 hover:text-foreground"
            >
              <ArrowLeft size={14} /> Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <Magnetic>
              <button
                type="button"
                onClick={handleNext}
                data-cursor="hover"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-display text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(255,56,92,0.35)] active:scale-[0.98]"
              >
                Continue <ArrowRight size={14} />
              </button>
            </Magnetic>
          ) : (
            <Magnetic>
              <button
                type="submit"
                disabled={isSubmitting}
                data-cursor="hover"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 font-display text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 hover:shadow-[0_0_25px_rgba(255,56,92,0.4)] disabled:opacity-60 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  'Submitting…'
                ) : (
                  <>
                    <Send size={15} /> Talk to an Expert
                  </>
                )}
              </button>
            </Magnetic>
          )}
        </div>
      </form>
    </div>
  )
}
