# QuotePro

## Resend Email Setup

Quote viewed notifications use [`lib/email.ts`](lib/email.ts) and the API route [`app/api/email/quote-viewed/route.ts`](app/api/email/quote-viewed/route.ts).

### Environment Variables

Add these values to your local environment based on [`.env.local.example`](.env.local.example):

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_SITE_URL`

For MVP testing, you can keep [`RESEND_FROM_EMAIL`](.env.local.example) set to `QuotePro <onboarding@resend.dev>`.

### DNS Configuration for Production

When switching from Resend's testing domain to your own sending domain such as `hello@quotepro.ae`, configure the required DNS records inside Resend:

- SPF record
- DKIM record
- Optional DMARC record for better deliverability

After DNS verification succeeds in Resend, update [`RESEND_FROM_EMAIL`](.env.local.example) to your production sender, for example `QuotePro <hello@quotepro.ae>`.

### Free Tier Notes

Resend's free tier supports up to 100 emails per day, which is sufficient for MVP quote view notifications.

### Day 5 Features

This project now includes:

- Monthly quote usage tracking via [`app/api/quotes/usage/route.ts`](app/api/quotes/usage/route.ts)
- Free tier enforcement inside [`app/api/quotes/generate/route.ts`](app/api/quotes/generate/route.ts)
- Quote usage UI via [`components/UsageBanner.tsx`](components/UsageBanner.tsx)
- Upgrade flow UI via [`components/UpgradeModal.tsx`](components/UpgradeModal.tsx) and [`app/app/upgrade/page.tsx`](app/app/upgrade/page.tsx)
- Quote viewed notification emails sent through [`app/api/email/quote-viewed/route.ts`](app/api/email/quote-viewed/route.ts)
