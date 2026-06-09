// Server Component — geo detection runs server-side, no client-side API calls
import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPricing } from '@/lib/pricing';
import { createClient } from '@/lib/supabase/server';

// Landing section components
import { LandingHero } from '@/components/landing/LandingHero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { SocialProof } from '@/components/landing/SocialProof';
import { FAQAccordion } from '@/components/landing/FAQAccordion';
import { Footer } from '@/components/landing/Footer';

export default async function LandingPage() {
    // Redirect authenticated users straight to the dashboard
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect('/app/dashboard');

    // ── Geo detection (server-side only, no API call on every load) ───────────
    // Priority 1: CloudFlare CF-IPCountry header (set by CF edge, instant, no quota)
    const headersList = headers();
    const cfCountry = headersList.get('cf-ipcountry');

    // Priority 2: qp_country cookie (set by middleware for 24 h caching)
    const cookieStore = cookies();
    const cookieCountry = cookieStore.get('qp_country')?.value;

    // Priority 3: fall back to 'AE' — safe default for UAE-focused product
    const countryCode =
        cfCountry && cfCountry !== 'XX' && cfCountry.length === 2
            ? cfCountry.toUpperCase()
            : cookieCountry ?? 'AE';

    const pricing = getPricing(countryCode);

    return (
        <main className="overflow-x-hidden">
            {/* HERO */}
            <LandingHero />

            {/* HOW IT WORKS */}
            <HowItWorks />

            {/* FEATURES */}
            <FeaturesSection />

            {/* PRICING — prices always come from getPricing(), never hardcoded */}
            <PricingSection pricing={pricing} />

            {/* SOCIAL PROOF */}
            <SocialProof />

            {/* FAQ */}
            <FAQAccordion className="bg-slate-900" />

            {/* FOOTER */}
            <Footer />
        </main>
    );
}
