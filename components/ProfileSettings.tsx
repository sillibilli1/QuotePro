'use client';

import { type FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, Crown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ToastContainer, useToasts } from '@/components/ui/Toast';
import type { Database, PlanTier, ProfileFormValues } from '@/types';

// ── Plan display helpers ───────────────────────────────────────────────────────
const PLAN_LABEL: Record<PlanTier, string> = {
    free: 'Free',
    starter: 'Starter',
    growth: 'Growth',
};

const PLAN_BADGE_VARIANT: Record<PlanTier, 'default' | 'primary' | 'success'> = {
    free: 'default',
    starter: 'primary',
    growth: 'success',
};

const PLAN_DESCRIPTION: Record<PlanTier, string> = {
    free: 'Up to 3 quotes per month.',
    starter: 'Up to 30 quotes per month · PDF export · Share links',
    growth: 'Unlimited quotes · PDF export · Share links · Priority support',
};

// ── Props ─────────────────────────────────────────────────────────────────────
export interface ProfileSettingsProps {
    initialValues: ProfileFormValues;
    userEmail: string;
    plan: PlanTier;
    isSubscribed: boolean;
}

/**
 * ProfileSettings — sectioned settings UI for /app/profile.
 * Sections: Personal | Company | Plan
 * Save logic is identical to ProfileForm — only the UI is restructured.
 */
export function ProfileSettings({ initialValues, userEmail, plan, isSubscribed }: ProfileSettingsProps) {
    const supabase = createClient();
    const router = useRouter();
    const { toasts, addToast, removeToast } = useToasts();

    const [values, setValues] = useState<ProfileFormValues>(initialValues);
    const [saving, setSaving] = useState(false);

    // STRICT CHECK: If not subscribed, always show 'free' regardless of plan column
    const normalizedPlan: PlanTier = isSubscribed && ['starter', 'growth'].includes(plan.toLowerCase())
        ? (plan.toLowerCase() as PlanTier)
        : 'free';

    // ── Track dirty state so we only show Save when something changed ─────────
    const isDirty =
        values.full_name !== initialValues.full_name ||
        values.company_name !== initialValues.company_name ||
        values.phone !== initialValues.phone;

    // ── Save handler — keeps the exact same Supabase upsert logic ─────────────
    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            addToast('Something went wrong. Please try again.', 'error');
            setSaving(false);
            return;
        }

        const profilePayload: Database['public']['Tables']['profiles']['Insert'] = {
            id: user.id,
            email: user.email ?? userEmail,
            full_name: values.full_name,
            company_name: values.company_name,
            phone: values.phone,
            updated_at: new Date().toISOString(),
        };

        const profileTable = supabase.from('profiles') as unknown as {
            upsert: (
                values: Database['public']['Tables']['profiles']['Insert'][],
            ) => Promise<{ error: { message: string } | null }>;
        };

        const { error: upsertError } = await profileTable.upsert([profilePayload]);

        setSaving(false);

        if (upsertError) {
            addToast('Something went wrong. Please try again.', 'error');
            return;
        }

        addToast('Profile saved successfully.', 'success');
        router.refresh();
    }

    return (
        <>
            {/* Toast stack — bottom-center, 3 s auto-dismiss */}
            <ToastContainer toasts={toasts} onClose={removeToast} />

            <form
                onSubmit={(e) => void handleSubmit(e)}
                className="flex flex-col gap-6"
                aria-label="Account settings"
            >
                {/* ── Personal section ─────────────────────────────────────── */}
                <Card>
                    <CardHeader>
                        <h2 className="type-h3 text-text-primary">Personal</h2>
                        <p className="text-xs text-text-secondary">
                            Your name and contact details.
                        </p>
                    </CardHeader>
                    <CardBody className="flex flex-col gap-4">
                        <Input
                            label="Full name"
                            type="text"
                            autoComplete="name"
                            value={values.full_name}
                            onChange={(e) =>
                                setValues((v) => ({ ...v, full_name: e.target.value }))
                            }
                            placeholder="Ahmed Khan"
                            required
                            className="py-3 px-4 h-auto"
                        />
                        <Input
                            label="Phone"
                            type="tel"
                            autoComplete="tel"
                            value={values.phone}
                            onChange={(e) =>
                                setValues((v) => ({ ...v, phone: e.target.value }))
                            }
                            placeholder="+971 50 123 4567"
                            className="py-3 px-4 h-auto"
                        />
                        {/* Email is read-only — managed by Supabase Auth */}
                        <Input
                            label="Email address"
                            type="email"
                            value={userEmail}
                            readOnly
                            disabled
                            hint="Managed by your sign-in method. Contact support to change."
                            className="py-3 px-4 h-auto"
                        />
                    </CardBody>
                </Card>

                {/* ── Company section ───────────────────────────────────────── */}
                <Card>
                    <CardHeader>
                        <h2 className="type-h3 text-text-primary">Company</h2>
                        <p className="text-xs text-text-secondary">
                            Shown on your generated quotes and PDF exports.
                        </p>
                    </CardHeader>
                    <CardBody>
                        <Input
                            label="Company name"
                            type="text"
                            autoComplete="organization"
                            value={values.company_name}
                            onChange={(e) =>
                                setValues((v) => ({ ...v, company_name: e.target.value }))
                            }
                            placeholder="QuotePro Contracting LLC"
                            required
                            className="py-3 px-4 h-auto"
                        />
                    </CardBody>
                </Card>

                {/* ── Plan section ──────────────────────────────────────────── */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="type-h3 text-text-primary">Plan</h2>
                                <p className="text-xs text-text-secondary">
                                    {PLAN_DESCRIPTION[normalizedPlan]}
                                </p>
                            </div>
                            <Badge variant={PLAN_BADGE_VARIANT[normalizedPlan]}>
                                {PLAN_LABEL[normalizedPlan]}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardBody>
                        {normalizedPlan === 'free' ? (
                            <Link
                                href="/app/upgrade"
                                className={[
                                    'inline-flex min-h-[44px] items-center gap-2 rounded-lg',
                                    'bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white',
                                    'transition hover:bg-teal-700',
                                    'focus-visible:outline-none focus-visible:ring-2',
                                    'focus-visible:ring-teal-500 focus-visible:ring-offset-2',
                                ].join(' ')}
                            >
                                <Crown className="h-4 w-4" aria-hidden="true" />
                                Upgrade plan
                            </Link>
                        ) : (
                            <Link
                                href="/app/upgrade"
                                className={[
                                    'inline-flex min-h-[44px] items-center gap-2 rounded-lg',
                                    'border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary',
                                    'transition hover:bg-surface-subtle',
                                    'focus-visible:outline-none focus-visible:ring-2',
                                    'focus-visible:ring-teal-500 focus-visible:ring-offset-2',
                                ].join(' ')}
                            >
                                Manage subscription
                                <ExternalLink className="h-4 w-4 text-text-tertiary" aria-hidden="true" />
                            </Link>
                        )}
                    </CardBody>
                </Card>

                {/* ── Save bar — only shown when form is dirty ──────────────── */}
                <div
                    className={[
                        'flex items-center justify-end gap-3 rounded-xl border border-border',
                        'bg-surface px-5 py-4 shadow-card',
                        'transition-opacity duration-200',
                        isDirty ? 'opacity-100' : 'opacity-0 pointer-events-none',
                    ].join(' ')}
                    aria-hidden={!isDirty}
                >
                    <p className="flex-1 text-sm text-text-secondary">
                        You have unsaved changes.
                    </p>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setValues(initialValues)}
                    >
                        Discard
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        loading={saving}
                        disabled={!isDirty}
                    >
                        Save changes
                    </Button>
                </div>
            </form>
        </>
    );
}
