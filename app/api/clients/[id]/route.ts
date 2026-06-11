import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const clientUpdateSchema = z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
    company: z.string().trim().max(100).optional().nullable(),
    email: z.string().email('Invalid email format').optional().nullable(),
    phone: z.string().trim().optional().nullable(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single();

    if (error) {
        return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, client });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single();

    if (!existing) {
        return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    const body = await req.json();
    const validation = clientUpdateSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json(
            { success: false, error: validation.error.issues[0].message },
            { status: 400 }
        );
    }

    const updateData: Record<string, any> = {};
    if (validation.data.name !== undefined) updateData.name = validation.data.name;
    if (validation.data.company !== undefined) updateData.company = validation.data.company;
    if (validation.data.email !== undefined) updateData.email = validation.data.email;
    if (validation.data.phone !== undefined) updateData.phone = validation.data.phone;

    const { data: client, error } = await (supabase
        .from('clients') as any)
        .update(updateData)
        .eq('id', params.id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, client });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single();

    if (!existing) {
        return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    // Check for existing quotes
    const { count } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', params.id);

    if (count && count > 0) {
        return NextResponse.json(
            { success: false, error: 'Cannot delete client with existing quotes' },
            { status: 400 }
        );
    }

    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', params.id);

    if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
