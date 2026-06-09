'use client';

import { useState } from 'react';

const faqs = [
    {
        question: 'Is my data secure?',
        answer:
            'Yes. All data is encrypted and stored in UAE-compliant data centers. We never share your information.',
    },
    {
        question: 'Can I cancel anytime?',
        answer:
            'Yes. Cancel from your dashboard anytime. You keep access until end of billing period.',
    },
    {
        question: 'What currency will I be charged in?',
        answer:
            "You'll be charged in your local currency (AED for UAE, PKR for Pakistan, USD elsewhere).",
    },
    {
        question: 'What if I need help?',
        answer: 'Contact us via WhatsApp for priority support.',
    },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border-b border-white/10">
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-medium text-white transition hover:text-teal-400 min-h-[48px]"
                aria-expanded={open}
            >
                <span>{question}</span>
                <span
                    className={`flex-shrink-0 text-teal-400 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
                >
                    +
                </span>
            </button>
            {open && (
                <div className="pb-5 text-sm leading-relaxed text-slate-400">{answer}</div>
            )}
        </div>
    );
}

export function FAQSection() {
    return (
        <section id="faq" className="bg-slate-950 px-4 py-20">
            <div className="mx-auto max-w-2xl">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold text-white md:text-4xl">
                        Frequently asked questions
                    </h2>
                </div>
                <div>
                    {faqs.map((faq) => (
                        <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            </div>
        </section>
    );
}
