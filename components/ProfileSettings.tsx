'use client';

import { type FormEvent, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, Crown, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ToastContainer, useToasts } from '@/components/ui/Toast';
import { LogoUpload } from '@/components/LogoUpload';
import type { Database, PlanTier, ProfileFormValues, BankDetails } from '@/types';

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
    userId: string;
    currentLogoUrl: string | null;
}

/**
 * ProfileSettings — sectioned settings UI for /app/profile.
 * Sections: Personal | Company | Plan
 * Save logic is identical to ProfileForm — only the UI is restructured.
 */
export function ProfileSettings({ initialValues, userEmail, plan, isSubscribed, userId, currentLogoUrl }: ProfileSettingsProps) {
    const supabase = createClient();
    const router = useRouter();
    const { toasts, addToast, removeToast } = useToasts();

    const [values, setValues] = useState<ProfileFormValues>(initialValues);
    const [bankDetails, setBankDetails] = useState('');
    const [trn, setTrn] = useState('');
    const [bankDetailsStructured, setBankDetailsStructured] = useState<BankDetails>({
        bank_name: '',
        account_name: '',
        account_number: '',
        iban: '',
        swift_code: '',
        branch: '',
        currency: 'AED',
    });
    const [logoUrl, setLogoUrl] = useState(currentLogoUrl);
    const [saving, setSaving] = useState(false);
    const [loadingBankDetails, setLoadingBankDetails] = useState(true);

    // STRICT CHECK: If not subscribed, always show 'free' regardless of plan column
    const normalizedPlan: PlanTier = isSubscribed && ['starter', 'growth'].includes(plan.toLowerCase())
        ? (plan.toLowerCase() as PlanTier)
        : 'free';

    // Load bank details and TRN on mount
    useEffect(() => {
        (async () => {
            const { data } = await supabase
                .from('profiles')
                .select('bank_details, bank_details_structured, trn')
                .eq('id', userId)
                .single();
            if (data) {
                setBankDetails((data as any).bank_details ?? '');
                setTrn((data as any).trn ?? '');
                if ((data as any).bank_details_structured) {
                    setBankDetailsStructured((data as any).bank_details_structured as BankDetails);
                }
            }
            setLoadingBankDetails(false);
        })();
    }, [supabase, userId]);

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

        // Build legacy bank_details text from structured data
        const legacyBankDetails = bankDetailsStructured.bank_name
            ? `Bank Name: ${bankDetailsStructured.bank_name}\nAccount Name: ${bankDetailsStructured.account_name}\nAccount Number: ${bankDetailsStructured.account_number}${bankDetailsStructured.iban ? `\nIBAN: ${bankDetailsStructured.iban}` : ''}${bankDetailsStructured.swift_code ? `\nSwift Code: ${bankDetailsStructured.swift_code}` : ''}${bankDetailsStructured.branch ? `\nBranch: ${bankDetailsStructured.branch}` : ''}\nCurrency: ${bankDetailsStructured.currency}`
            : null;

        const profilePayload: any = {
            id: user.id,
            email: user.email ?? userEmail,
            full_name: values.full_name,
            company_name: values.company_name,
            phone: values.phone,
            bank_details: legacyBankDetails,
            bank_details_structured: bankDetailsStructured.bank_name ? bankDetailsStructured : null,
            trn: trn || null,
            updated_at: new Date().toISOString(),
        };

        const { error: upsertError } = await (supabase as any)
            .from('profiles')
            .upsert([profilePayload]);

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
                    <CardBody className="flex flex-col gap-4">
                        <LogoUpload
                            userId={userId}
                            currentLogoUrl={logoUrl}
                            onLogoUpdated={(url) => {
                                setLogoUrl(url);
                                router.refresh();
                            }}
                        />
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
                        <div>
                            <Input
                                label="Tax Registration Number (TRN)"
                                type="text"
                                value={trn}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 15);
                                    setTrn(value);
                                }}
                                placeholder="123456789012345"
                                maxLength={15}
                                hint="Required for UAE tax invoices. 15-digit number from your TRN certificate."
                                className="py-3 px-4 h-auto font-mono"
                            />
                        </div>
                    </CardBody>
                </Card>

                {/* ── Bank Details section ───────────────────────────────────── */}
                <Card>
                    <CardHeader>
                        <h2 className="type-h3 text-text-primary">Bank Details</h2>
                        <p className="text-xs text-text-secondary">
                            Bank information displayed on invoices for payment processing.
                        </p>
                    </CardHeader>
                    <CardBody className="flex flex-col gap-4">
                        <Input
                            label="Bank Name"
                            type="text"
                            value={bankDetailsStructured.bank_name}
                            onChange={(e) =>
                                setBankDetailsStructured((v) => ({ ...v, bank_name: e.target.value }))
                            }
                            placeholder="Emirates NBD"
                            required={!!bankDetailsStructured.account_number}
                            disabled={loadingBankDetails}
                            className="py-3 px-4 h-auto"
                        />
                        <Input
                            label="Account Name"
                            type="text"
                            value={bankDetailsStructured.account_name}
                            onChange={(e) =>
                                setBankDetailsStructured((v) => ({ ...v, account_name: e.target.value }))
                            }
                            placeholder="As shown on bank statement"
                            required={!!bankDetailsStructured.account_number}
                            disabled={loadingBankDetails}
                            className="py-3 px-4 h-auto"
                        />
                        <Input
                            label="Account Number"
                            type="text"
                            value={bankDetailsStructured.account_number}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9a-zA-Z]/g, '').slice(0, 25);
                                setBankDetailsStructured((v) => ({ ...v, account_number: value }));
                            }}
                            placeholder="1234567890123456"
                            disabled={loadingBankDetails}
                            className="py-3 px-4 h-auto font-mono"
                        />
                        <Input
                            label="IBAN"
                            type="text"
                            value={bankDetailsStructured.iban || ''}
                            onChange={(e) => {
                                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 34);
                                setBankDetailsStructured((v) => ({ ...v, iban: value }));
                            }}
                            placeholder="AE070331234567890123456"
                            hint="Optional. International Bank Account Number for wire transfers."
                            disabled={loadingBankDetails}
                            className="py-3 px-4 h-auto font-mono"
                        />
                        <Input
                            label="Swift Code"
                            type="text"
                            value={bankDetailsStructured.swift_code || ''}
                            onChange={(e) => {
                                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
                                setBankDetailsStructured((v) => ({ ...v, swift_code: value }));
                            }}
                            placeholder="EBILAEAD"
                            hint="Optional. For international payments (8 or 11 characters)."
                            disabled={loadingBankDetails}
                            className="py-3 px-4 h-auto font-mono"
                        />
                        <Input
                            label="Branch"
                            type="text"
                            value={bankDetailsStructured.branch || ''}
                            onChange={(e) =>
                                setBankDetailsStructured((v) => ({ ...v, branch: e.target.value }))
                            }
                            placeholder="Dubai Mall Branch"
                            hint="Optional."
                            disabled={loadingBankDetails}
                            className="py-3 px-4 h-auto"
                        />
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Currency
                            </label>
                            <select
                                value={bankDetailsStructured.currency}
                                onChange={(e) =>
                                    setBankDetailsStructured((v) => ({ ...v, currency: e.target.value }))
                                }
                                disabled={loadingBankDetails}
                                className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                            >
                                <option value="AED">AED (UAE Dirham)</option>
                                <option value="USD">USD (US Dollar)</option>
                                <option value="EUR">EUR (Euro)</option>
                                <option value="GBP">GBP (British Pound)</option>
                                <option value="SAR">SAR (Saudi Riyal)</option>
                            </select>
                        </div>
                        <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                            <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-slate-300">
                                These details will appear on all invoices you generate.
                            </p>
                        </div>
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
