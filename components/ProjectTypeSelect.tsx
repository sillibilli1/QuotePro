'use client';

import clsx from 'clsx';
import { forwardRef, type SelectHTMLAttributes } from 'react';
import { PROJECT_TYPES } from '@/types';

type ProjectTypeSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
    label: string;
    error?: string;
};

export const ProjectTypeSelect = forwardRef<HTMLSelectElement, ProjectTypeSelectProps>(function ProjectTypeSelect(
    {
        label,
        error,
        className,
        id,
        ...props
    }: ProjectTypeSelectProps,
    ref,
) {
    const selectId = id ?? label.toLowerCase().replace(/\s+/g, '-');
    const errorId = `${selectId}-error`;

    return (
        <label htmlFor={selectId} className="flex w-full flex-col gap-2 text-sm font-medium text-slate-100">
            <span>{label}</span>
            <select
                ref={ref}
                id={selectId}
                aria-describedby={error ? errorId : undefined}
                aria-invalid={error ? true : undefined}
                className={clsx(
                    'min-h-[48px] w-full appearance-none rounded-2xl border bg-slate-900 px-4 py-3 text-base text-white focus:outline-none focus:ring-2',
                    error
                        ? 'border-rose-500/70 focus:border-rose-400 focus:ring-rose-400/40'
                        : 'border-slate-700 focus:border-brand focus:ring-brand-light',
                    className,
                )}
                {...props}
            >
                <option value="" className="text-slate-500">
                    Select project type
                </option>
                {PROJECT_TYPES.map((projectType) => (
                    <option key={projectType} value={projectType}>
                        {projectType}
                    </option>
                ))}
            </select>
            {error ? (
                <span id={errorId} className="text-sm text-rose-300">
                    {error}
                </span>
            ) : null}
        </label>
    );
});
