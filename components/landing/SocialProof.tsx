const stats = [
    { value: '500+', label: 'Quotes generated' },
    { value: '< 60s', label: 'Average quote time' },
    { value: '5★', label: 'Client satisfaction' },
];

const testimonial = {
    quote:
        'We used to spend 30 minutes per quote in Excel. With QuotePro it takes under a minute and looks twice as professional.',
    author: 'Ahmed Al-Rashidi',
    role: 'General Contractor, Dubai',
};

export function SocialProof() {
    return (
        <section className="bg-slate-950 px-4 py-20 sm:py-28">
            <div className="mx-auto max-w-5xl">
                {/* Stats row */}
                <div className="reveal-up mb-14 grid grid-cols-3 gap-4 sm:gap-8">
                    {stats.map((s) => (
                        <div key={s.label} className="flex flex-col items-center gap-1 text-center">
                            <span className="font-mono text-3xl font-bold text-teal-400 sm:text-4xl">
                                {s.value}
                            </span>
                            <span className="text-xs text-slate-500 sm:text-sm">{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Testimonial card */}
                <div className="reveal-up mx-auto max-w-2xl rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center">
                    {/* Quote mark */}
                    <div className="mb-4 text-5xl leading-none text-teal-500/30 select-none" aria-hidden="true">
                        &ldquo;
                    </div>
                    <p className="text-base leading-relaxed text-slate-200 sm:text-lg">
                        {testimonial.quote}
                    </p>
                    <div className="mt-6 flex flex-col items-center gap-1">
                        <span className="text-sm font-semibold text-white">{testimonial.author}</span>
                        <span className="text-xs text-slate-500">{testimonial.role}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
