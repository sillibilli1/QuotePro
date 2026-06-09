"use client";

import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/ui/cn';
import { buttonVariants } from '@/components/ui/Button';

export interface EmptyStateAction {
    label: string;
    href?: string;
    onClick?: () => void;
}

export interface EmptyStateProps {
    icon?: LucideIcon;
    heading: string;
    description?: string;
    action?: EmptyStateAction;
    className?: string;
}

export function EmptyState({ icon: Icon, heading, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
            {Icon && (
                <div
                    aria-hidden="true"
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50"
                >
                    <Icon className="h-6 w-6 text-teal-600" strokeWidth={1.75} />
                </div>
            )}
            <h3 className="text-base font-semibold text-text-primary">{heading}</h3>
            {description && (
                <p className="mt-1.5 mb-6 max-w-xs text-sm text-text-secondary">{description}</p>
            )}
            {action && !description && <div className="mb-6" />}
            {action &&
                (action.href ? (
                    <a
                        href={action.href}
                        className={cn(buttonVariants({ variant: 'primary', size: 'md' }))}
                    >
                        {action.label}
                    </a>
                ) : (
                    <button
                        type="button"
                        onClick={action.onClick}
                        className={cn(buttonVariants({ variant: 'primary', size: 'md' }))}
                    >
                        {action.label}
                    </button>
                ))}
        </div>
    );
}
