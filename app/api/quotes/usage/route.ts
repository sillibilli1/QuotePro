import { NextResponse } from 'next/server';
import { getMonthlyQuoteUsage } from '@/lib/quote-usage';
import { createClient } from '@/lib/supabase/server';

type QueryError = { message: string } | null;

type ProfileRow = { currency_code: string; plan: string | null; is_subscribed: boolean };

type ProfilesTable = {
    select: (columns: string) => {
        eq: (column: 'id', value: string) => {
            maybeSingle: () => Promise<{ data: ProfileRow | null; error: QueryError }>;
        };
    };
};

export async function GET() {
    const supabase = createClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'unauthorized', message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const profileResult = await (supabase.from('profiles') as unknown as ProfilesTable)
            .select('currency_code, plan, is_subscribed')
            .eq('id', user.id)
            .maybeSingle();

        const profile = profileResult.data;
        const currencyCode = profile?.currency_code || 'AED';
        const isSubscribed = profile?.is_subscribed ?? false;
        const plan = profile?.plan ?? null;

        const usage = await getMonthlyQuoteUsage(user.id, isSubscribed, plan);

        return NextResponse.json({ ...usage, currency_code: currencyCode }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load quote usage.';
        return NextResponse.json({ error: 'usage_unavailable', message }, { status: 500 });
    }
}
