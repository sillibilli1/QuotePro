import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { creditReferrerBonus } from '@/lib/referral';

/**
 * POST /api/referrals/credit
 * Called after a referred user completes their first quote.
 * Increments the referrer's bonus_quotes by 2.
 *
 * Body: { userId: string }
 * This route is internal — only called from the quote-generate server action/route.
 * The caller must be authenticated; we verify the session matches userId.
 */
export async function POST(request: Request) {
    try {
        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = (await request.json()) as { userId?: string };
        const userId = body.userId ?? user.id;

        // Only allow crediting for the authenticated user's own referral
        if (userId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await creditReferrerBonus(userId);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[referrals/credit]', err);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again.' },
            { status: 500 },
        );
    }
}
