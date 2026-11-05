'use client'

import { cn } from '@/utilities/ui'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { Minus, Plus } from 'lucide-react'
import * as React from 'react'

const Accordion: React.FC<React.ComponentProps<typeof AccordionPrimitive.Root>> = (props) => {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

const AccordionItem: React.FC<React.ComponentProps<typeof AccordionPrimitive.Item>> = ({
  className,
  ...props
}) => {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('border-b border-border last:border-b-0', className)}
      {...props}
    />
  )
}

const AccordionTrigger: React.FC<React.ComponentProps<typeof AccordionPrimitive.Trigger>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group flex flex-1 items-center justify-between gap-4 py-6 text-left text-lg font-semibold outline-none transition-colors hover:text-primary focus-visible:ring-4 focus-visible:ring-ring/10 data-[state=open]:text-primary',
          className,
        )}
        {...props}
      >
        {children}
        {/* currentColor, not a hardcoded semantic token — follows whatever
            text color the trigger itself resolves to (light or dark caller). */}
        <span className="relative flex h-5 w-5 shrink-0 items-center justify-center text-current opacity-60 group-hover:opacity-100">
          <Plus className="h-4 w-4 transition-opacity duration-200 group-data-[state=open]:opacity-0" />
          <Minus className="absolute h-4 w-4 opacity-0 transition-opacity duration-200 group-data-[state=open]:opacity-100" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

// Height animates via tw-animate-css's animate-accordion-down/up, which reads
// the --radix-accordion-content-height custom property Radix sets on this
// element automatically — no asChild/forceMount gymnastics needed.
const AccordionContent: React.FC<React.ComponentProps<typeof AccordionPrimitive.Content>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn('pb-6 leading-relaxed text-muted-foreground', className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
