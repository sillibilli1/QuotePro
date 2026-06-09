'use client';

import { type FormEvent, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CheckInboxScreen } from './CheckInboxScreen';

// ── State machine ─────────────────────────────────────────────────────────────
type FormState = 'idle' | 'loading' | 'sent' | 'error';

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * Magic-link auth form.
 * States: idle → loading → sent (shows CheckInboxScreen) | error (shows inline error)
 * All Supabase signInWithOtp calls live here; CheckInboxScreen only handles UI/timer.
 */
export function MagicLinkForm() {
    const supabase = createClient();

    const [formState, setFormState] = useState<FormState>('idle');
    const [email, setEmail] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // ── Core OTP helper — reused for first send + resend ────────────────────
    async function dispatchOtp(emailValue: string): Promise<void> {
        const { error } = await supabase.auth.signInWithOtp({
            email: emailValue,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) throw error;
    }

    // ── Submit handler ────────────────────────────────────────────────────────
    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!email.trim()) return;

        setFormState('loading');
        setErrorMsg('');

        try {
            await dispatchOtp(email.trim());
            setFormState('sent');
        } catch {
            setErrorMsg('Something went wrong. Please try again.');
            setFormState('error');
        }
    }

    // ── Resend — called by CheckInboxScreen ───────────────────────────────────
    async function handleResend() {
        await dispatchOtp(email.trim());
        // CheckInboxScreen resets its own countdown; we stay in 'sent' state
    }

    // ── Sent state → show confirmation screen ────────────────────────────────
    if (formState === 'sent') {
        return <CheckInboxScreen email={email.trim()} onResend={handleResend} />;
    }

    // ── Email entry form ──────────────────────────────────────────────────────
    const hasError = formState === 'error';

    return (
        <form
            onSubmit={(e) => void handleSubmit(e)}
            className="flex flex-col gap-4"
            noValidate
        >
            <Input
                label="Email address"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                    if (hasError) setFormState('idle');
                }}
                placeholder="you@company.com"
                required
                error={hasError ? errorMsg : undefined}
                // class added for mobile: ensures full-width with adequate touch padding
                className="py-3 px-4 h-auto"
            />

            <Button
                type="submit"
                loading={formState === 'loading'}
                size="lg"
                fullWidthMobile
                className="w-full"
            >
                Continue with email
            </Button>

            <p className="text-center text-xs text-text-tertiary">
                We&apos;ll send a one-time magic link — no password needed.
            </p>
        </form>
    );
}
