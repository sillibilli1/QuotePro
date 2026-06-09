'use client';

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/ui/cn';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'suffix'> {
    label?: string;
    error?: string;
    hint?: string;
    prefix?: ReactNode;
    suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    { label, error, hint, prefix, suffix, className, id, ...props },
    ref,
) {
    const uid = useId();
    const inputId = id ?? uid;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const describedBy = [error ? errorId : null, hint ? hintId : null]
        .filter(Boolean)
        .join(' ') || undefined;

    return (
        <div className="flex w-full flex-col gap-1.5">
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-xs font-medium text-text-secondary"
                >
                    {label}
                </label>
            )}
            <div className="relative flex items-center">
                {prefix && (
                    <span className="pointer-events-none absolute left-3 flex items-center text-sm text-text-tertiary select-none">
                        {prefix}
                    </span>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    aria-describedby={describedBy}
                    aria-invalid={error ? true : undefined}
                    className={cn(
                        'h-11 w-full rounded-lg border bg-surface px-3 text-sm text-text-primary placeholder:text-text-tertiary',
                        'transition-colors duration-150',
                        'focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-500',
                        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-subtle',
                        error
                            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-100'
                            : 'border-border',
                        prefix ? 'pl-10' : '',
                        suffix ? 'pr-10' : '',
                        className,
                    )}
                    {...props}
                />
                {suffix && (
                    <span className="pointer-events-none absolute right-3 flex items-center text-sm text-text-tertiary select-none">
                        {suffix}
                    </span>
                )}
            </div>
            {hint && !error && (
                <p id={hintId} className="text-xs text-text-tertiary">
                    {hint}
                </p>
            )}
            {error && (
                <p id={errorId} role="alert" className="text-xs text-rose-600">
                    {error}
                </p>
            )}
        </div>
    );
});
