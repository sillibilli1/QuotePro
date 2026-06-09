import { NextResponse } from 'next/server';
import type { Database, GeneratedQuoteData, QuoteConfirmResponse, QuoteConfirmRequest } from '@/types';
import { createClient } from '@/lib/supabase/server';

type SupabaseServerClient = ReturnType<typeof createClient>;
type QueryError = { message: string } | null;
type ClientInsert = Database['public']['Tables']['clients']['Insert'];
type QuoteInsert = Database['public']['Tables']['quotes']['Insert'];
type ClientIdRow = Pick<Database['public']['Tables']['clients']['Row'], 'id'>;
type QuoteIdRow = Pick<Database['public']['Tables']['quotes']['Row'], 'id'>;
type QuoteNumberRow = Pick<Database['public']['Tables']['quotes']['Row'], 'quote_number'>;

type ClientLookupByCompany = {
    maybeSingle: () => Promise<{ data: ClientIdRow | null; error: QueryError }>;
};

type ClientLookupByName = {
    eq: (column: 'company', value: string) => ClientLookupByCompany;
    is: (column: 'company', value: null) => ClientLookupByCompany;
};

type ClientsTable = {
    select: (columns: 'id') => {
        eq: (column: 'user_id', value: string) => {
            eq: (column: 'name', value: string) => ClientLookupByName;
        };
    };
    insert: (values: ClientInsert) => {
        select: (columns: 'id') => {
            single: () => Promise<{ data: ClientIdRow; error: QueryError }>;
        };
    };
};

type QuotesTable = {
    select: (columns: 'quote_number') => {
        like: (column: 'quote_number', pattern: string) => {
            order: (column: 'quote_number', config: { ascending: boolean }) => {
                limit: (count: number) => Promise<{ data: QuoteNumberRow[] | null; error: QueryError }>;
            };
        };
    };
    insert: (values: QuoteInsert) => {
        select: (columns: 'id') => {
            single: () => Promise<{ data: QuoteIdRow; error: QueryError }>;
        };
    };
};

async function findOrCreateClient(
    supabase: SupabaseServerClient,
    userId: string,
    name: string,
    company: string | null
) {
    const clientsTable = supabase.from('clients') as unknown as ClientsTable;
    const lookupByName = clientsTable.select('id').eq('user_id', userId).eq('name', name);
    const lookupByCompany = company === null ? lookupByName.is('company', null) : lookupByName.eq('company', company);

    const { data: existingClient, error: existingClientError } = await lookupByCompany.maybeSingle();

    if (existingClientError) {
        throw existingClientError;
    }

    if (existingClient) {
        return existingClient.id;
    }

    const clientPayload: ClientInsert = {
        user_id: userId,
        name,
        company,
    };

    const { data: createdClient, error: createClientError } = await clientsTable
        .insert(clientPayload)
        .select('id')
        .single();

    if (createClientError) {
        throw createClientError;
    }

    return createdClient.id;
}

async function generateQuoteNumber(supabase: SupabaseServerClient, year: number) {
    const prefix = `QP-${year}-`;
    const quotesTable = supabase.from('quotes') as unknown as QuotesTable;

    const { data, error } = await quotesTable
        .select('quote_number')
        .like('quote_number', `${prefix}%`)
        .order('quote_number', { ascending: false })
        .limit(1);

    if (error) {
        throw error;
    }

    const lastQuoteNumber = data?.[0]?.quote_number ?? null;
    const lastSequence = lastQuoteNumber ? Number(lastQuoteNumber.slice(prefix.length)) : 0;
    const nextSequence = Number.isFinite(lastSequence) ? lastSequence + 1 : 1;

    return `${prefix}${String(nextSequence).padStart(4, '0')}`;
}

export async function POST(request: Request) {
    const supabase = createClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json<QuoteConfirmResponse>(
            { success: false, error: 'Unauthorized.' },
            { status: 401 }
        );
    }

    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json<QuoteConfirmResponse>(
            { success: false, error: 'Invalid request body.' },
            { status: 400 }
        );
    }

    const payload = body as QuoteConfirmRequest;

    if (!payload.quote_data || !payload.context) {
        return NextResponse.json<QuoteConfirmResponse>(
            { success: false, error: 'Missing required fields.' },
            { status: 400 }
        );
    }

    try {
        const quoteData: GeneratedQuoteData = payload.quote_data;
        const context = payload.context;

        // 1. Upsert the client
        const clientId = await findOrCreateClient(
            supabase,
            user.id,
            context.client_name,
            context.client_company
        );

        // 2. Generate quote_number
        const quoteNumber = await generateQuoteNumber(supabase, new Date().getUTCFullYear());

        // 3. Prepare line_items as JSONB (matching the schema)
        const lineItemsJson = quoteData.line_items.map((item, index) => ({
            item_order: index,
            title: item.unit.trim() || `Item ${index + 1}`,
            description: item.description.trim(),
            quantity: item.quantity,
            unit_price_aed: item.unit_rate_aed,
            total_price_aed: item.subtotal_aed,
        }));

        // 4. Insert quote with line_items as JSONB
        const quoteInsert: QuoteInsert = {
            user_id: user.id,
            client_id: clientId,
            quote_number: quoteNumber,
            status: 'review',
            project_title: quoteData.project_title,
            project_type: context.project_type,
            brief_text: context.brief_text,
            line_items: lineItemsJson as any,
            subtotal_aed: quoteData.subtotal_aed,
            vat_5_aed: quoteData.vat_5_percent_aed,
            total_aed: quoteData.total_aed,
        };

        const quotesTable = supabase.from('quotes') as unknown as QuotesTable;
        const { data: insertedQuote, error: insertError } = await quotesTable
            .insert(quoteInsert)
            .select('id')
            .single();

        if (insertError) {
            console.error('Quote insert error:', insertError);
            throw insertError;
        }

        return NextResponse.json<QuoteConfirmResponse>({
            success: true,
            quote_id: insertedQuote.id,
        });
    } catch (error) {
        console.error('Quote confirmation failed:', error);
        return NextResponse.json<QuoteConfirmResponse>(
            { success: false, error: 'Unable to save quote. Please try again.' },
            { status: 500 }
        );
    }
}
