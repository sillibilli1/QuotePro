'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { UpgradeModal } from '@/components/UpgradeModal';
import { UsageBanner } from '@/components/UsageBanner';
import { PROJECT_TYPES } from '@/types';
import type {
    GeneratedQuoteData,
    QuoteGenerateRequest,
    QuoteGenerateResponse,
    QuoteGenerateSuccessResponse,
    QuoteFormValues,
} from '@/types';
import { quoteFormSchema } from '@/types';

function formatCurrency(value: number, currencyCode: string) {
    return new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

type GeneratedQuoteResult = {
    quoteId: string;
    quoteData: GeneratedQuoteData;
};

type UsageResponse = {
    count: number;
    limit: number;
    remaining: number;
    is_limit_reached: boolean;
    currency_code?: string;
};

const PROJECT_TYPE_OPTIONS = PROJECT_TYPES.map((pt) => ({ value: pt, label: pt }));

export function QuoteForm() {
    const [generatedQuote, setGeneratedQuote] = useState<GeneratedQuoteResult | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [usage, setUsage] = useState<UsageResponse | null>(null);
    const [isUsageLoading, setIsUsageLoading] = useState(true);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const currencyCode = usage?.currency_code ?? 'AED';

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        control,
        formState: { errors, isSubmitting },
    } = useForm<QuoteFormValues>({
        resolver: zodResolver(quoteFormSchema),
        defaultValues: {
            project_type: '',
            brief_text: '',
            client_name: '',
            client_company: '',
            approximate_value_aed: '',
        },
    });

    useEffect(() => {
        let isMounted = true;

        async function loadUsage() {
            setIsUsageLoading(true);

            try {
                const response = await fetch('/api/quotes/usage', {
                    method: 'GET',
                    cache: 'no-store',
                });
                const result = (await response.json().catch(() => null)) as UsageResponse | null;

                if (!response.ok || !result) {
                    throw new Error('Unable to load quote usage.');
                }

                if (isMounted) {
                    setUsage(result);
                    setIsUpgradeModalOpen(result.is_limit_reached);
                }
            } catch {
                if (isMounted) {
                    setFormError('Unable to load quote usage. Please refresh the page.');
                }
            } finally {
                if (isMounted) {
                    setIsUsageLoading(false);
                }
            }
        }

        void loadUsage();

        return () => {
            isMounted = false;
        };
    }, []);

    async function onSubmit(values: QuoteFormValues) {
        setFormError(null);
        setGeneratedQuote(null);
        clearErrors();

        if (values.project_type === '') {
            setError('project_type', {
                type: 'manual',
                message: 'Project type is required.',
            });
            return;
        }

        const payload: QuoteGenerateRequest = {
            project_type: values.project_type,
            brief_text: values.brief_text.trim(),
            client_name: values.client_name.trim(),
            client_company: values.client_company.trim() || null,
            approximate_value_aed: values.approximate_value_aed.trim()
                ? Number(values.approximate_value_aed.trim())
                : null,
        };

        try {
            const response = await fetch('/api/quotes/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = (await response.json().catch(() => null)) as QuoteGenerateResponse | null;

            if (!result) {
                setFormError('Unable to generate quote. Please try again or contact support.');
                return;
            }

            if (!result.success) {
                if (result.field && result.field !== 'form') {
                    setError(result.field, {
                        type: 'server',
                        message: result.error,
                    });
                    return;
                }

                const limitReachedResponse = result as QuoteGenerateResponse & {
                    error?: string;
                    message?: string;
                };

                if (limitReachedResponse.error === 'limit_reached') {
                    setFormError(limitReachedResponse.message ?? result.error);
                    setIsUpgradeModalOpen(true);
                    setUsage((currentUsage) => currentUsage
                        ? { ...currentUsage, remaining: 0, is_limit_reached: true, count: currentUsage.limit }
                        : currentUsage);
                    return;
                }

                setFormError(result.error);
                return;
            }

            if (!response.ok) {
                setFormError('Unable to generate quote. Please try again or contact support.');
                return;
            }

            const successResult = result as QuoteGenerateSuccessResponse;
            // Day 8: No quote_id anymore, quotes aren't saved until confirm
            setGeneratedQuote({
                quoteId: '', // Empty since nothing is saved yet
                quoteData: successResult.quote_data,
            });
            setUsage((currentUsage) => {
                if (!currentUsage) {
                    return currentUsage;
                }

                const nextCount = Math.min(currentUsage.count + 1, currentUsage.limit);
                const nextRemaining = Math.max(currentUsage.limit - nextCount, 0);

                return {
                    ...currentUsage,
                    count: nextCount,
                    remaining: nextRemaining,
                    is_limit_reached: nextCount >= currentUsage.limit,
                };
            });
        } catch {
            setFormError('Unable to generate quote. Please try again or contact support.');
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
            />

            {!isUsageLoading && usage ? (
                <UsageBanner
                    count={usage.count}
                    limit={usage.limit}
                    remaining={usage.remaining}
                    isLimitReached={usage.is_limit_reached}
                />
            ) : null}

            <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-soft md:p-8">
                <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate aria-busy={isSubmitting}>
                    {/* Project Type — Radix Select via Controller */}
                    <Controller
                        name="project_type"
                        control={control}
                        render={({ field }: { field: { value: string; onChange: (v: string) => void } }) => (
                            <Select
                                label="Project Type"
                                placeholder="Select project type"
                                options={PROJECT_TYPE_OPTIONS}
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={isSubmitting}
                                error={errors.project_type?.message}
                            />
                        )}
                    />

                    <Textarea
                        label="Project Brief"
                        id="project-brief"
                        rows={4}
                        required
                        placeholder="Describe the work... e.g. Villa AC installation for 4-bedroom home including materials and labor"
                        error={errors.brief_text?.message}
                        disabled={isSubmitting}
                        {...register('brief_text')}
                    />

                    <Input
                        label="Client Name"
                        placeholder="Client full name"
                        autoComplete="name"
                        error={errors.client_name?.message}
                        disabled={isSubmitting}
                        {...register('client_name')}
                    />

                    <Input
                        label="Client Company"
                        placeholder="Client company name"
                        autoComplete="organization"
                        error={errors.client_company?.message}
                        disabled={isSubmitting}
                        {...register('client_company')}
                    />

                    <Input
                        label={`Approximate value (${currencyCode})`}
                        type="number"
                        inputMode="decimal"
                        min="0.01"
                        step="0.01"
                        placeholder="e.g. 35000"
                        error={errors.approximate_value_aed?.message}
                        disabled={isSubmitting}
                        {...register('approximate_value_aed')}
                    />

                    {formError ? (
                        <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                            {formError}
                        </p>
                    ) : null}

                    {isSubmitting ? <LoadingSpinner /> : null}

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidthMobile
                        loading={isSubmitting}
                        disabled={isSubmitting || usage?.is_limit_reached}
                    >
                        {usage?.is_limit_reached ? 'Monthly Limit Reached' : 'Generate Quote'}
                    </Button>
                </form>
            </section>

            {generatedQuote ? (
                <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-soft md:p-8">
                    <div className="flex flex-col gap-2 border-b border-slate-800 pb-5">
                        <p className="text-sm uppercase tracking-[0.2em] text-brand-light">Generated quote</p>
                        <p className="text-sm text-slate-400">Review the AI-generated draft below before sending or exporting it later.</p>
                        <h2 className="text-2xl font-semibold text-white">{generatedQuote.quoteData.project_title}</h2>
                        <p className="text-sm text-slate-300">
                            Quote ID: <span className="font-medium text-white">{generatedQuote.quoteId}</span>
                        </p>
                        <p className="text-sm text-slate-300">
                            Client: <span className="font-medium text-white">{generatedQuote.quoteData.client_name}</span>
                            {generatedQuote.quoteData.client_company
                                ? `, ${generatedQuote.quoteData.client_company}`
                                : ''}
                        </p>
                    </div>

                    <div className="mt-6 overflow-x-auto">
                        <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm text-slate-200">
                            <thead>
                                <tr className="text-slate-400">
                                    <th className="pr-4 font-medium">#</th>
                                    <th className="pr-4 font-medium">Description</th>
                                    <th className="pr-4 font-medium">Unit</th>
                                    <th className="pr-4 font-medium">Qty</th>
                                    <th className="pr-4 font-medium">Rate</th>
                                    <th className="font-medium">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {generatedQuote.quoteData.line_items.map((item) => (
                                    <tr key={item.item_number} className="align-top">
                                        <td className="pr-4 text-slate-400">{item.item_number}</td>
                                        <td className="pr-4 text-white">{item.description}</td>
                                        <td className="pr-4">{item.unit}</td>
                                        <td className="pr-4">{item.quantity}</td>
                                        <td className="pr-4">{formatCurrency(item.unit_rate_aed, currencyCode)}</td>
                                        <td>{formatCurrency(item.subtotal_aed, currencyCode)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
                            <p>
                                <span className="font-medium text-white">Payment terms:</span>{' '}
                                {generatedQuote.quoteData.payment_terms}
                            </p>
                            <p>
                                <span className="font-medium text-white">Validity:</span>{' '}
                                {generatedQuote.quoteData.validity_days} days
                            </p>
                            <p>
                                <span className="font-medium text-white">Estimated duration:</span>{' '}
                                {generatedQuote.quoteData.estimated_duration}
                            </p>
                            {generatedQuote.quoteData.notes ? (
                                <p>
                                    <span className="font-medium text-white">Notes:</span>{' '}
                                    {generatedQuote.quoteData.notes}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-3 rounded-2xl border border-brand/20 bg-brand/5 p-4 text-sm text-slate-200">
                            <div className="flex items-center justify-between gap-4">
                                <span>Subtotal</span>
                                <span className="font-medium text-white">
                                    {formatCurrency(generatedQuote.quoteData.subtotal_aed, currencyCode)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span>VAT (5%)</span>
                                <span className="font-medium text-white">
                                    {formatCurrency(generatedQuote.quoteData.vat_5_percent_aed, currencyCode)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-t border-brand/20 pt-3 text-base">
                                <span className="font-semibold text-white">Total</span>
                                <span className="font-semibold text-white">
                                    {formatCurrency(generatedQuote.quoteData.total_aed, currencyCode)}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            ) : null}
        </div>
    );
}
