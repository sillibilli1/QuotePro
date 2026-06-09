'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/ui/cn';
import { NAV_ITEMS } from './nav-config';

/**
 * BottomNav — fixed bottom tab bar, visible only on small screens (md:hidden).
 * Safe-area padding handles notched iOS devices.
 */
export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav
            aria-label="Main navigation"
            className={cn(
                'fixed bottom-0 left-0 right-0 z-40 md:hidden',
                'flex items-stretch border-t border-slate-800 bg-slate-950',
                'pb-[env(safe-area-inset-bottom)]',
            )}
        >
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
                            'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors',
                            isActive
                                ? 'text-teal-400'
                                : 'text-slate-500 hover:text-slate-300',
                        )}
                    >
                        <Icon
                            size={22}
                            strokeWidth={isActive ? 2.5 : 1.75}
                            aria-hidden="true"
                        />
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
