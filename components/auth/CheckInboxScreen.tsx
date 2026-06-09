'use client';

import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';

const COOLDOWN_SECONDS = 30;

interface CheckInboxScreenProps {
    /** The email address the magic link was sent to */
    email: string;
    /** Called when the user clicks "Resend email" — caller owns the OTP call */
    onResend: () => Promise<void>;
}

/**
 * Confirmation screen shown after signInWithOtp succeeds.
 * Displays the entered email and a 30-second resend cooldown.
 */
export function CheckInboxScreen({ email, onResend }: CheckInboxScreenProps) {
    const [countdown, setCountdown] = useState(COOLDOWN_SECONDS);
    const [resending, setResending] = useState(false);

    // Tick countdown down to 0
    useEffect(() => {
        if (countdown <= 0) return;
        const id = setInterval(() => setCountdown((c) => c - 1), 1000);
        return () => clearInterval(id);
    }, [countdown]);

    async function handleResend() {
        setResending(true);
        try {
            await onResend();
        } catch {
            // Silent — MagicLinkForm surfaces any persistent error
        } finally {
            setCountdown(COOLDOWN_SECONDS);
            setResending(false);
        }
    }

    return (
        <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="flex flex-col items-center gap-6 py-2 text-center"
        >
            {/* Mail icon badge */}
            <div
                aria-hidden="true"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50"
            >
                <Mail className="h-7 w-7 text-teal-600" strokeWidth={1.75} />
            </div>

            {/* Heading + description */}
            <div className="space-y-2">
                <h2 className="type-h2 text-text-primary">Check your inbox</h2>
                <p className="text-sm leading-relaxed text-text-secondary">
                    We sent a magic link to{' '}
                    <span className="font-semibold text-text-primary break-all">{email}</span>.
                    <br />
                    Click it to sign in — no password needed.
                </p>
            </div>

            {/* Resend area */}
            <div className="flex items-center gap-1.5 text-sm text-text-tertiary">
                {countdown > 0 ? (
                    <>
                        <span>Resend available in</span>
                        <span
                            className="tabular-nums font-medium text-text-secondary"
                            aria-label={`${countdown} seconds`}
                        >
                            {countdown}s
                        </span>
                    </>
                ) : (
                    <>
                        <span>Didn&apos;t receive it?</span>
                        <button
                            type="button"
                            onClick={() => void handleResend()}
                            disabled={resending}
                            className={[
                                'font-semibold text-teal-600 underline-offset-2',
                                'hover:text-teal-700 hover:underline',
                                'focus-visible:outline-none focus-visible:ring-2',
                                'focus-visible:ring-teal-500 focus-visible:ring-offset-1 rounded',
                                'disabled:cursor-not-allowed disabled:opacity-50',
                                // no motion-reduce needed — no animation on this button
                            ].join(' ')}
                        >
                            {resending ? 'Sending…' : 'Resend email'}
                        </button>
                    </>
                )}
            </div>

            {/* Spam notice */}
            <p className="text-xs text-text-tertiary">
                Can&apos;t find it? Check your spam folder.
            </p>
        </div>
    );
}
