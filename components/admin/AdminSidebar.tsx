'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, FileText, Gift, Activity, Zap, DollarSign } from 'lucide-react';

const navItems = [
    { href: '/hq-admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/hq-admin/users', label: 'Users', icon: Users },
    { href: '/hq-admin/revenue', label: 'Revenue', icon: DollarSign },
    { href: '/hq-admin/payments', label: 'Payments', icon: CreditCard },
    { href: '/hq-admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
    { href: '/hq-admin/quotes', label: 'Quotes', icon: FileText },
    { href: '/hq-admin/referrals', label: 'Referrals', icon: Gift },
    { href: '/hq-admin/system', label: 'System', icon: Activity },
    { href: '/hq-admin/actions', label: 'Quick Actions', icon: Zap },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-gray-900 border-r border-gray-800 min-h-screen">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-red-500">Admin HQ</h1>
            </div>
            <nav className="px-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="absolute bottom-4 left-4 right-4">
                <Link href="/app/dashboard" className="block text-center text-sm text-gray-500 hover:text-gray-300">← Back to App</Link>
            </div>
        </aside>
    );
}
