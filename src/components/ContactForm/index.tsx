'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Magnetic } from '@/components/motion/Magnetic'

type FormField = {
  name: string
  label?: string | null
  required?: boolean | null
  blockType: string
}

type Props = {
  formId: number
  fields: FormField[]
  submitLabel?: string | null
}

// Generic renderer over a Payload form-builder Form doc — field labels,
// order, and requiredness are CMS-driven, so the client can edit the form in
// Payload admin later without a code change. Posts to form-builder's own
// /api/form-submissions endpoint (plugin-form-builder is already installed
// and its forms/form-submissions collections already registered).
export function ContactForm({ formId, fields, submitLabel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, string>>()
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const onSubmit = async (data: Record<string, string>) => {
    setStatus('idle')
    try {
      const res = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: formId,
          submissionData: Object.entries(data)
            .filter(([, value]) => value !== undefined && value !== '')
            .map(([field, value]) => ({ field, value: String(value) })),
        }),
      })
      if (!res.ok) throw new Error('Submission failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-sm border border-brand-green-bright/30 bg-brand-mint p-6 text-sm font-medium text-brand-green-deep">
        Thanks — we&apos;ll get back to you within one business day.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {fields.map((field) => {
        const isTextarea = field.blockType === 'textarea'
        const inputType = field.blockType === 'email' ? 'email' : 'text'

        return (
          <div key={field.name} className="flex flex-col gap-1.5">
            <label htmlFor={field.name} className="text-sm font-medium">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </label>
            {isTextarea ? (
              <textarea
                id={field.name}
                rows={5}
                {...register(field.name, { required: !!field.required })}
                className="resize-y rounded-sm border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <input
                id={field.name}
                type={inputType}
                {...register(field.name, { required: !!field.required })}
                className="rounded-sm border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
            {errors[field.name] && (
              <span className="text-xs text-destructive">This field is required.</span>
            )}
          </div>
        )
      })}

      {status === 'error' && (
        <p className="text-sm text-destructive">
          Something went wrong — please try again or email us directly.
        </p>
      )}

      <Magnetic className="self-start">
        <Button type="submit" size="lg" disabled={isSubmitting} data-cursor="hover">
          {isSubmitting ? 'Sending…' : submitLabel || 'Send Message'}
        </Button>
      </Magnetic>
    </form>
  )
}
