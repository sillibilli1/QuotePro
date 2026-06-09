'use client';

import { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { ToastContainer, useToasts } from '@/components/ui/Toast';
import type { QuoteShareResponse } from '@/types';

type ShareButtonsProps = {
    quoteId: string;
    clientName?: string | null;
    companyName?: string | null;
};

function getSafeClientName(clientName?: string | null) {
    return clientName?.trim() || 'there';
}

function getSafeCompanyName(companyName?: string | null) {
    return companyName?.trim() || 'our company';
}

export function ShareButtons({ quoteId, clientName, companyName }: ShareButtonsProps) {
    const { toasts, addToast, removeToast } = useToasts();

    const shareMessagePrefix = useMemo(() => {
        return `Hi ${getSafeClientName(clientName)}, here's your quote from ${getSafeCompanyName(companyName)}:`;
    }, [clientName, companyName]);

    const getShareUrl = useCallback(async () => {
        const response = await fetch(`/api/quotes/${quoteId}/share`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        const result = (await response.json().catch(() => null)) as QuoteShareResponse | null;

        if (!response.ok || !result?.success || !result.share_url) {
            throw new Error('Something went wrong. Please try again.');
        }

        return result.share_url;
    }, [quoteId]);

    const handleWhatsAppShare = useCallback(async () => {
        try {
            const shareUrl = await getShareUrl();
            const message = `${shareMessagePrefix} ${shareUrl}`;
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            addToast('WhatsApp opened with your quote link.', 'success');
        } catch {
            addToast('Something went wrong. Please try again.', 'error');
        }
    }, [getShareUrl, shareMessagePrefix, addToast]);

    const handleCopyLink = useCallback(async () => {
        try {
            const shareUrl = await getShareUrl();
            await navigator.clipboard.writeText(shareUrl);
            addToast('Link copied to clipboard.', 'success');
        } catch {
            addToast('Something went wrong. Please try again.', 'error');
        }
    }, [getShareUrl, addToast]);

    return (
        <>
            {/* Toast stack — Phase-B, bottom-center, 3 s auto-dismiss */}
            <ToastContainer toasts={toasts} onClose={removeToast} />

            <div className="grid gap-3 sm:grid-cols-2">
                <Button
                    variant="primary"
                    size="lg"
                    fullWidthMobile
                    onClick={() => void handleWhatsAppShare()}
                >
                    Share via WhatsApp
                </Button>

                <Button
                    variant="secondary"
                    size="lg"
                    fullWidthMobile
                    onClick={() => void handleCopyLink()}
                    className="border-slate-700 bg-transparent text-slate-100 hover:border-slate-500 hover:bg-slate-900"
                >
                    Copy Link
                </Button>
            </div>
        </>
    );
}
