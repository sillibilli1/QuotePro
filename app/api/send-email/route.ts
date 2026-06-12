import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        console.log('[send-email] 🔑 RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);

        if (!process.env.RESEND_API_KEY) {
            console.error('[send-email] ❌ RESEND_API_KEY is undefined!');
            return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
        }

        const body = await request.json();
        const { to, subject, text, html } = body;

        if (!to || !subject || !text) {
            return NextResponse.json(
                { error: 'Missing required fields: to, subject, text' },
                { status: 400 }
            );
        }

        const emailPayload = {
            from: 'QuotePro <hello@quoteproapp.com>',
            to: 'salarakhoon12431243@gmail.com',
            subject,
            text,
            html: html || text,
        };

        console.log('[send-email] 📧 About to send email with payload:', JSON.stringify(emailPayload, null, 2));

        const { data, error } = await resend.emails.send(emailPayload);

        console.log('[send-email] 📬 Resend response - data:', data, 'error:', error);

        if (error) {
            console.error('[send-email] ❌ Resend error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log('[send-email] ✅ Email sent successfully!');
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('[send-email] ❌ Caught exception:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to send email' },
            { status: 500 }
        );
    }
}
