import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireAdmin();

        const supabaseAdmin = createAdminClient();
        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('id, email')
            .eq('id', params.id)
            .single();

        if (error || !profile || !profile.email) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: profile.email,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/impersonate`
            }
        });

        if (linkError || !linkData?.properties?.action_link) {
            return NextResponse.json({ error: 'Failed to generate magic link' }, { status: 500 });
        }

        return NextResponse.json({ url: linkData.properties.action_link });
    } catch (error) {
        console.error('Impersonate error:', error);
        return NextResponse.json({ error: 'Failed to impersonate user' }, { status: 500 });
    }
}
