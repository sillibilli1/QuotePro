import Link from 'next/link';

type UsageBannerProps = {
    count: number;
    limit: number;
    remaining: number;
    isLimitReached: boolean;
};

function getProgressPercentage(count: number, limit: number) {
    if (limit <= 0) {
        return 0;
    }

    return Math.min((count / limit) * 100, 100);
}

export function UsageBanner({ count, limit, remaining, isLimitReached }: UsageBannerProps) {
    const progressPercentage = getProgressPercentage(count, limit);
    const isWarning = !isLimitReached && remaining <= 2;
    const showUpgradeLink = count / limit >= 0.8;

    const containerClasses = isLimitReached
        ? 'border-rose-500/30 bg-rose-500/10'
        : isWarning
            ? 'border-yellow-500/30 bg-yellow-500/10'
            : 'border-white/10 bg-slate-900/80';
    const statusTextClasses = isLimitReached
        ? 'text-rose-200'
        : isWarning
            ? 'text-yellow-200'
            : 'text-slate-200';
    const progressBarClasses = isLimitReached ? 'bg-rose-400' : isWarning ? 'bg-yellow-400' : 'bg-brand';

    return (
        <section className={`rounded-3xl border p-5 shadow-soft ${containerClasses}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-light">Monthly Usage</p>
                    <p className={`mt-2 text-base font-medium ${statusTextClasses}`}>
                        {isLimitReached
                            ? 'You have reached your monthly limit of 5 quotes'
                            : `You have ${remaining} quotes remaining this month`}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">{count} of {limit} quotes used this month</p>
                </div>

                {showUpgradeLink ? (
                    <Link
                        href="/app/upgrade"
                        className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-brand/30 bg-brand/10 px-4 py-2 text-sm font-semibold text-brand-light transition hover:bg-brand/20"
                    >
                        Upgrade
                    </Link>
                ) : null}
            </div>

            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-950/80">
                <div
                    className={`h-full rounded-full transition-all ${progressBarClasses}`}
                    style={{ width: `${progressPercentage}%` }}
                    aria-hidden="true"
                />
            </div>
        </section>
    );
}
