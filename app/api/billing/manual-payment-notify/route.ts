import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        console.log('[manual-payment-notify] 🔑 RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);

        if (!process.env.RESEND_API_KEY) {
            console.error('[manual-payment-notify] ❌ RESEND_API_KEY is undefined!');
            return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
        }

        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = (await request.json()) as {
            plan?: string;
            amount?: string;
            reference?: string;
        };

        const { plan, amount, reference } = body;

        if (!plan || !amount || !reference) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Extract currency and numeric amount from string like "AED 199"
        const [currency, amountStr] = amount.split(' ');
        const numericAmount = parseFloat(amountStr.replace(/,/g, ''));

        // Insert payment request into database using admin client to bypass RLS
        const adminSupabase = createAdminClient();

        // Ensure profile exists before inserting payment request
        const { data: profile } = await adminSupabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

        if (!profile) {
            await adminSupabase.from('profiles').insert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || 'Early Adopter',
            });
        }

        const { error: insertError } = await adminSupabase
            .from('manual_payment_requests')
            .insert({
                user_id: user.id,
                plan,
                currency,
                amount: numericAmount,
                reference,
                status: 'pending',
            });

        if (insertError) {
            console.error('[manual-payment-notify] ❌ PAYMENT INSERT ERROR:', insertError);
            return NextResponse.json({ error: 'Failed to save payment request' }, { status: 500 });
        }

        console.log('[manual-payment-notify] ✅ Payment request saved to database');

        const emailPayload = {
            from: 'QuotePro <hello@quoteproapp.com>',
            to: 'salarakhoon12431243@gmail.com',
            subject: `[QuotePro] Manual payment claimed — ${user.email} — ${plan}`,
            html: `
          <h2>Manual Bank Transfer — Payment Claimed</h2>
          <table style="border-collapse:collapse;width:100%;max-width:500px">
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">User Email</td><td style="padding:8px;border:1px solid #ddd">${user.email}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">User ID</td><td style="padding:8px;border:1px solid #ddd">${user.id}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Plan</td><td style="padding:8px;border:1px solid #ddd">${plan}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Amount</td><td style="padding:8px;border:1px solid #ddd">${amount}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Reference</td><td style="padding:8px;border:1px solid #ddd">${reference}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Timestamp</td><td style="padding:8px;border:1px solid #ddd">${new Date().toISOString()}</td></tr>
          </table>
          <p style="margin-top:16px;color:#666">
            Please verify the transfer in your bank portal, then manually activate the user's plan
            in the Supabase dashboard (profiles table → set is_subscribed=true, plan='${plan}').
          </p>
        `,
        };

        console.log('[manual-payment-notify] 📧 About to send email with payload:', JSON.stringify(emailPayload, null, 2));

        const { data, error } = await resend.emails.send(emailPayload);

        console.log('[manual-payment-notify] 📬 Resend response - data:', data, 'error:', error);

        if (error) {
            console.error('[manual-payment-notify] ❌ Resend error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log('[manual-payment-notify] ✅ Email sent successfully!');
        return NextResponse.json({ success: true, emailId: data?.id });
    } catch (err) {
        console.error('[manual-payment-notify] ❌ Caught exception:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
