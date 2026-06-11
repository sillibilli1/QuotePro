import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { Client, ClientRecord, SupportedCurrency } from '@/types';

const clientCreateSchema = z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    company: z.string().trim().max(100).optional().nullable(),
    email: z.string().email('Invalid email format').optional().nullable(),
    phone: z.string().trim().optional().nullable(),
});

export async function GET() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch clients with their basic info
    const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (clientsError) {
        return NextResponse.json({ success: false, error: clientsError.message }, { status: 500 });
    }

    // Fetch quote stats for each client
    const { data: quoteStats, error: statsError } = await supabase
        .from('quotes')
        .select('client_id, currency, total_aed, created_at')
        .eq('user_id', user.id);

    if (statsError) {
        return NextResponse.json({ success: false, error: statsError.message }, { status: 500 });
    }

    type QuoteStat = {
        client_id: string;
        currency: SupportedCurrency | null;
        total_aed: number | null;
        created_at: string;
    };

    // Aggregate stats per client
    const clientsWithStats: Client[] = ((clients || []) as ClientRecord[]).map(client => {
        const clientQuotes = ((quoteStats || []) as QuoteStat[]).filter(q => q.client_id === client.id);
        const quote_count = clientQuotes.length;
        const last_quote_date = clientQuotes.length > 0
            ? clientQuotes.reduce((latest, q) => q.created_at > latest ? q.created_at : latest, clientQuotes[0].created_at)
            : null;

        const total_value: Record<string, number> = {};
        clientQuotes.forEach(q => {
            const curr = q.currency || 'AED';
            total_value[curr] = (total_value[curr] || 0) + (q.total_aed || 0);
        });

        return { ...client, quote_count, last_quote_date, total_value };
    });

    // Sort by last_quote_date DESC NULLS LAST
    clientsWithStats.sort((a, b) => {
        if (!a.last_quote_date && !b.last_quote_date) return 0;
        if (!a.last_quote_date) return 1;
        if (!b.last_quote_date) return -1;
        return new Date(b.last_quote_date).getTime() - new Date(a.last_quote_date).getTime();
    });

    return NextResponse.json({ success: true, clients: clientsWithStats });
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = clientCreateSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json(
            { success: false, error: validation.error.issues[0].message },
            { status: 400 }
        );
    }

    const { name, company, email, phone } = validation.data;

    // Check for duplicate name
    const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', name)
        .single();

    if (existing) {
        return NextResponse.json(
            { success: false, error: 'A client with this name exists' },
            { status: 400 }
        );
    }

    const insertData = {
        user_id: user.id,
        name,
        company: company || null,
        email: email || null,
        phone: phone || null,
    };

    const { data: client, error } = await supabase
        .from('clients')
        .insert(insertData as any)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, client });
}
