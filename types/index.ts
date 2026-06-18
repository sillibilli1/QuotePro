import { z } from 'zod';

function roundCurrency(value: number) {
    return Math.round(value * 100) / 100;
}

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export const PROJECT_TYPES = [
    'Maintenance',
    'Contracting',
    'Interior Design',
    'Logistics',
    'Events',
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export const projectTypeSchema = z.enum(PROJECT_TYPES);

export type QuoteStatus =
    | 'draft'
    | 'review'
    | 'sent'
    | 'pending'
    | 'accepted'
    | 'rejected'
    | 'won'
    | 'lost';

export type PlanTier = 'free' | 'starter' | 'growth';

export interface BankDetails {
    bank_name: string;
    account_name: string;
    account_number: string;
    iban?: string | null;
    swift_code?: string | null;
    branch?: string | null;
    currency: string;
}

export interface ProfileRecord {
    id: string;
    email: string;
    full_name: string;
    company_name: string;
    phone: string;
    company_logo_url: string | null;
    bank_details: string | null;
    bank_details_structured?: BankDetails | null;
    trn?: string | null;
    is_subscribed: boolean;
    plan: PlanTier | null;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    country_code: string;
    currency_code: string;
    created_at: string;
    updated_at: string;
}

export interface ClientRecord {
    id: string;
    user_id: string;
    name: string;
    company: string | null;
    email: string | null;
    phone: string | null;
    trn?: string | null;
    created_at: string;
}

export interface Client {
    id: string;
    user_id: string;
    name: string;
    company: string | null;
    email: string | null;
    phone: string | null;
    created_at: string;
    quote_count?: number;
    total_value?: Record<string, number>;
    last_quote_date?: string | null;
}

export interface QuoteLineItem {
    item_number: number;
    description: string;
    unit: string;
    quantity: number;
    unit_rate_aed: number;
    subtotal_aed: number;
}

export type SupportedCurrency = 'AED' | 'PKR' | 'USD' | 'GBP' | 'SAR';

export interface LineItemRecord {
    id: string;
    quote_id: string;
    user_id: string;
    item_order: number;
    title: string;
    description: string | null;
    quantity: number;
    unit_price_aed: number;
    total_price_aed: number;
    created_at: string;
    updated_at: string;
}

export type LineItem = QuoteLineItem;
export type QuoteItem = QuoteLineItem;

export interface GeneratedQuoteData {
    project_title: string;
    client_name: string;
    client_company: string | null;
    line_items: QuoteLineItem[];
    subtotal_aed: number;
    vat_5_percent_aed: number;
    total_aed: number;
    validity_days: 30;
    payment_terms: string;
    estimated_duration: string;
    notes: string | null;
    currency?: string;
    tax_rate?: number;
}

export type PdfMode = 'bilingual' | 'english_only';

export const PDF_MODES = ['bilingual', 'english_only'] as const;

export const pdfModeSchema = z.enum(PDF_MODES);

export interface QuoteFormValues {
    project_type: ProjectType | '';
    brief_text: string;
    client_name: string;
    client_company: string;
    approximate_value_aed: string;
    pdf_mode: PdfMode;
    currency: SupportedCurrency;
    tax_rate: number;
}

export interface QuoteDetailResponse {
    success: true;
    quote: QuoteRecord & {
        client_name?: string | null;
        client_company?: string | null;
        company_name?: string | null;
        company_phone?: string | null;
        line_items: QuoteLineItem[];
        line_items_list?: LineItemRecord[];
    };
    client: Pick<ClientRecord, 'name' | 'company'> | null;
    profile: Pick<ProfileRecord, 'company_name' | 'phone'> | null;
}

export interface QuoteDetailErrorResponse {
    success: false;
    error: string;
}

export type QuoteDetailApiResponse = QuoteDetailResponse | QuoteDetailErrorResponse;

export interface DashboardQuoteRecord {
    id: string;
    quote_number: string | null;
    status: QuoteStatus;
    total_aed: number | null;
    currency: SupportedCurrency;
    created_at: string;
    viewed_at: string | null;
    share_token: string | null;
    client_name: string | null;
    client_company: string | null;
}

export interface QuoteStatsResponse {
    quotes_this_month: number;
    pipeline_by_currency: Record<string, number>;
    won_by_currency: Record<string, number>;
    quotes: DashboardQuoteRecord[];
}

export interface QuoteStatsApiResponse {
    success: boolean;
    data?: QuoteStatsResponse;
    error?: string;
}

export interface QuoteShareResponse {
    success: boolean;
    share_token?: string;
    share_url?: string;
    error?: string;
}

export interface PublicQuoteResponse {
    success: boolean;
    quote?: {
        id: string;
        quote_number: string | null;
        status: QuoteStatus;
        project_title: string | null;
        subtotal_aed: number | null;
        vat_5_aed: number | null;
        total_aed: number | null;
        share_token: string | null;
        created_at: string;
        viewed_at: string | null;
        client_name: string | null;
        client_company: string | null;
        company_name: string | null;
        company_phone: string | null;
        company_logo_url: string | null;
        pdf_mode: PdfMode;
        currency: SupportedCurrency;
        tax_rate: number;
        line_items: QuoteLineItem[];
    };
    error?: string;
}

export interface QuoteUsageResponse {
    count: number;
    limit: number;
    remaining: number;
    is_limit_reached: boolean;
}

export interface LimitReachedResponse {
    error: 'limit_reached';
    message: string;
    upgrade_url: string;
}

export const quoteFormSchema = z.object({
    project_type: projectTypeSchema.or(z.literal('')).refine((value) => value !== '', {
        message: 'Project type is required.',
    }),
    brief_text: z.string().trim().min(20, 'Project brief must be at least 20 characters.'),
    client_name: z.string().trim().min(1, 'Client name is required.'),
    client_company: z.string().trim(),
    approximate_value_aed: z
        .string()
        .trim()
        .refine(
            (value) => value === '' || /^\d+(\.\d{1,2})?$/.test(value),
            'Approximate value must be a valid amount in AED.',
        )
        .refine((value) => value === '' || Number(value) > 0, 'Approximate value must be greater than 0 AED.'),
    pdf_mode: pdfModeSchema,
    currency: z.enum(['AED', 'PKR', 'USD', 'GBP', 'SAR']),
    tax_rate: z.number().min(0).max(100),
});

export const quoteGenerateRequestSchema = z
    .object({
        project_type: projectTypeSchema,
        brief_text: z.string().trim().min(20, 'Project brief must be at least 20 characters.'),
        client_name: z.string().trim().min(1, 'Client name is required.'),
        client_company: z
            .string()
            .trim()
            .min(1)
            .nullable(),
        approximate_value_aed: z.number().finite().positive().nullable(),
        pdf_mode: pdfModeSchema,
        currency: z.enum(['AED', 'PKR', 'USD', 'GBP', 'SAR']),
        tax_rate: z.number().min(0).max(100),
    })
    .strict();

const generatedQuoteLineItemSchema = z
    .object({
        item_number: z.number().int().positive(),
        description: z.string().trim().min(1),
        unit: z.string().trim().min(1),
        quantity: z.number().positive(),
        unit_rate_aed: z.number().nonnegative(),
        subtotal_aed: z.number().nonnegative(),
    })
    .strict()
    .superRefine((item, ctx) => {
        if (roundCurrency(item.quantity * item.unit_rate_aed) !== roundCurrency(item.subtotal_aed)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Line item subtotal must equal quantity multiplied by unit rate.',
                path: ['subtotal_aed'],
            });
        }
    });

export const generatedQuoteDataSchema = z
    .object({
        project_title: z.string().trim().min(1),
        client_name: z.string().trim().min(1),
        client_company: z.string().trim().min(1).nullable(),
        line_items: z.array(generatedQuoteLineItemSchema).min(1),
        subtotal_aed: z.number().nonnegative(),
        vat_5_percent_aed: z.number().nonnegative(),
        total_aed: z.number().nonnegative(),
        validity_days: z.literal(30),
        payment_terms: z.string().trim().min(1),
        estimated_duration: z.string().trim().min(1),
        notes: z.string().trim().min(1).nullable(),
        currency: z.string().optional(),
        tax_rate: z.number().optional(),
    })
    .strict()
    .superRefine((quote, ctx) => {
        const calculatedSubtotal = roundCurrency(
            quote.line_items.reduce((sum, item) => sum + item.subtotal_aed, 0),
        );

        if (roundCurrency(quote.subtotal_aed) !== calculatedSubtotal) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Subtotal must equal the sum of line item subtotals.',
                path: ['subtotal_aed'],
            });
        }

        // Note: Tax and total validation removed - tax rate is dynamic per quote
        // The AI is instructed to calculate based on the provided tax_rate parameter
    });

export interface QuoteGenerateRequest {
    project_type: ProjectType;
    brief_text: string;
    client_name: string;
    client_company: string | null;
    approximate_value_aed: number | null;
    pdf_mode: PdfMode;
    currency: SupportedCurrency;
    tax_rate: number;
}

export interface QuoteGenerateSuccessResponse {
    success: true;
    quote_data: GeneratedQuoteData;
}

export interface QuoteGenerateErrorResponse {
    success: false;
    field?: keyof QuoteFormValues | 'form';
    error: string;
}

export type QuoteGenerateResponse = QuoteGenerateSuccessResponse | QuoteGenerateErrorResponse;

export interface QuoteRecord {
    id: string;
    user_id: string;
    client_id: string;
    quote_number: string | null;
    status: QuoteStatus;
    project_title: string | null;
    project_type: ProjectType | null;
    brief_text: string | null;
    pdf_mode: PdfMode;
    line_items: QuoteLineItem[];
    subtotal_aed: number | null;
    vat_5_aed: number | null;
    total_aed: number | null;
    currency: SupportedCurrency;
    tax_rate: number;
    share_token: string | null;
    pdf_url: string | null;
    viewed_at: string | null;
    is_invoice?: boolean;
    invoice_number?: string | null;
    invoice_date?: string | null;
    due_date?: string | null;
    created_at: string;
    updated_at: string;
}

export type Quote = QuoteRecord;

export interface ProfileFormValues {
    full_name: string;
    company_name: string;
    phone: string;
}

export const profileFormSchema = z.object({
    full_name: z.string().trim().min(2, 'Full name must be at least 2 characters.'),
    company_name: z.string().trim().min(2, 'Company name must be at least 2 characters.'),
    phone: z
        .string()
        .trim()
        .min(7, 'Phone number must be at least 7 characters.')
        .max(20, 'Phone number must be 20 characters or fewer.'),
});

export interface ProfileUpsertResponse {
    success: boolean;
    error?: string;
}

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: ProfileRecord;
                Insert: {
                    id: string;
                    email: string;
                    full_name?: string;
                    company_name?: string;
                    phone?: string;
                    bank_details?: string | null;
                    is_subscribed?: boolean;
                    plan?: PlanTier | null;
                    stripe_customer_id?: string | null;
                    stripe_subscription_id?: string | null;
                    country_code?: string;
                    currency_code?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    full_name?: string;
                    company_name?: string;
                    phone?: string;
                    bank_details?: string | null;
                    is_subscribed?: boolean;
                    plan?: PlanTier | null;
                    stripe_customer_id?: string | null;
                    stripe_subscription_id?: string | null;
                    country_code?: string;
                    currency_code?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            clients: {
                Row: ClientRecord;
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    company?: string | null;
                    email?: string | null;
                    phone?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    name?: string;
                    company?: string | null;
                    email?: string | null;
                    phone?: string | null;
                    created_at?: string;
                };
                Relationships: [];
            };
            quotes: {
                Row: QuoteRecord;
                Insert: {
                    id?: string;
                    user_id: string;
                    client_id: string;
                    quote_number?: string | null;
                    status?: QuoteStatus;
                    project_title?: string | null;
                    project_type?: ProjectType | null;
                    brief_text?: string | null;
                    pdf_mode?: PdfMode;
                    line_items?: QuoteLineItem[];
                    subtotal_aed?: number | null;
                    vat_5_aed?: number | null;
                    total_aed?: number | null;
                    currency?: SupportedCurrency;
                    tax_rate?: number;
                    share_token?: string | null;
                    pdf_url?: string | null;
                    viewed_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    client_id?: string;
                    quote_number?: string | null;
                    status?: QuoteStatus;
                    project_title?: string | null;
                    project_type?: ProjectType | null;
                    brief_text?: string | null;
                    pdf_mode?: PdfMode;
                    line_items?: QuoteLineItem[];
                    subtotal_aed?: number | null;
                    vat_5_aed?: number | null;
                    total_aed?: number | null;
                    currency?: SupportedCurrency;
                    tax_rate?: number;
                    share_token?: string | null;
                    pdf_url?: string | null;
                    viewed_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            line_items: {
                Row: LineItemRecord;
                Insert: {
                    id?: string;
                    quote_id: string;
                    user_id: string;
                    item_order?: number;
                    title: string;
                    description?: string | null;
                    quantity?: number;
                    unit_price_aed?: number;
                    total_price_aed?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    quote_id?: string;
                    user_id?: string;
                    item_order?: number;
                    title?: string;
                    description?: string | null;
                    quantity?: number;
                    unit_price_aed?: number;
                    total_price_aed?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            increment_bonus_quotes: {
                Args: { p_user_id: string; p_amount: number };
                Returns: void;
            };
        };
    };
};

// ── Referral types ────────────────────────────────────────────────────────────

export interface ReferralRecord {
    /** The user who was referred */
    user_id: string;
    /** The user who made the referral */
    referrer_id: string;
    /** ISO timestamp when referral was recorded */
    created_at: string;
}

/** Partial profile fields relevant to referral UI */
export interface ReferralProfile {
    referral_code: string;
    referred_by: string | null;
    bonus_quotes: number;
}

// ── Toast types ───────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

// ── Day 8: Quote Draft & Revision types ──────────────────────────────────────

export interface RevisionEntry {
    instruction: string;
    at: string;
}

export interface QuoteDraftContext {
    project_type: ProjectType;
    brief_text: string;
    client_name: string;
    client_company: string | null;
    approx_value: number | null;
    pdf_mode: PdfMode;
    currency: SupportedCurrency;
    tax_rate: number;
}

export interface QuoteDraft {
    quote_data: GeneratedQuoteData | null;
    context: QuoteDraftContext | null;
    revisions: RevisionEntry[];
    state: 'form' | 'generating' | 'preview' | 'revising' | 'saving' | 'error';
    error_message: string | null;
}

export interface QuoteReviseRequest {
    quote_data: GeneratedQuoteData;
    instruction: string;
    context: QuoteDraftContext;
}

export interface QuoteReviseSuccessResponse {
    success: true;
    quote_data: GeneratedQuoteData;
}

export interface QuoteReviseErrorResponse {
    success: false;
    error: string;
    message: string;
}

export type QuoteReviseResponse = QuoteReviseSuccessResponse | QuoteReviseErrorResponse;

export interface QuoteConfirmRequest {
    quote_data: GeneratedQuoteData;
    context: QuoteDraftContext;
}

export interface QuoteConfirmSuccessResponse {
    success: true;
    quote_id: string;
}

export interface QuoteConfirmErrorResponse {
    success: false;
    error: string;
}

export type QuoteConfirmResponse = QuoteConfirmSuccessResponse | QuoteConfirmErrorResponse;
