import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
    await requireAdmin();
    const { type } = await request.json();

    const supabase = createAdminClient();

    if (type === 'users') {
        const { data: users } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        const csv = convertToCSV(users || [], [
            'id', 'email', 'full_name', 'company_name', 'phone', 'country',
            'currency_code', 'plan', 'is_subscribed', 'quotes_used', 'created_at'
        ]);

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename=users-${Date.now()}.csv`,
            },
        });
    }

    if (type === 'quotes') {
        const { data: quotes } = await supabase
            .from('quotes')
            .select('*, clients(name, company)')
            .order('created_at', { ascending: false });

        const userIds = [...new Set((quotes || []).map(q => q.user_id).filter(Boolean))];

        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, email')
            .in('id', userIds);

        const profileMap = new Map((profiles || []).map(p => [p.id, p]));

        const flatQuotes = (quotes || []).map(q => ({
            id: q.id,
            quote_number: q.quote_number,
            user_email: profileMap.get(q.user_id)?.email || '',
            client_name: q.clients?.name || '',
            project_type: q.project_type,
            currency: q.currency,
            total: q.total_aed,
            status: q.status,
            created_at: q.created_at,
        }));

        const csv = convertToCSV(flatQuotes, Object.keys(flatQuotes[0] || {}));

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename=quotes-${Date.now()}.csv`,
            },
        });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}

function convertToCSV(data: any[], columns: string[]): string {
    const header = columns.join(',');
    const rows = data.map(row =>
        columns.map(col => {
            const value = row[col];
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value ?? '';
        }).join(',')
    );
    return [header, ...rows].join('\n');
}
