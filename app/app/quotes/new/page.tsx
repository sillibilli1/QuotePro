'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Briefcase, Truck, Star, Wrench, Building2, Wind, Hammer, Monitor, Sparkles, ArrowRight } from 'lucide-react';
import { quoteTemplates } from '@/lib/quote-templates';
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
import { CURRENCIES, detectCurrencyFromTimezone } from '@/lib/currency-config';
import { PROJECT_TYPES } from '@/types';
import type {
    QuoteGenerateRequest,
    QuoteGenerateResponse,
    QuoteFormValues,
    QuoteDraftContext,
    QuoteReviseResponse,
    SupportedCurrency,
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
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    const currencyCode = usage?.currency_code ?? 'AED';
    const firstErrorRef = useRef<HTMLDivElement | null>(null);

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm<QuoteFormValues>({
        resolver: zodResolver(quoteFormSchema),
        defaultValues: {
            project_type: '',
            brief_text: '',
            client_name: '',
            client_company: '',
            approximate_value_aed: '',
            pdf_mode: 'bilingual',
            currency: detectCurrencyFromTimezone() as SupportedCurrency,
            tax_rate: CURRENCIES[detectCurrencyFromTimezone()]?.tax ?? 5,
        },
    });

    const selectedCurrency = watch('currency');

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

    // Validate restored state on mount (prevents crash on browser back)
    useEffect(() => {
        if (draft.quote_data && (!draft.quote_data.line_items || !Array.isArray(draft.quote_data.line_items))) {
            console.warn('Detected corrupted quote data on mount, resetting...');
            actions.reset();
        }
    }, []);

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

    // Load clients
    useEffect(() => {
        async function loadClients() {
            try {
                const res = await fetch('/api/clients');
                if (res.ok) {
                    const data = await res.json();
                    setClients(data.clients || []);
                }
            } catch (err) {
                console.error('Failed to load clients:', err);
            }
        }
        void loadClients();
    }, []);

    // Scroll to first error
    useEffect(() => {
        if (Object.keys(errors).length > 0 && firstErrorRef.current) {
            firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [errors]);

    // Template selection handler
    function handleTemplateSelect(templateId: string) {
        const template = quoteTemplates.find(t => t.id === templateId);
        if (template) {
            setSelectedTemplate(templateId);
            setValue('brief_text', template.prompt);
            // Scroll to textarea
            setTimeout(() => {
                const textarea = document.querySelector('textarea[id="project-brief"]');
                if (textarea) {
                    textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }

    // Icon mapping
    const iconMap: Record<string, React.ReactNode> = {
        Wind: <Wind className="h-6 w-6" />,
        Hammer: <Hammer className="h-6 w-6" />,
        Monitor: <Monitor className="h-6 w-6" />,
        Sparkles: <Sparkles className="h-6 w-6" />,
    };

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
            pdf_mode: values.pdf_mode,
            currency: values.currency,
            tax_rate: values.tax_rate,
        };

        console.log("🚨 Sending payload:", JSON.stringify(payload, null, 2));
        console.log("📊 Payload size:", JSON.stringify(payload).length, "bytes");

        actions.startGenerate();

        try {
            const res = await fetch('/api/quotes/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const contentType = res.headers.get("content-type");
                let errMsg = `Server Error: ${res.status}`;
                if (contentType && contentType.includes("application/json")) {
                    const errData = await res.json().catch(() => ({}));
                    errMsg = errData.error || errMsg;
                }
                throw new Error(errMsg);
            }

            const result = (await res.json().catch(() => null)) as QuoteGenerateResponse | null;

            if (!result || !result.success) {
                const errorMsg = (result && 'error' in result) ? result.error : 'Unable to generate quote. Please try again.';
                if (result && 'field' in result && result.field && result.field !== 'form') {
                    setError(result.field, { type: 'server', message: result.error });
                }
                const limitRes = result as any;
                if (limitRes?.error === 'limit_reached') {
                    setFormError(limitRes.message ?? errorMsg);
                    setIsUpgradeModalOpen(true);
                    setUsage((u) => (u ? { ...u, remaining: 0, is_limit_reached: true, count: u.limit } : u));
                }
                actions.generateFailed(errorMsg);
                setFormError(errorMsg);
                return;
            }

            if (!result.quote_data?.line_items) {
                actions.generateFailed('Invalid quote data received.');
                setFormError('Invalid quote data received.');
                return;
            }

            const context: QuoteDraftContext = {
                project_type: payload.project_type,
                brief_text: payload.brief_text,
                client_name: payload.client_name,
                client_company: payload.client_company,
                approx_value: payload.approximate_value_aed,
                pdf_mode: payload.pdf_mode,
                currency: payload.currency,
                tax_rate: payload.tax_rate,
            };

            actions.generateSuccess(result.quote_data, context);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            actions.generateFailed(errorMsg);
            setFormError(errorMsg);
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

            if (!res.ok) {
                const contentType = res.headers.get("content-type");
                let errMsg = `Server Error: ${res.status}`;
                if (contentType && contentType.includes("application/json")) {
                    const errData = await res.json().catch(() => ({}));
                    errMsg = errData.message || errMsg;
                }
                throw new Error(errMsg);
            }

            const result = (await res.json().catch(() => null)) as QuoteReviseResponse | null;

            if (!result || !result.success) {
                const message = result && 'message' in result ? result.message : "Couldn't apply that change. Try rephrasing.";
                actions.reviseFailed(message);
                return;
            }

            actions.reviseSuccess(result.quote_data);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            actions.reviseFailed(errorMsg);
        }
    }

    async function handleConfirm() {
        actions.startConfirm();
    }

    function handleReset() {
        // Nuclear state reset
        actions.reset();
        setFormError(null);
        clearErrors();
        setSelectedClientId('');
        setSelectedTemplate(null);

        // Reset all form fields to default values
        setValue('project_type', '');
        setValue('brief_text', '');
        setValue('client_name', '');
        setValue('client_company', '');
        setValue('approximate_value_aed', '');
        setValue('pdf_mode', 'bilingual');
        setValue('currency', detectCurrencyFromTimezone() as SupportedCurrency);
        setValue('tax_rate', CURRENCIES[detectCurrencyFromTimezone()]?.tax ?? 5);

        // Clear sessionStorage explicitly
        try {
            sessionStorage.removeItem('qp_quote_draft');
        } catch (e) {
            console.error('Failed to clear sessionStorage:', e);
        }
    }

    // ── Loading / auth guards ────────────────────────────────────────────────
    if (loading) {
        return (
            <main className="min-h-screen bg-[#0B0F19] px-4 py-10">
                <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
                    <LoadingSpinner label="Loading quote builder..." />
                </div>
            </main>
        );
    }

    if (!session) {
        return (
            <main className="min-h-screen bg-[#0B0F19] px-4 py-10">
                <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
                    <LoadingSpinner label="Redirecting to sign in..." />
                </div>
            </main>
        );
    }

    return (
        <div className="pb-32">
            <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />

            {/* Show form only when in form or generating state */}
            {(draft.state === 'form' || draft.state === 'generating') && (
                <Card className="max-w-3xl mx-auto rounded-2xl border border-slate-800 bg-[#121620] p-6 md:p-8 shadow-xl">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">New Quote</h1>
                        <p className="text-sm text-slate-400">Fill in the details below — QuotePro will generate a UAE-ready quotation with VAT and structured line items.</p>
                    </div>
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

                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    PDF Template Language
                                </p>
                                <p className="mt-1 text-sm text-slate-400">
                                    Choose the PDF layout that best matches your client region.
                                </p>
                            </div>

                            <Controller
                                name="pdf_mode"
                                control={control}
                                render={({ field }) => (
                                    <div className="inline-flex rounded-full border border-slate-800 bg-[#0F131D] p-1">
                                        <button
                                            type="button"
                                            onClick={() => field.onChange('bilingual')}
                                            disabled={isGenerating}
                                            className={[
                                                'rounded-full px-4 py-2 text-sm font-medium transition-all',
                                                field.value === 'bilingual'
                                                    ? 'bg-slate-800 text-white ring-1 ring-slate-600'
                                                    : 'bg-transparent text-slate-400 hover:text-slate-300',
                                            ].join(' ')}
                                        >
                                            Bilingual (English + Arabic)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => field.onChange('english_only')}
                                            disabled={isGenerating}
                                            className={[
                                                'rounded-full px-4 py-2 text-sm font-medium transition-all',
                                                field.value === 'english_only'
                                                    ? 'bg-slate-800 text-white ring-1 ring-slate-600'
                                                    : 'bg-transparent text-slate-400 hover:text-slate-300',
                                            ].join(' ')}
                                        >
                                            Standard (English Only)
                                        </button>
                                    </div>
                                )}
                            />
                        </div>

                        {/* Template Library Section */}
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-slate-400">Select a template to auto-fill the project brief, or write your own down.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {quoteTemplates.map((template) => {
                                    const isSelected = selectedTemplate === template.id;
                                    const colorClasses = {
                                        blue: {
                                            border: 'border-blue-800/50',
                                            bg: 'bg-blue-900/20',
                                            iconColor: 'text-blue-400',
                                        },
                                        amber: {
                                            border: 'border-amber-800/50',
                                            bg: 'bg-amber-900/20',
                                            iconColor: 'text-amber-400',
                                        },
                                        green: {
                                            border: 'border-emerald-800/50',
                                            bg: 'bg-emerald-900/20',
                                            iconColor: 'text-emerald-400',
                                        },
                                        purple: {
                                            border: 'border-purple-800/50',
                                            bg: 'bg-purple-900/20',
                                            iconColor: 'text-purple-400',
                                        },
                                    };
                                    const colors = colorClasses[template.color as keyof typeof colorClasses];

                                    return (
                                        <button
                                            key={template.id}
                                            type="button"
                                            onClick={() => handleTemplateSelect(template.id)}
                                            disabled={isGenerating}
                                            className={`group w-full text-left rounded-lg border transition-all p-4 cursor-pointer hover:scale-[1.02] ${colors.border} ${colors.bg} ${isSelected ? 'ring-2 ring-slate-500' : ''}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`shrink-0 ${colors.iconColor}`}>
                                                    {iconMap[template.icon]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-base mb-0.5 text-slate-200">{template.title}</h3>
                                                    <p className="text-xs text-slate-400 mb-2">{template.description}</p>
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950/40 text-slate-400">
                                                        {template.category}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
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

                        <Select
                            label="Select Client"
                            placeholder="Select a client or add new"
                            options={[
                                { value: 'new', label: '+ Add New Client' },
                                ...clients.map((client) => ({
                                    value: client.id,
                                    label: `${client.name}${client.company ? ` (${client.company})` : ''}`,
                                })),
                            ]}
                            value={selectedClientId}
                            onValueChange={(value) => {
                                setSelectedClientId(value);
                                if (value === 'new') {
                                    setValue('client_name', '');
                                    setValue('client_company', '');
                                } else {
                                    const selectedClient = clients.find(c => c.id === value);
                                    if (selectedClient) {
                                        setValue('client_name', selectedClient.name);
                                        setValue('client_company', selectedClient.company || '');
                                    }
                                }
                            }}
                            disabled={isGenerating}
                        />

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
                            <label className="mb-1.5 block text-sm font-medium text-slate-300">
                                Approximate Value
                            </label>
                            <div className="flex gap-2">
                                <Controller
                                    name="currency"
                                    control={control}
                                    render={({ field }) => (
                                        <select
                                            value={field.value}
                                            onChange={(e) => {
                                                const newCurrency = e.target.value as SupportedCurrency;
                                                field.onChange(newCurrency);
                                                setValue('tax_rate', CURRENCIES[newCurrency]?.tax ?? 0);
                                            }}
                                            disabled={isGenerating}
                                            className="h-[42px] w-28 rounded-xl border border-slate-700 bg-slate-800 px-3 text-sm font-medium text-white transition hover:border-slate-600 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                                        >
                                            {Object.entries(CURRENCIES).map(([code, config]) => (
                                                <option key={code} value={code}>
                                                    {config.symbol}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                                <Input
                                    type="number"
                                    inputMode="decimal"
                                    min="0.01"
                                    step="0.01"
                                    placeholder="e.g. 35000"
                                    error={errors.approximate_value_aed?.message}
                                    disabled={isGenerating}
                                    {...register('approximate_value_aed')}
                                />
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
                                className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold"
                            >
                                {usage?.is_limit_reached ? 'Monthly Limit Reached' : 'Generate My Quote'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Show preview when quote is generated */}
            {isPreview && draft.quote_data?.line_items && draft.context && (
                <QuotePreview
                    quoteData={draft.quote_data}
                    context={draft.context}
                    revisions={draft.revisions}
                    revisionsRemaining={revisionsRemaining}
                    isRevising={isRevising}
                    isSaving={isSaving}
                    errorMessage={draft.error_message}
                    currencyCode={draft.context.currency || watch('currency')}
                    onRevise={handleRevise}
                    onConfirm={handleConfirm}
                    onReset={handleReset}
                />
            )}

            {/* Mobile sticky action bar - only show in form state */}
            {draft.state === 'form' && (
                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0B0F19]/95 px-4 pb-safe pt-3 backdrop-blur-sm md:hidden">
                    <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        loading={isGenerating}
                        disabled={isGenerating || usage?.is_limit_reached}
                        className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold"
                        onClick={() => {
                            void handleSubmit(onSubmit)();
                        }}
                    >
                        {usage?.is_limit_reached ? 'Monthly Limit Reached' : 'Generate My Quote'}
                    </Button>
                </div>
            )}
        </div>
    );
}
