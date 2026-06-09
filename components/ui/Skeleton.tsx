import { cn } from '@/lib/ui/cn';
import { type HTMLAttributes } from 'react';

// ── Base skeleton box ──────────────────────────────────────────────────────────
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
    /** Extra Tailwind classes for sizing (e.g. "h-4 w-32") */
    className?: string;
}

/**
 * Single skeleton box with a moving-gradient shimmer (not just pulse).
 * Compose multiple <Skeleton> boxes to build complex loading states.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            aria-hidden="true"
            className={cn(
                'rounded-lg bg-zinc-200 overflow-hidden relative',
                'before:absolute before:inset-0',
                'before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
                'before:animate-[shimmer_1.5s_infinite]',
                className,
            )}
            {...props}
        />
    );
}

// ── Composable compound skeletons ─────────────────────────────────────────────

/** Quote card skeleton — mirrors the DashboardQuoteRecord card layout */
export function QuoteCardSkeleton() {
    return (
        <div
            aria-hidden="true"
            className="rounded-xl border border-border bg-surface p-4 space-y-3 shadow-card"
        >
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-48" />
            <div className="flex items-center justify-between pt-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
            </div>
        </div>
    );
}

/** Dashboard stats skeleton — three stat cards */
export function DashboardStatsSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-surface p-4 space-y-2 shadow-card">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-7 w-16" />
                </div>
            ))}
        </div>
    );
}

/** Quote list skeleton — renders n placeholder quote cards */
export function QuoteListSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="space-y-3" aria-hidden="true">
            {Array.from({ length: count }).map((_, i) => (
                <QuoteCardSkeleton key={i} />
            ))}
        </div>
    );
}

/** Upgrade plan card skeleton */
export function PlanCardSkeleton() {
    return (
        <div aria-hidden="true" className="rounded-xl border border-border bg-surface p-6 space-y-4 shadow-card">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-28" />
            <div className="space-y-2 pt-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-3 w-full" />
                ))}
            </div>
            <Skeleton className="h-11 w-full rounded-xl" />
        </div>
    );
}
