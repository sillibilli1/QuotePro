import type { Database } from '@/types';
import { createClient } from '@/lib/supabase/server';

export const FREE_QUOTE_LIMIT = 5;
export const STARTER_QUOTE_LIMIT = 30;
export const GROWTH_QUOTE_LIMIT = 999999; // Effectively unlimited for display/usage UI
export const GROWTH_FAIR_USE_LIMIT = 1000;

type QuoteUsageSummary = {
    count: number;
    limit: number;
    remaining: number;
    is_limit_reached: boolean;
};

type QueryError = { message: string } | null;
type CountResponse = { count: number | null; error: QueryError };

type QuotesUsageTable = {
    select: (columns: '*', options: { count: 'exact'; head: true }) => {
        eq: (column: 'user_id', value: string) => {
            gte: (column: 'created_at', value: string) => Promise<CountResponse>;
        };
    };
};

function getMonthStartIso() {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)).toISOString();
}

/**
 * Determines the quote limit based on the user's subscription plan.
 * This is used for the usage UI and mirrors the plan labels shown to the user.
 * @param isSubscribed - Whether the user has an active subscription
 * @param plan - The user's subscription plan ('starter', 'growth', or null/other for free)
 * @returns The monthly quote limit for the user's plan
 */
export function getPlanLimit(isSubscribed: boolean, plan: string | null): number {
    if (!isSubscribed || !plan) {
        return FREE_QUOTE_LIMIT; // Free plan: 5 quotes
    }

    if (plan === 'growth') {
        return GROWTH_QUOTE_LIMIT; // Growth plan: unlimited (999999) in the UI
    }

    if (plan === 'starter') {
        return STARTER_QUOTE_LIMIT; // Starter plan: 30 quotes
    }

    // Default to free if plan is unrecognized
    return FREE_QUOTE_LIMIT;
}

/**
 * Returns the server-side enforcement limit for quote creation.
 * Growth keeps the unlimited UI label but is capped by fair use on write paths.
 */
export function getQuoteCreationLimit(isSubscribed: boolean, plan: string | null): number {
    if (!isSubscribed || !plan) {
        return FREE_QUOTE_LIMIT;
    }

    if (plan === 'growth') {
        return GROWTH_FAIR_USE_LIMIT;
    }

    if (plan === 'starter') {
        return STARTER_QUOTE_LIMIT;
    }

    return FREE_QUOTE_LIMIT;
}

/**
 * Gets the monthly quote usage for a user, respecting their subscription plan.
 * @param userId - The user's ID
 * @param isSubscribed - Whether the user has an active subscription
 * @param plan - The user's subscription plan
 * @returns Quote usage summary with count, limit, remaining, and limit status
 */
export async function getMonthlyQuoteUsage(
    userId: string,
    isSubscribed: boolean = false,
    plan: string | null = null
): Promise<QuoteUsageSummary> {
    const supabase = createClient();
    const quotesTable = supabase.from('quotes') as unknown as QuotesUsageTable;

    const { count, error } = await quotesTable
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', getMonthStartIso());

    if (error) {
        throw new Error(error.message);
    }

    const usageCount = count ?? 0;
    const limit = getPlanLimit(isSubscribed, plan);
    const remaining = Math.max(limit - usageCount, 0);

    return {
        count: usageCount,
        limit,
        remaining,
        is_limit_reached: usageCount >= limit,
    };
}

export type { QuoteUsageSummary, CountResponse };
