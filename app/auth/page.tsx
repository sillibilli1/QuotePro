import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardBody } from '@/components/ui/Card';
import { GoogleAuthForm } from '@/components/auth/GoogleAuthForm';

export const metadata = {
    title: 'Sign in — QuotePro',
    description: 'Sign in or create your QuotePro account with Google.',
};

/**
 * /auth — Google OAuth sign-in page.
 * Layout: full-height soft-gradient background, centered Card, logo above form.
 * Auth logic lives in GoogleAuthForm; this page is pure shell.
 */
export default async function AuthPage() {
    // Redirect already-authenticated users straight to the app
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect('/app/dashboard');

    return (
        /*
         * Soft gradient background — uses the Phase-A CSS token --bg (#FAFAFA)
         * overlaid with a subtle teal radial glow for visual continuity with landing.
         */
        <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-[#FAFAFA]">
            {/* Ambient teal glow — purely decorative */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 -z-10"
                style={{
                    background:
                        'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(13,148,136,0.10) 0%, transparent 70%)',
                }}
            />

            <div className="w-full max-w-[400px] space-y-8">
                {/* ── Logo ──────────────────────────────────────────────────── */}
                <div className="flex flex-col items-center gap-2 text-center">
                    <span
                        className="text-2xl font-bold tracking-tight text-[#18181B]"
                        aria-label="QuotePro"
                    >
                        Quote<span className="text-teal-600">Pro</span>
                    </span>
                    <p className="text-sm text-[#52525B]">
                        AI-powered quotes for UAE contractors
                    </p>
                </div>

                {/* ── Auth Card ─────────────────────────────────────────────── */}
                <Card className="shadow-pop">
                    <CardBody className="p-6 sm:p-8">
                        {/* Card heading */}
                        <div className="mb-6 space-y-1">
                            <h1 className="type-h2 text-text-primary">Sign in</h1>
                            <p className="text-sm text-text-secondary">
                                Sign in or create your account with Google.
                            </p>
                        </div>

                        {/* Google OAuth form */}
                        <GoogleAuthForm />
                    </CardBody>
                </Card>

                {/* ── Footer note ───────────────────────────────────────────── */}
                <p className="text-center text-xs text-[#A1A1AA]">
                    By continuing you agree to our{' '}
                    <a
                        href="/terms"
                        className="font-medium text-teal-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 rounded"
                    >
                        Terms
                    </a>{' '}
                    and{' '}
                    <a
                        href="/privacy"
                        className="font-medium text-teal-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 rounded"
                    >
                        Privacy Policy
                    </a>
                    .
                </p>
            </div>
        </main>
    );
}
