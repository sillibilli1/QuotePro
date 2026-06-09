import type { ReactNode } from 'react';
import { cn } from '@/lib/ui/cn';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    /** Right-aligned slot — buttons, badge, etc. */
    action?: ReactNode;
    className?: string;
}

/**
 * PageHeader — consistent h1 + optional subtitle + right action slot.
 * Used on every /app/* page so headings are always visually aligned.
 */
export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
    return (
        <div className={cn('flex items-start justify-between gap-4', className)}>
            <div className="min-w-0 flex-1">
                <h1 className="type-h1 truncate text-white">{title}</h1>
                {subtitle && (
                    <p className="mt-1 text-sm leading-5 text-slate-400">{subtitle}</p>
                )}
            </div>
            {action && (
                <div className="flex shrink-0 items-center gap-2">{action}</div>
            )}
        </div>
    );
}
