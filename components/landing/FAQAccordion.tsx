'use client';

import * as Accordion from '@radix-ui/react-accordion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/ui/cn';

const faqs = [
    {
        question: 'Is my data secure?',
        answer:
            'Yes. All data is encrypted at rest and in transit, stored in UAE-compliant data centers. We never share your information with third parties.',
    },
    {
        question: 'Can I cancel anytime?',
        answer:
            'Absolutely. Cancel from your dashboard at any time. You retain full access until the end of your current billing period — no questions asked.',
    },
    {
        question: 'What currency will I be charged in?',
        answer:
            "Prices automatically adjust for your region: AED for UAE & GCC, PKR for Pakistan, and USD everywhere else. You'll always see your local currency at checkout.",
    },
    {
        question: 'Do my clients need an account to view a quote?',
        answer:
            'No. Shared quote links are fully public — your client just opens the link in any browser. No login, no app download required.',
    },
    {
        question: 'What if I need help?',
        answer:
            'Starter and Growth subscribers get priority support via WhatsApp. Free users can reach us through the contact form and we respond within 24 hours.',
    },
];

interface FAQAccordionProps {
    className?: string;
}

export function FAQAccordion({ className }: FAQAccordionProps) {
    return (
        <section id="faq" className={cn('px-4 py-20 sm:py-28', className)}>
            <div className="mx-auto max-w-2xl">
                <div className="mb-12 text-center reveal-up">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-teal-400">
                        FAQ
                    </p>
                    <h2 className="text-3xl font-bold text-white md:text-4xl">
                        Frequently asked questions
                    </h2>
                </div>

                <Accordion.Root
                    type="single"
                    collapsible
                    className="reveal-up divide-y divide-white/8"
                >
                    {faqs.map((faq) => (
                        <Accordion.Item
                            key={faq.question}
                            value={faq.question}
                            className="group"
                        >
                            <Accordion.Header>
                                <Accordion.Trigger
                                    className={cn(
                                        'flex w-full items-center justify-between gap-4 py-5 text-left text-base font-medium text-white',
                                        'transition-colors duration-150 hover:text-teal-400',
                                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                                        'motion-reduce:transition-none',
                                        // min touch target
                                        'min-h-[48px]',
                                    )}
                                >
                                    <span>{faq.question}</span>
                                    <Plus
                                        className={cn(
                                            'h-5 w-5 shrink-0 text-teal-400 transition-transform duration-200',
                                            'group-data-[state=open]:rotate-45',
                                            'motion-reduce:transition-none',
                                        )}
                                        aria-hidden="true"
                                    />
                                </Accordion.Trigger>
                            </Accordion.Header>

                            <Accordion.Content
                                className={cn(
                                    'overflow-hidden text-sm leading-relaxed text-slate-400',
                                    'data-[state=open]:animate-accordion-down',
                                    'data-[state=closed]:animate-accordion-up',
                                )}
                            >
                                <p className="pb-5 pt-1">{faq.answer}</p>
                            </Accordion.Content>
                        </Accordion.Item>
                    ))}
                </Accordion.Root>
            </div>
        </section>
    );
}
