'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, useToasts } from '@/components/ui/Toast';

interface UpgradeSuccessToastProps {
    plan: string;
}

/**
 * Shows a success toast when ?upgrade=success is in the URL, then cleans up
 * the query param so a refresh doesn't re-show it.
 * Now uses Phase-B ToastContainer for consistent styling + 3 s auto-dismiss.
 */
export function UpgradeSuccessToast({ plan }: UpgradeSuccessToastProps) {
    const router = useRouter();
    const { toasts, addToast, removeToast } = useToasts();

    const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);

    useEffect(() => {
        // Clean ?upgrade=success&plan=... from the URL without a hard reload
        const url = new URL(window.location.href);
        url.searchParams.delete('upgrade');
        url.searchParams.delete('plan');
        router.replace(url.pathname + (url.search || ''), { scroll: false });

        addToast(`Welcome to ${planLabel}! Your account has been upgraded.`, 'success');
        // addToast is stable (useCallback) — safe to include
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <ToastContainer toasts={toasts} onClose={removeToast} />;
}
