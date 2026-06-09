'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/ui/cn';

// ── Variant map ────────────────────────────────────────────────────────────────
export const buttonVariants = cva(
    // base
    [
        'inline-flex items-center justify-center gap-2 font-semibold rounded-lg',
        'transition-all duration-150 select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2',
        'active:scale-[0.98]',
        'disabled:pointer-events-none disabled:opacity-50',
    ],
    {
        variants: {
            variant: {
                primary: [
                    'bg-teal-600 text-white',
                    'hover:bg-teal-700',
                    'active:bg-teal-800',
                ],
                secondary: [
                    'bg-white text-text-primary border border-border',
                    'hover:bg-surface-subtle',
                    'active:bg-zinc-100',
                ],
                ghost: [
                    'bg-transparent text-text-primary',
                    'hover:bg-surface-subtle',
                    'active:bg-zinc-100',
                ],
                danger: [
                    'bg-rose-600 text-white',
                    'hover:bg-rose-700',
                    'active:bg-rose-800',
                ],
            },
            size: {
                sm: 'h-9 px-3 text-sm',
                md: 'h-11 px-4 text-sm',
                lg: 'h-12 px-6 text-base',
            },
            fullWidthMobile: {
                true: 'w-full sm:w-auto',
                false: '',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
            fullWidthMobile: false,
        },
    },
);

// ── Types ──────────────────────────────────────────────────────────────────────
export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    loading?: boolean;
    icon?: ReactNode;
    iconRight?: ReactNode;
}

// ── Component ──────────────────────────────────────────────────────────────────
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    {
        className,
        variant,
        size,
        fullWidthMobile,
        loading = false,
        icon,
        iconRight,
        disabled,
        children,
        type = 'button',
        ...props
    },
    ref,
) {
    const isDisabled = disabled || loading;

    return (
        <button
            ref={ref}
            type={type}
            disabled={isDisabled}
            aria-disabled={isDisabled}
            className={cn(buttonVariants({ variant, size, fullWidthMobile }), className)}
            {...props}
        >
            {loading ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
                    {/* Keep text hidden but preserve width so layout doesn't shift */}
                    <span className="invisible absolute">{children}</span>
                    <span aria-hidden="true" className="opacity-0 pointer-events-none select-none">
                        {children}
                    </span>
                </>
            ) : (
                <>
                    {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
                    {children}
                    {iconRight && <span className="shrink-0" aria-hidden="true">{iconRight}</span>}
                </>
            )}
        </button>
    );
});
