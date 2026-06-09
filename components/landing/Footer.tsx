import Link from 'next/link';

const links = [
    {
        heading: 'Product',
        items: [
            { label: 'Features', href: '/#features' },
            { label: 'How It Works', href: '/#how-it-works' },
            { label: 'Pricing', href: '/#pricing' },
        ],
    },
    {
        heading: 'Company',
        items: [
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
        ],
    },
    {
        heading: 'Support',
        items: [
            { label: 'FAQ', href: '/#faq' },
            { label: 'WhatsApp', href: 'https://wa.me/971000000000' },
            { label: 'Contact', href: 'mailto:hello@quotepro.ae' },
        ],
    },
];

export function Footer() {
    return (
        <footer className="border-t border-white/8 bg-slate-950 px-4 pt-14 pb-8">
            <div className="mx-auto max-w-5xl">
                {/* Top row: logo + nav columns */}
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-12">
                    {/* Brand */}
                    <div className="col-span-2 sm:col-span-1">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500">
                                <span className="text-xs font-bold text-slate-950">QP</span>
                            </span>
                            <span className="text-base font-bold text-white">QuotePro</span>
                        </Link>
                        <p className="mt-3 text-sm leading-relaxed text-slate-500">
                            AI-powered quoting for UAE contractors and freelancers.
                        </p>
                    </div>

                    {/* Link columns */}
                    {links.map((col) => (
                        <div key={col.heading}>
                            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
                                {col.heading}
                            </p>
                            <ul className="flex flex-col gap-3">
                                {col.items.map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            className="text-sm text-slate-400 transition hover:text-teal-400 focus:outline-none focus-visible:text-teal-400 motion-reduce:transition-none"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom row */}
                <div className="mt-12 border-t border-white/8 pt-6 text-center text-xs text-slate-600">
                    © {new Date().getFullYear()} QuotePro. Built for UAE businesses.
                </div>
            </div>
        </footer>
    );
}
