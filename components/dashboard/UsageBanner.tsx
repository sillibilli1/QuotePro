import Link from 'next/link';

interface UsageBannerProps {
    count: number;
    limit: number;
    remaining: number;
    isLimitReached: boolean;
}

function pct(count: number, limit: number) {
    if (limit <= 0) return 0;
    return Math.min((count / limit) * 100, 100);
}

export function UsageBanner({ count, limit, remaining, isLimitReached }: UsageBannerProps) {
    const isUnlimited = limit > 1000 || limit === 999999;
    const progress = isUnlimited ? 2 : pct(count, limit);
    const isWarning = !isUnlimited && !isLimitReached && remaining <= 2;
    const showUpgrade = !isUnlimited && progress >= 80;

    const barColor = isLimitReached
        ? 'bg-rose-400'
        : isWarning
            ? 'bg-amber-400'
            : 'bg-brand';

    const textColor = isLimitReached
        ? 'text-rose-300'
        : isWarning
            ? 'text-amber-300'
            : 'text-slate-400';
    const usageLabel = isUnlimited
        ? `${count} quotes used (Unlimited ∞)`
        : `${count} of ${limit} quotes used`;

    return (
        <div className="flex flex-col gap-1.5">
            {/* Label row */}
            <div className="flex items-center justify-between gap-3">
                <p className={`text-xs font-medium ${textColor}`}>{usageLabel}</p>
                <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-500">{isUnlimited ? '∞' : `${Math.round(progress)}%`}</p>
                    {showUpgrade && (
                        <Link
                            href="/app/upgrade"
                            className="text-xs font-semibold text-brand-light underline-offset-2 hover:underline"
                        >
                            Upgrade
                        </Link>
                    )}
                </div>
            </div>

            {/* Progress bar */}
            <div
                role="progressbar"
                aria-valuenow={count}
                aria-valuemin={0}
                aria-valuemax={limit}
                aria-label={usageLabel}
                className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800"
            >
                <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
