'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { RotateCcw, Home } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        console.error('Quote page error:', error);
        // Clear potentially corrupted sessionStorage
        try {
            sessionStorage.removeItem('qp_quote_draft');
        } catch (e) {
            console.error('Failed to clear sessionStorage:', e);
        }
    }, [error]);

    const handleReset = () => {
        try {
            sessionStorage.removeItem('qp_quote_draft');
        } catch (e) {
            console.error('Failed to clear sessionStorage:', e);
        }
        reset();
    };

    return (
        <div className="min-h-screen bg-[#0B0F19] px-4 py-10">
            <div className="mx-auto max-w-2xl">
                <div className="rounded-2xl border border-red-800/50 bg-red-900/20 p-6 md:p-8">
                    <h2 className="text-xl font-bold text-red-200 mb-3">Something went wrong</h2>
                    <p className="text-sm text-red-300/90 mb-6">
                        The page encountered an error. This may have been caused by corrupted browser state.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button onClick={handleReset} variant="primary" size="md" className="flex-1">
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset & Try Again
                        </Button>
                        <Button onClick={() => router.push('/app/dashboard')} variant="secondary" size="md">
                            <Home className="mr-2 h-4 w-4" />
                            Go to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
