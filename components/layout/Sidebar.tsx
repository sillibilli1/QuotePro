'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/ui/cn';
import { NAV_ITEMS } from './nav-config';

/**
 * Sidebar — left navigation, visible only on md+ screens.
 * Shares the same NAV_ITEMS source as BottomNav so destinations never drift.
 */
export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside
            aria-label="Sidebar navigation"
            className={cn(
                'hidden md:flex md:flex-col',
                'fixed left-0 top-14 bottom-0 z-30 w-56',
                'border-r border-slate-800 bg-slate-950',
                'overflow-y-auto',
            )}
        >
            <nav className="flex flex-col gap-1 px-3 py-4">
                {NAV_ITEMS.map((item) => {
                    const isActive = item.matchExact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);

                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-teal-600/10 text-teal-400'
                                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200',
                            )}
                        >
                            <Icon
                                size={18}
                                strokeWidth={isActive ? 2.5 : 1.75}
                                aria-hidden="true"
                                className={cn(
                                    'shrink-0 transition-colors',
                                    isActive
                                        ? 'text-teal-400'
                                        : 'text-slate-500 group-hover:text-slate-300',
                                )}
                            />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
