'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Quote page error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#0B0F19] px-4 py-10">
            <div className="mx-auto max-w-2xl">
                <div className="rounded-2xl border border-red-800/50 bg-red-900/20 p-6">
                    <h2 className="text-xl font-bold text-red-200 mb-3">Something went wrong</h2>
                    <p className="text-sm text-red-300 mb-4">
                        {error.message || 'An unexpected error occurred while generating your quote.'}
                    </p>
                    <Button onClick={reset} variant="primary" size="md">
                        Try again
                    </Button>
                </div>
            </div>
        </div>
    );
}
