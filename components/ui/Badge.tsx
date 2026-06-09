import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/ui/cn';
import { getStatusTokens, type QuoteStatus } from '@/lib/ui/status';

// ── Variant map ────────────────────────────────────────────────────────────────
const badgeVariants = cva(
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
    {
        variants: {
            variant: {
                default: 'bg-zinc-100 text-zinc-700',
                primary: 'bg-teal-50 text-teal-700',
                success: 'bg-emerald-50 text-emerald-700',
                warning: 'bg-amber-50 text-amber-700',
                danger: 'bg-rose-50 text-rose-700',
                info: 'bg-blue-50 text-blue-700',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

// ── Types ──────────────────────────────────────────────────────────────────────
export interface BadgeProps
    extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
    dot?: boolean;
}

// ── Badge component ────────────────────────────────────────────────────────────
export function Badge({ variant, dot = false, className, children, ...props }: BadgeProps) {
    return (
        <span className={cn(badgeVariants({ variant }), className)} {...props}>
            {dot && (
                <span
                    aria-hidden="true"
                    className={cn(
                        'inline-block w-1.5 h-1.5 rounded-full shrink-0',
                        variant === 'success' && 'bg-emerald-500',
                        variant === 'warning' && 'bg-amber-500',
                        variant === 'danger' && 'bg-rose-500',
                        variant === 'info' && 'bg-blue-500',
                        variant === 'primary' && 'bg-teal-500',
                        (!variant || variant === 'default') && 'bg-zinc-500',
                    )}
                />
            )}
            {children}
        </span>
    );
}

// ── StatusBadge — reads from lib/ui/status.ts ─────────────────────────────────
export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
    status: QuoteStatus | string;
    dot?: boolean;
}

export function StatusBadge({ status, dot = false, className, ...props }: StatusBadgeProps) {
    const tokens = getStatusTokens(status);

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                tokens.bgClass,
                tokens.textClass,
                className,
            )}
            {...props}
        >
            {dot && (
                <span
                    aria-hidden="true"
                    className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: tokens.hex }}
                />
            )}
            {tokens.label}
        </span>
    );
}

export { badgeVariants };
