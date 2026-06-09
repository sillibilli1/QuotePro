import { LayoutDashboard, FilePlus2, Users, UserCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
    /** Match sub-paths too (e.g. /app/quotes/new should still mark dashboard active? No — exact match by default) */
    matchExact?: boolean;
}

/**
 * Single source of truth for all authenticated app navigation.
 * Consumed by both BottomNav (mobile) and Sidebar (desktop).
 */
export const NAV_ITEMS: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/app/dashboard',
        icon: LayoutDashboard,
        matchExact: false,
    },
    {
        label: 'New Quote',
        href: '/app/quotes/new',
        icon: FilePlus2,
        matchExact: true,
    },
    {
        label: 'Clients',
        href: '/app/clients',
        icon: Users,
        matchExact: false,
    },
    {
        label: 'Account',
        href: '/app/profile',
        icon: UserCircle,
        matchExact: false,
    },
];
