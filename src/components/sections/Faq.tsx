import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Reveal } from '@/components/motion/Reveal'
import { eyebrowOnDark } from '@/utilities/typography'
import { faqSchema, jsonLdScript } from '@/utilities/jsonld'

const faqs = [
  {
    question: 'What exactly does Assist BNB do?',
    answer:
      'Assist BNB is a dedicated short-term rental operations and management partner. We manage 24/7 guest communications, cleaning and turnover coordination, dynamic pricing, listing SEO, and commission-free direct booking engines so your STR business runs smoothly without demanding your constant attention.',
  },
  {
    question: 'Do you charge a commission on my bookings?',
    answer:
      'No. We operate strictly on transparent, flat monthly pricing with £0 commission taken from your rental income. You keep 100% of your nightly rates and cleaning fees.',
  },
  {
    question: 'How quickly do you respond to guest messages?',
    answer:
      'Our team maintains a sub-15-minute average response time around the clock. Rapid, professional answers protect your Superhost/Premier Host ratings and boost booking conversion.',
  },
  {
    question: 'How do you coordinate cleaning and turnovers?',
    answer:
      'We link your calendar directly into turnover management tools to auto-dispatch cleaners upon checkout, schedule linen deliveries, and require photo-checklist inspections before the next check-in.',
  },
  {
    question: 'Can I keep my current cleaners and contractors?',
    answer:
      'Yes. We seamlessly onboard your trusted cleaners, handymen, and contractors into our escalation process. If you ever need replacements, we can connect you with vetted local specialists.',
  },
  {
    question: 'How do you handle guest vetting and late-night emergencies?',
    answer:
      'We screen guest IDs and profiles against strict criteria before check-in. For late-night questions or lockbox guidance, our 24/7 team handles them instantly. For genuine maintenance issues, we dispatch your approved contractors based on agreed emergency limits.',
  },
  {
    question: 'Do you require long-term contracts?',
    answer:
      'No. Our engagements are month-to-month with no lock-ins. We earn your partnership through operational excellence every single month.',
  },
  {
    question: 'Can you help build our direct booking website?',
    answer:
      'Yes! We build high-performance, mobile-optimised direct booking engines with instant Stripe card payments, live calendar synchronisation, and automated guest confirmations so you can reduce your reliance on Airbnb and Booking.com.',
  },
]

export function Faq() {
  return (
    <section id="faq" className="border-b border-border bg-background py-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(faqSchema(faqs.map((f) => ({ question: f.question, answer: f.answer })))),
        }}
      />
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <div className="lg:sticky lg:top-32">
              <h2
                aria-hidden="true"
                className="-ml-1 mb-4 font-display text-[8rem] leading-none font-bold tracking-tighter text-foreground/5 select-none md:text-[10rem]"
              >
                FAQ
              </h2>
              <div className="relative -mt-16 ml-2 md:-mt-20">
                <p className={`mb-4 ${eyebrowOnDark}`}>The Details</p>
                <h3 className="mb-6 font-display text-4xl font-bold text-foreground md:text-5xl">
                  Answers to your questions.
                </h3>
                <p className="max-w-sm font-body text-lg leading-relaxed text-muted-foreground">
                  Everything you need to know about our operations, fees, and onboarding process.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="relative z-10 mt-10 w-full lg:mt-32">
            <Accordion type="single" collapsible>
              {faqs.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger className="text-lg hover:text-primary data-[state=open]:text-primary md:text-xl">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
