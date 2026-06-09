'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SheetRoot, SheetContent } from '@/components/ui/Sheet';
import type { PricingPlan } from '@/lib/pricing';
import { PricingCards } from '@/components/pricing/PricingCard';
import { FAQAccordion } from '@/components/landing/FAQAccordion';

interface UpgradeSheetClientProps {
    pricing: PricingPlan;
    currentPlan: string | null;
}

/**
 * On mobile, if ?sheet=1 is present in the URL (set by UsageBanner / limit wall),
 * this component auto-opens the pricing as a bottom Sheet for a native feel.
 * On desktop the Sheet renders as a centred modal but the user sees the full-page
 * layout instead, so we only auto-open on narrow viewports.
 * The full-page layout is always rendered as a fallback (no-JS, desktop, etc.).
 */
export function UpgradeSheetClient({ pricing, currentPlan }: UpgradeSheetClientProps) {
    const searchParams = useSearchParams();
    const sheetParam = searchParams.get('sheet') === '1';

    // Only auto-open on narrow (mobile) viewports
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!sheetParam) return;
        const isMobile = window.matchMedia('(max-width: 639px)').matches;
        if (isMobile) setOpen(true);
    }, [sheetParam]);

    if (!sheetParam) return null;

    return (
        <SheetRoot open={open} onOpenChange={setOpen}>
            <SheetContent
                title="Upgrade your plan"
                description="Choose a plan to keep generating quotes"
                showClose
                onClose={() => setOpen(false)}
                className="max-h-[92dvh] overflow-y-auto"
            >
                <div className="flex flex-col gap-6 pb-4">
                    <div className="text-center">
                        <p className="text-xs font-semibold uppercase tracking-widest text-teal-400">
                            QuotePro Plans
                        </p>
                        <h2 className="mt-2 text-xl font-bold text-text-primary">
                            You&apos;ve reached your free limit
                        </h2>
                        <p className="mt-1 text-sm text-text-secondary">
                            Upgrade to keep generating quotes in {pricing.starter.currency}.
                        </p>
                    </div>

                    {/* Pricing cards inside the sheet */}
                    <PricingCards pricing={pricing} currentPlan={currentPlan} isPublic={false} />

                    {/* Compact FAQ inside sheet */}
                    <FAQAccordion className="py-2" />
                </div>
            </SheetContent>
        </SheetRoot>
    );
}
