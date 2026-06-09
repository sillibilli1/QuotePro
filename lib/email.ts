import { Resend } from 'resend';

const APP_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL?.trim() || 'QuotePro <onboarding@resend.dev>';

let resendClient: Resend | null = null;

function getResendClient() {
    const apiKey = process.env.RESEND_API_KEY?.trim();

    if (!apiKey) {
        throw new Error('RESEND_API_KEY is not configured.');
    }

    if (!resendClient) {
        resendClient = new Resend(apiKey);
    }

    return resendClient;
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#39;');
}

function buildQuoteViewedEmailHtml(params: {
    userName: string;
    clientName: string;
    quoteNumber: string;
    totalAed: number;
    viewedAt: string;
    quoteId: string;
}) {
    const quoteUrl = `${APP_URL}/app/quotes/${params.quoteId}`;

    return `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Your quote was viewed</title>
    </head>
    <body style="margin:0;padding:0;background-color:#020617;font-family:Arial,Helvetica,sans-serif;color:#e2e8f0;">
        <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="background-color:#020617;margin:0;padding:24px 12px;">
            <tr>
                <td align="center">
                    <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="max-width:600px;background-color:#0f172a;border:1px solid rgba(148,163,184,0.18);border-radius:24px;overflow:hidden;">
                        <tr>
                            <td style="padding:32px 24px 12px 24px;">
                                <p style="margin:0 0 10px 0;font-size:12px;line-height:18px;letter-spacing:0.24em;text-transform:uppercase;color:#7dd3fc;font-weight:700;">QuotePro Notification</p>
                                <h1 style="margin:0;font-size:28px;line-height:36px;color:#ffffff;font-weight:700;">Your quote was viewed! 📋</h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:12px 24px 24px 24px;">
                                <p style="margin:0 0 16px 0;font-size:16px;line-height:26px;color:#e2e8f0;">Hi ${escapeHtml(params.userName)},</p>
                                <p style="margin:0 0 18px 0;font-size:16px;line-height:26px;color:#cbd5e1;">Good news! Your quote for <strong style="color:#ffffff;">${escapeHtml(params.clientName)}</strong> was just viewed.</p>

                                <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="margin:0 0 24px 0;background-color:#020617;border:1px solid rgba(148,163,184,0.16);border-radius:18px;">
                                    <tr>
                                        <td style="padding:18px 18px 8px 18px;font-size:14px;line-height:22px;color:#94a3b8;">Quote</td>
                                        <td style="padding:18px 18px 8px 18px;font-size:14px;line-height:22px;color:#ffffff;font-weight:600;text-align:right;">${escapeHtml(params.quoteNumber)}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:8px 18px;font-size:14px;line-height:22px;color:#94a3b8;">Value</td>
                                        <td style="padding:8px 18px;font-size:14px;line-height:22px;color:#ffffff;font-weight:600;text-align:right;">${escapeHtml(formatCurrency(params.totalAed))}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:8px 18px 18px 18px;font-size:14px;line-height:22px;color:#94a3b8;">Viewed at</td>
                                        <td style="padding:8px 18px 18px 18px;font-size:14px;line-height:22px;color:#ffffff;font-weight:600;text-align:right;">${escapeHtml(params.viewedAt)}</td>
                                    </tr>
                                </table>

                                <table role="presentation" cellPadding="0" cellSpacing="0" style="margin:0 0 16px 0;">
                                    <tr>
                                        <td align="center" style="border-radius:14px;background-color:#0ea5e9;">
                                            <a href="${escapeHtml(quoteUrl)}" style="display:inline-block;padding:14px 20px;font-size:15px;line-height:22px;font-weight:700;color:#ffffff;text-decoration:none;">View quote details</a>
                                        </td>
                                    </tr>
                                </table>

                                <p style="margin:0 0 20px 0;font-size:15px;line-height:24px;color:#cbd5e1;">${escapeHtml(quoteUrl)}</p>
                                <p style="margin:0;font-size:15px;line-height:24px;color:#cbd5e1;">— The QuotePro Team</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>`.trim();
}

export async function sendQuoteViewedEmail(params: {
    userEmail: string;
    userName: string;
    clientName: string;
    quoteNumber: string;
    totalAed: number;
    viewedAt: string;
    quoteId: string;
}) {
    return getResendClient().emails.send({
        from: RESEND_FROM_EMAIL,
        to: params.userEmail,
        subject: 'Your quote was viewed! 📋',
        html: buildQuoteViewedEmailHtml({
            userName: params.userName,
            clientName: params.clientName,
            quoteNumber: params.quoteNumber,
            totalAed: params.totalAed,
            viewedAt: params.viewedAt,
            quoteId: params.quoteId,
        }),
    });
}
