'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Briefcase, Truck, Star, Wrench, Building2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { UpgradeModal } from '@/components/UpgradeModal';
import { GenerationLoader } from '@/components/quotes/GenerationLoader';
import { PageHeader } from '@/components/layout/PageHeader';
import { QuotePreview } from '@/components/QuotePreview';
import { useQuoteDraft } from '@/lib/useQuoteDraft';
import { PROJECT_TYPES } from '@/types';
import type {
    QuoteGenerateRequest,
    QuoteGenerateResponse,
    QuoteFormValues,
    QuoteDraftContext,
    QuoteReviseResponse,
} from '@/types';
import { quoteFormSchema } from '@/types';

// ── Icon map ────────────────────────────────────────────────────────────────
const PROJECT_TYPE_ICONS: Record<string, React.ReactNode> = {
    Maintenance: <Wrench className="h-4 w-4" aria-hidden="true" />,
    Contracting: <Building2 className="h-4 w-4" aria-hidden="true" />,
    'Interior Design': <Star className="h-4 w-4" aria-hidden="true" />,
    Logistics: <Truck className="h-4 w-4" aria-hidden="true" />,
    Events: <Briefcase className="h-4 w-4" aria-hidden="true" />,
};

const PROJECT_TYPE_OPTIONS = PROJECT_TYPES.map((pt) => ({
    value: pt,
    label: pt,
    icon: PROJECT_TYPE_ICONS[pt],
}));

type UsageResponse = {
    count: number;
    limit: number;
    remaining: number;
    is_limit_reached: boolean;
    currency_code?: string;
};

const BRIEF_MIN = 20;
const BRIEF_MAX = 1000;

// ── Page ─────────────────────────────────────────────────────────────────────
export default function NewQuotePage() {
    return <NewQuotePageContent />;
}

function NewQuotePageContent() {
    const router = useRouter();
    const { session, loading } = useAuth();
    const { draft, actions, revisionsRemaining } = useQuoteDraft();

    const [usage, setUsage] = useState<UsageResponse | null>(null);
    const [isUsageLoading, setIsUsageLoading] = useState(true);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const currencyCode = usage?.currency_code ?? 'AED';
    const firstErrorRef = useRef<HTMLDivElement | null>(null);

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        control,
        watch,
        formState: { errors },
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

    const briefText = watch('brief_text');
    const briefLen = briefText?.length ?? 0;

    const isGenerating = draft.state === 'generating';
    const isRevising = draft.state === 'revising';
    const isSaving = draft.state === 'saving';
    const isPreview = draft.state === 'preview' || draft.state === 'revising';

    // Auth guard
    useEffect(() => {
        if (!loading && !session) {
            router.replace('/');
        }
    }, [loading, router, session]);

    // Load usage
    useEffect(() => {
        let mounted = true;

        async function loadUsage() {
            setIsUsageLoading(true);
            try {
                const res = await fetch('/api/quotes/usage', { method: 'GET', cache: 'no-store' });
                const result = (await res.json().catch(() => null)) as UsageResponse | null;
                if (!res.ok || !result) throw new Error('Unable to load quote usage.');
                if (mounted) {
                    setUsage(result);
                    setIsUpgradeModalOpen(result.is_limit_reached);
                }
            } catch {
                if (mounted) setFormError('Unable to load quote usage. Please refresh the page.');
            } finally {
                if (mounted) setIsUsageLoading(false);
            }
        }

        void loadUsage();
        return () => {
            mounted = false;
        };
    }, []);

    // Scroll to first error
    useEffect(() => {
        if (Object.keys(errors).length > 0 && firstErrorRef.current) {
            firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [errors]);

    async function onSubmit(values: QuoteFormValues) {
        setFormError(null);
        clearErrors();

        if (values.project_type === '') {
            setError('project_type', { type: 'manual', message: 'Project type is required.' });
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

        actions.startGenerate();

        try {
            const res = await fetch('/api/quotes/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = (await res.json().catch(() => null)) as QuoteGenerateResponse | null;

            if (!result) {
                actions.generateFailed('Unable to generate quote. Please try again.');
                setFormError('Unable to generate quote. Please try again.');
                return;
            }

            if (!result.success) {
                if (result.field && result.field !== 'form') {
                    setError(result.field, { type: 'server', message: result.error });
                    actions.generateFailed(result.error);
                    return;
                }
                const limitRes = result as QuoteGenerateResponse & { error?: string; message?: string };
                if (limitRes.error === 'limit_reached') {
                    setFormError(limitRes.message ?? result.error);
                    setIsUpgradeModalOpen(true);
                    setUsage((u) => (u ? { ...u, remaining: 0, is_limit_reached: true, count: u.limit } : u));
                    actions.generateFailed(limitRes.message ?? result.error);
                    return;
                }
                actions.generateFailed(result.error);
                setFormError(result.error);
                return;
            }

            if (!res.ok) {
                actions.generateFailed('Unable to generate quote. Please try again.');
                setFormError('Unable to generate quote. Please try again.');
                return;
            }

            const context: QuoteDraftContext = {
                project_type: payload.project_type,
                brief_text: payload.brief_text,
                client_name: payload.client_name,
                client_company: payload.client_company,
                approx_value: payload.approximate_value_aed,
            };

            actions.generateSuccess(result.quote_data, context);
        } catch {
            actions.generateFailed('Unable to generate quote. Please try again.');
            setFormError('Unable to generate quote. Please try again.');
        }
    }

    async function handleRevise(instruction: string) {
        if (!draft.quote_data || !draft.context) return;

        actions.startRevise(instruction);

        try {
            const res = await fetch('/api/quotes/revise', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quote_data: draft.quote_data,
                    instruction,
                    context: draft.context,
                }),
            });

            const result = (await res.json().catch(() => null)) as QuoteReviseResponse | null;

            if (!result || !result.success) {
                const message = result && 'message' in result ? result.message : "Couldn't apply that change. Try rephrasing.";
                actions.reviseFailed(message);
                return;
            }

            actions.reviseSuccess(result.quote_data);
        } catch {
            actions.reviseFailed('Unable to revise quote. Please try again.');
        }
    }

    async function handleConfirm() {
        actions.startConfirm();
    }

    function handleReset() {
        actions.reset();
        setFormError(null);
        clearErrors();
    }

    // ── Loading / auth guards ────────────────────────────────────────────────
    if (loading) {
        return (
            <main className="min-h-screen bg-slate-950 px-4 py-10">
                <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
                    <LoadingSpinner label="Loading quote builder..." />
                </div>
            </main>
        );
    }

    if (!session) {
        return (
            <main className="min-h-screen bg-slate-950 px-4 py-10">
                <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
                    <LoadingSpinner label="Redirecting to sign in..." />
                </div>
            </main>
        );
    }

    return (
        <>
            <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />

            <main className="min-h-screen bg-slate-950 px-4 pb-28 pt-6 md:pb-16 md:pt-10">
                <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
                    <PageHeader
                        title="New Quote"
                        subtitle="Fill in the details below — QuotePro will generate a UAE-ready quotation with VAT and structured line items."
                    />

                    {/* Show form only when in form or generating state */}
                    {(draft.state === 'form' || draft.state === 'generating') && (
                        <Card className="p-6 md:p-8">
                            <form
                                className="flex flex-col gap-5"
                                onSubmit={handleSubmit(onSubmit)}
                                noValidate
                                aria-busy={isGenerating}
                            >
                                <div ref={errors.project_type ? firstErrorRef : null}>
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
                                                disabled={isGenerating}
                                                error={errors.project_type?.message}
                                            />
                                        )}
                                    />
                                </div>

                                <div ref={errors.brief_text ? firstErrorRef : null}>
                                    <Textarea
                                        label="Project Brief"
                                        id="project-brief"
                                        rows={4}
                                        required
                                        placeholder="Describe the work… e.g. Villa AC installation for 4-bedroom home including materials and labor"
                                        error={errors.brief_text?.message}
                                        disabled={isGenerating}
                                        {...register('brief_text')}
                                    />
                                    <div className="mt-1.5 flex items-center justify-between gap-2">
                                        <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                                            <motion.div
                                                className={briefLen >= BRIEF_MIN ? 'h-full bg-brand' : 'h-full bg-slate-600'}
                                                animate={{ width: `${Math.min((briefLen / BRIEF_MIN) * 100, 100)}%` }}
                                                initial={{ width: '0%' }}
                                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                            />
                                        </div>
                                        <p className={`shrink-0 text-xs tabular-nums ${briefLen >= BRIEF_MIN ? 'text-brand-light' : 'text-slate-500'}`}>
                                            {briefLen}/{BRIEF_MAX}
                                        </p>
                                    </div>
                                </div>

                                <div ref={errors.client_name ? firstErrorRef : null}>
                                    <Input
                                        label="Client Name"
                                        placeholder="Client full name"
                                        autoComplete="name"
                                        error={errors.client_name?.message}
                                        disabled={isGenerating}
                                        {...register('client_name')}
                                    />
                                </div>

                                <Input
                                    label="Client Company"
                                    placeholder="Client company name (optional)"
                                    autoComplete="organization"
                                    error={errors.client_company?.message}
                                    disabled={isGenerating}
                                    {...register('client_company')}
                                />

                                <div ref={errors.approximate_value_aed ? firstErrorRef : null}>
                                    <div className="relative">
                                        <Input
                                            label={`Approximate Value (${currencyCode})`}
                                            type="number"
                                            inputMode="decimal"
                                            min="0.01"
                                            step="0.01"
                                            placeholder="e.g. 35000"
                                            error={errors.approximate_value_aed?.message}
                                            disabled={isGenerating}
                                            className="pl-14"
                                            {...register('approximate_value_aed')}
                                        />
                                        <span className="pointer-events-none absolute bottom-0 left-0 flex h-[42px] items-center rounded-l-xl border-r border-slate-700 bg-slate-800 px-3 text-sm font-medium text-slate-400">
                                            {currencyCode}
                                        </span>
                                    </div>
                                </div>

                                {formError && (
                                    <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                                        {formError}
                                    </p>
                                )}

                                <GenerationLoader active={isGenerating} />

                                <div className="hidden md:block">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        fullWidthMobile
                                        loading={isGenerating}
                                        disabled={isGenerating || usage?.is_limit_reached}
                                        className="w-full"
                                    >
                                        {usage?.is_limit_reached ? 'Monthly Limit Reached' : 'Generate My Quote'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {/* Show preview when quote is generated */}
                    {isPreview && draft.quote_data && draft.context && (
                        <QuotePreview
                            quoteData={draft.quote_data}
                            context={draft.context}
                            revisions={draft.revisions}
                            revisionsRemaining={revisionsRemaining}
                            isRevising={isRevising}
                            isSaving={isSaving}
                            errorMessage={draft.error_message}
                            currencyCode={currencyCode}
                            onRevise={handleRevise}
                            onConfirm={handleConfirm}
                            onReset={handleReset}
                        />
                    )}
                </div>
            </main>

            {/* Mobile sticky action bar - only show in form state */}
            {draft.state === 'form' && (
                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/95 px-4 pb-safe pt-3 backdrop-blur-sm md:hidden">
                    <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        loading={isGenerating}
                        disabled={isGenerating || usage?.is_limit_reached}
                        className="w-full"
                        onClick={() => {
                            void handleSubmit(onSubmit)();
                        }}
                    >
                        {usage?.is_limit_reached ? 'Monthly Limit Reached' : 'Generate My Quote'}
                    </Button>
                </div>
            )}
        </>
    );
}
