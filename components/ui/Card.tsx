import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/ui/cn';

// ── Card ──────────────────────────────────────────────────────────────────────
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
    { interactive = false, className, children, ...props },
    ref,
) {
    return (
        <div
            ref={ref}
            className={cn(
                'rounded-xl border border-border bg-surface shadow-card',
                interactive && [
                    'transition-all duration-150 cursor-pointer',
                    'hover:border-teal-500 hover:shadow-pop',
                ],
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
});

// ── CardHeader ────────────────────────────────────────────────────────────────
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    function CardHeader({ className, children, ...props }, ref) {
        return (
            <div
                ref={ref}
                className={cn('flex flex-col gap-1.5 p-5 border-b border-border', className)}
                {...props}
            >
                {children}
            </div>
        );
    },
);

// ── CardBody ──────────────────────────────────────────────────────────────────
export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    function CardBody({ className, children, ...props }, ref) {
        return (
            <div ref={ref} className={cn('p-5', className)} {...props}>
                {children}
            </div>
        );
    },
);

// ── CardFooter ────────────────────────────────────────────────────────────────
export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    function CardFooter({ className, children, ...props }, ref) {
        return (
            <div
                ref={ref}
                className={cn('flex items-center p-5 border-t border-border', className)}
                {...props}
            >
                {children}
            </div>
        );
    },
);
