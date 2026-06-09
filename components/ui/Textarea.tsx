'use client';

import { forwardRef, useId, useRef, useEffect, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/ui/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
    autoGrow?: boolean;
    showCount?: boolean;
    maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
    { label, error, hint, autoGrow = false, showCount = false, maxLength, className, id, onChange, value, ...props },
    forwardedRef,
) {
    const uid = useId();
    const inputId = id ?? uid;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    const innerRef = useRef<HTMLTextAreaElement>(null);

    // Use forwardedRef or inner ref
    const ref = (forwardedRef as React.RefObject<HTMLTextAreaElement>) ?? innerRef;

    const describedBy = [error ? errorId : null, hint ? hintId : null]
        .filter(Boolean)
        .join(' ') || undefined;

    // Auto-grow: resize on content change
    useEffect(() => {
        if (!autoGrow || !ref.current) return;
        const el = ref.current;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    }, [value, autoGrow, ref]);

    const charCount = typeof value === 'string' ? value.length : 0;

    return (
        <div className="flex w-full flex-col gap-1.5">
            {label && (
                <label htmlFor={inputId} className="text-xs font-medium text-text-secondary">
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                id={inputId}
                value={value}
                maxLength={maxLength}
                aria-describedby={describedBy}
                aria-invalid={error ? true : undefined}
                onChange={onChange}
                className={cn(
                    'w-full min-h-[96px] rounded-lg border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary',
                    'transition-colors duration-150 resize-y',
                    'focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-500',
                    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-subtle',
                    autoGrow && 'resize-none overflow-hidden',
                    error
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-100'
                        : 'border-border',
                    className,
                )}
                {...props}
            />
            <div className="flex items-start justify-between gap-2">
                <div>
                    {hint && !error && (
                        <p id={hintId} className="text-xs text-text-tertiary">{hint}</p>
                    )}
                    {error && (
                        <p id={errorId} role="alert" className="text-xs text-rose-600">{error}</p>
                    )}
                </div>
                {showCount && maxLength && (
                    <p className={cn('text-xs tabular-nums shrink-0', charCount >= maxLength ? 'text-rose-600' : 'text-text-tertiary')}>
                        {charCount}/{maxLength}
                    </p>
                )}
            </div>
        </div>
    );
});
