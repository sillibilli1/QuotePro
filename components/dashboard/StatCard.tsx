import type { ReactNode } from 'react';
import { cn } from '@/lib/ui/cn';

interface StatCardProps {
    label: string;
    value: string;
    icon: ReactNode;
    accent?: boolean;
}

export function StatCard({ label, value, icon, accent = false }: StatCardProps) {
    return (
        <div
            className={cn(
                'relative flex flex-col gap-3 overflow-hidden rounded-2xl border p-5',
                accent
                    ? 'border-brand/30 bg-brand/5'
                    : 'border-white/10 bg-slate-900/80',
            )}
        >
            {accent && (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-2xl"
                    style={{
                        background:
                            'radial-gradient(ellipse 120% 80% at 80% -20%, rgba(20,184,166,0.12) 0%, transparent 70%)',
                    }}
                />
            )}

            <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-widest text-slate-400">{label}</p>
                <span
                    className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                        accent ? 'bg-brand/10 text-brand-light' : 'bg-slate-800 text-slate-400',
                    )}
                >
                    {icon}
                </span>
            </div>

            <p
                className={cn(
                    'font-mono text-3xl font-bold tabular-nums leading-none',
                    accent ? 'text-brand-light' : 'text-white',
                )}
            >
                {value}
            </p>
        </div>
    );
}
