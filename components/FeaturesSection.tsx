// Server Component — no 'use client' needed

const features = [
    {
        icon: '💡',
        title: 'AI-Powered Quotes',
        description:
            'Describe your project in seconds. Get a professional quote ready to send.',
    },
    {
        icon: '📄',
        title: 'Professional PDFs',
        description:
            'Bilingual Arabic + English PDFs, formatted for WhatsApp sharing.',
    },
    {
        icon: '📱',
        title: 'WhatsApp-Ready',
        description:
            'Share quotes directly on WhatsApp. Track when clients view them.',
    },
];

export function FeaturesSection() {
    return (
        <section id="features" className="bg-slate-950 px-4 py-20">
            <div className="mx-auto max-w-5xl">
                {/* Section heading */}
                <div className="mb-14 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                        Everything you need to win more business
                    </h2>
                    <p className="text-slate-400">
                        From brief to professional quote in under a minute.
                    </p>
                </div>

                {/* Feature cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-teal-500/30 hover:bg-teal-500/5"
                        >
                            <div className="mb-4 text-4xl">{feature.icon}</div>
                            <h3 className="mb-2 text-lg font-semibold text-white">
                                {feature.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-slate-400">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
