/**
 * Status color tokens — AA-contrast compliant.
 *
 * Each entry carries:
 *   - bg  : background class (Tailwind or CSS-var based)
 *   - text: foreground class
 *   - dot : solid fill class for status-dot indicators
 *   - hex : raw hex for non-Tailwind contexts (PDFs, charts, etc.)
 *
 * The Tailwind classes reference the `status.*` colors defined in
 * tailwind.config.ts so they are included in the purge manifest.
 */

export type QuoteStatus = 'draft' | 'sent' | 'pending' | 'won' | 'lost';

export interface StatusTokens {
    label: string;
    hex: string;
    /** Tailwind bg class — e.g. "bg-status-draft" */
    bgClass: string;
    /** Tailwind text class */
    textClass: string;
    /** Tailwind ring/border class for outlined badges */
    borderClass: string;
}

export const STATUS_MAP: Record<QuoteStatus, StatusTokens> = {
    draft: {
        label: 'Draft',
        hex: '#71717A',          // zinc-500
        bgClass: 'bg-zinc-100',
        textClass: 'text-zinc-500',
        borderClass: 'border-zinc-300',
    },
    sent: {
        label: 'Sent',
        hex: '#2563EB',          // blue-600
        bgClass: 'bg-blue-50',
        textClass: 'text-blue-600',
        borderClass: 'border-blue-300',
    },
    pending: {
        label: 'Pending',
        hex: '#F59E0B',          // amber-500
        bgClass: 'bg-amber-50',
        textClass: 'text-amber-600',
        borderClass: 'border-amber-300',
    },
    won: {
        label: 'Won',
        hex: '#059669',          // emerald-600
        bgClass: 'bg-emerald-50',
        textClass: 'text-emerald-600',
        borderClass: 'border-emerald-300',
    },
    lost: {
        label: 'Lost',
        hex: '#E11D48',          // rose-600
        bgClass: 'bg-rose-50',
        textClass: 'text-rose-600',
        borderClass: 'border-rose-300',
    },
};

/** Convenience: ordered list for selects / filters. */
export const QUOTE_STATUSES = Object.keys(STATUS_MAP) as QuoteStatus[];

/** Get tokens for a status, falls back to draft if unknown. */
export function getStatusTokens(status: string): StatusTokens {
    return STATUS_MAP[status as QuoteStatus] ?? STATUS_MAP.draft;
}
