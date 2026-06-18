'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, LogOut, User, ArrowLeft } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/ui/cn';
import { PageTransition } from '@/components/motion/PageTransition';
import type { PlanTier } from '@/types';

// ── Plan badge helpers ─────────────────────────────────────────────────────────

const PLAN_LABEL: Record<PlanTier, string> = {
    free: 'Free',
    starter: 'Starter',
    growth: 'Growth',
};

const PLAN_VARIANT: Record<PlanTier, 'default' | 'primary' | 'success'> = {
    free: 'default',
    starter: 'primary',
    growth: 'success',
};

// ── TopBar ─────────────────────────────────────────────────────────────────────

interface TopBarProps {
    userEmail: string;
    plan: PlanTier | null;
    isSubscribed: boolean;
    onSignOut: () => void;
}

function TopBar({ userEmail, plan, isSubscribed, onSignOut }: TopBarProps) {
    const pathname = usePathname();
    const router = useRouter();

    // STRICT CHECK: If not subscribed, always show 'free' regardless of plan column
    const normalizedPlan = plan?.toLowerCase() as PlanTier | null;
    const tier: PlanTier = isSubscribed && normalizedPlan && ['starter', 'growth'].includes(normalizedPlan)
        ? normalizedPlan
        : 'free';

    const handleBack = () => {
        // If on quote detail page, hard refresh to /app/quotes/new to bypass cache
        if (pathname?.startsWith('/quotes/')) {
            window.location.href = '/app/quotes/new';
        } else {
            router.back();
        }
    };

    return (
        <header
            className={cn(
                'fixed inset-x-0 top-0 z-50 h-14',
                'flex items-center justify-between',
                'border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm',
                'px-4 md:px-6',
            )}
        >
            {/* Logo with Back Arrow */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleBack}
                    className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg',
                        'text-slate-400 hover:bg-slate-800/60 hover:text-white',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
                        'transition-colors',
                    )}
                    aria-label="Go back"
                >
                    <ArrowLeft size={18} aria-hidden="true" />
                </button>
                <Link
                    href="/app/dashboard"
                    className="flex items-center gap-2 text-white"
                    aria-label="QuotePro — go to dashboard"
                >
                    <span className="text-lg font-bold tracking-tight">
                        Quote<span className="text-teal-400">Pro</span>
                    </span>
                </Link>
            </div>

            {/* Right: plan badge + account menu */}
            <div className="flex items-center gap-3">
                {/* Plan badge → links to upgrade page */}
                <Link href="/app/upgrade" tabIndex={-1} aria-label={`Current plan: ${PLAN_LABEL[tier]}. Upgrade plan.`}>
                    <Badge variant={PLAN_VARIANT[tier]}>{PLAN_LABEL[tier]}</Badge>
                </Link>

                {/* Account dropdown */}
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <button
                            className={cn(
                                'flex items-center gap-1.5 rounded-lg px-2 py-1.5',
                                'text-sm font-medium text-slate-300',
                                'hover:bg-slate-800/60 hover:text-white',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
                                'transition-colors',
                            )}
                            aria-label="Account menu"
                        >
                            <span className="hidden max-w-[140px] truncate sm:block">
                                {userEmail}
                            </span>
                            <ChevronDown size={14} aria-hidden="true" />
                        </button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Portal>
                        <DropdownMenu.Content
                            align="end"
                            sideOffset={8}
                            className={cn(
                                'z-50 min-w-[180px] rounded-xl border border-slate-800',
                                'bg-slate-900 p-1 shadow-modal',
                                'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
                                'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                                'origin-top-right',
                            )}
                        >
                            <DropdownMenu.Item asChild>
                                <Link
                                    href="/app/profile"
                                    className={cn(
                                        'flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2',
                                        'text-sm text-slate-300',
                                        'hover:bg-slate-800 hover:text-white',
                                        'focus-visible:outline-none focus-visible:bg-slate-800',
                                        'transition-colors',
                                    )}
                                >
                                    <User size={15} aria-hidden="true" />
                                    Profile
                                </Link>
                            </DropdownMenu.Item>

                            <DropdownMenu.Separator className="my-1 h-px bg-slate-800" />

                            <DropdownMenu.Item asChild>
                                <button
                                    onClick={onSignOut}
                                    className={cn(
                                        'flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2',
                                        'text-sm text-slate-300',
                                        'hover:bg-slate-800 hover:text-rose-400',
                                        'focus-visible:outline-none focus-visible:bg-slate-800',
                                        'transition-colors',
                                    )}
                                >
                                    <LogOut size={15} aria-hidden="true" />
                                    Sign out
                                </button>
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>
            </div>
        </header>
    );
}

// ── AppShell ───────────────────────────────────────────────────────────────────

import type { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export type ContentWidth = 'narrow' | 'wide';

interface AppShellProps {
    children: ReactNode;
    userEmail: string;
    plan: PlanTier | null;
    isSubscribed: boolean;
    /** narrow = max-w-3xl (forms), wide = max-w-5xl (lists/dashboard). Default: wide */
    contentWidth?: ContentWidth;
}

/**
 * AppShell — the outermost authenticated layout wrapper.
 * Renders: sticky TopBar + desktop Sidebar + mobile BottomNav + scrollable content area.
 *
 * contentWidth is intentionally a layout-level prop so individual pages can
 * override via PageHeader or a wrapper if needed; the shell default is 'wide'.
 */
export function AppShell({
    children,
    userEmail,
    plan,
    isSubscribed,
    contentWidth = 'wide',
}: AppShellProps) {
    const router = useRouter();
    const supabase = createClient();

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    }

    return (
        <div className="min-h-screen bg-slate-950">
            {/* ── Sticky top bar ───────────────────────────── */}
            <TopBar userEmail={userEmail} plan={plan} isSubscribed={isSubscribed} onSignOut={handleSignOut} />

            {/* ── Desktop sidebar ──────────────────────────── */}
            <Sidebar />

            {/* ── Main scroll area ─────────────────────────── */}
            {/*
             * pt-14  — clears fixed top bar (h-14)
             * md:ml-56 — clears fixed sidebar (w-56)
             * pb for BottomNav on mobile: h-16 nav + safe-area (approximated as 4 for static, real value via CSS)
             */}
            <main
                className={cn(
                    'pt-14 md:ml-56',
                    // bottom padding on mobile = bottom-nav height (4rem) + extra
                    'pb-24 md:pb-8',
                    // Horizontal padding responsive
                    'px-4 md:px-6 lg:px-8',
                )}
            >
                <div
                    className={cn(
                        'mx-auto w-full py-6',
                        contentWidth === 'narrow' ? 'max-w-3xl' : 'max-w-5xl',
                    )}
                >
                    <PageTransition>{children}</PageTransition>
                </div>
            </main>

            {/* ── Mobile bottom nav ────────────────────────── */}
            <BottomNav />
        </div>
    );
}
