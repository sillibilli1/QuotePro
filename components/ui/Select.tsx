'use client';

import * as RadixSelect from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/ui/cn';

// ── Option type ────────────────────────────────────────────────────────────────
export interface SelectOption {
    value: string;
    label: string;
    icon?: ReactNode;
    disabled?: boolean;
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface SelectProps {
    label?: string;
    error?: string;
    hint?: string;
    placeholder?: string;
    options: SelectOption[];
    value?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
    id?: string;
    name?: string;
    required?: boolean;
}

// ── Component ──────────────────────────────────────────────────────────────────
export function Select({
    label,
    error,
    hint,
    placeholder = 'Select an option',
    options,
    value,
    onValueChange,
    disabled,
    id,
    required,
}: SelectProps) {
    const uid = useId();
    const triggerId = id ?? uid;
    const errorId = `${triggerId}-error`;
    const hintId = `${triggerId}-hint`;

    const describedBy = [error ? errorId : null, hint ? hintId : null]
        .filter(Boolean)
        .join(' ') || undefined;

    return (
        <div className="flex w-full flex-col gap-1.5">
            {label && (
                <label htmlFor={triggerId} className="text-xs font-medium text-text-secondary">
                    {label}
                    {required && <span className="ml-0.5 text-rose-500">*</span>}
                </label>
            )}
            <RadixSelect.Root
                value={value}
                onValueChange={onValueChange}
                disabled={disabled}
                required={required}
            >
                <RadixSelect.Trigger
                    id={triggerId}
                    aria-describedby={describedBy}
                    aria-invalid={error ? true : undefined}
                    className={cn(
                        'flex h-11 w-full items-center justify-between rounded-lg border bg-surface px-3 text-sm',
                        'transition-colors duration-150',
                        'focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-500',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        'data-[placeholder]:text-text-tertiary',
                        error
                            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-100 text-text-primary'
                            : 'border-border text-text-primary',
                    )}
                >
                    <RadixSelect.Value placeholder={placeholder} />
                    <RadixSelect.Icon asChild>
                        <ChevronDown className="h-4 w-4 text-text-tertiary shrink-0" aria-hidden="true" />
                    </RadixSelect.Icon>
                </RadixSelect.Trigger>

                <RadixSelect.Portal>
                    <RadixSelect.Content
                        position="popper"
                        sideOffset={4}
                        className={cn(
                            'z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-border bg-surface shadow-pop',
                            'data-[state=open]:animate-in data-[state=closed]:animate-out',
                            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                            'data-[side=bottom]:slide-in-from-top-2',
                        )}
                    >
                        <RadixSelect.ScrollUpButton className="flex cursor-default items-center justify-center py-1 text-text-tertiary">
                            <ChevronUp className="h-4 w-4" />
                        </RadixSelect.ScrollUpButton>

                        <RadixSelect.Viewport className="p-1">
                            {options.map((opt) => (
                                <RadixSelect.Item
                                    key={opt.value}
                                    value={opt.value}
                                    disabled={opt.disabled}
                                    className={cn(
                                        'relative flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm text-text-primary outline-none',
                                        'data-[highlighted]:bg-teal-50 data-[highlighted]:text-teal-700',
                                        'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
                                    )}
                                >
                                    {opt.icon && (
                                        <span className="shrink-0 text-text-tertiary" aria-hidden="true">
                                            {opt.icon}
                                        </span>
                                    )}
                                    <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                                    <RadixSelect.ItemIndicator className="absolute right-2 flex items-center">
                                        <Check className="h-4 w-4 text-teal-600" aria-hidden="true" />
                                    </RadixSelect.ItemIndicator>
                                </RadixSelect.Item>
                            ))}
                        </RadixSelect.Viewport>

                        <RadixSelect.ScrollDownButton className="flex cursor-default items-center justify-center py-1 text-text-tertiary">
                            <ChevronDown className="h-4 w-4" />
                        </RadixSelect.ScrollDownButton>
                    </RadixSelect.Content>
                </RadixSelect.Portal>
            </RadixSelect.Root>

            {hint && !error && (
                <p id={hintId} className="text-xs text-text-tertiary">{hint}</p>
            )}
            {error && (
                <p id={errorId} role="alert" className="text-xs text-rose-600">{error}</p>
            )}
        </div>
    );
}
