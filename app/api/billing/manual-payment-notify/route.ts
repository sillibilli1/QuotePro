import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        // Auth check
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

        // Send notification email via Resend
        const resendApiKey = process.env.RESEND_API_KEY;
        const salesEmail = process.env.RESEND_SALES_EMAIL ?? process.env.RESEND_FROM_EMAIL;
        const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'QuotePro <noreply@quotepro.app>';

        if (resendApiKey && salesEmail) {
            const emailBody = {
                from: fromEmail,
                to: salesEmail,
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

            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${resendApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailBody),
            });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[manual-payment-notify]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
