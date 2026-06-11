# PROJECT_STATE.md

**AI Memory Context File**  
Last Updated: 2026-06-11

---

## 📋 Project Overview

**QuotePro** is a B2B SaaS platform for generating professional, AI-powered quotes in multiple currencies with one-click sharing. Users create detailed project quotes with line items, taxes, and branding, then share them via public links or WhatsApp for client acceptance/rejection tracking.

---

## 🛠️ Tech Stack

### Core Framework & Language
- **Next.js 14.2.33** (App Router)
- **TypeScript 5.6.2**
- **React 18.3.1**

### Database & Authentication
- **Supabase** (PostgreSQL + Auth)
  - `@supabase/supabase-js` ^2.49.8
  - `@supabase/ssr` ^0.5.2

### Styling & UI
- **Tailwind CSS** ^3.4.13
- **Radix UI** (Dialog, Select, Accordion, Dropdown)
- **Framer Motion** 11.3.31
- **Lucide React** (Icons)
- **class-variance-authority** + **clsx** + **tailwind-merge**

### AI & PDF Generation
- **OpenAI** ^6.42.0 (Quote generation via GPT)
- **@react-pdf/renderer** ^4.5.1 (PDF export)

### Payment & Email
- **Stripe** ^17.7.0 (Subscriptions & webhooks)
- **@stripe/stripe-js** ^5.8.0
- **Resend** ^4.8.0 (Email notifications)

### Forms & Validation
- **React Hook Form** ^7.77.0
- **Zod** ^4.4.3
- **@hookform/resolvers** ^5.4.0

---

## 🗄️ Database Schema Summary

### **`profiles`** (User Accounts)
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | References `auth.users` |
| `email` | text | Unique, not null |
| `full_name` | text | User's full name |
| `company_name` | text | User's company (for branding) |
| `phone` | text | Contact phone |
| `is_subscribed` | boolean | Active subscription flag |
| `plan` | text | `'free'`, `'starter'`, `'growth'` |
| `stripe_customer_id` | text | Stripe customer reference |
| `stripe_subscription_id` | text | Stripe subscription reference |
| `country_code` | text | ISO country code (geo-pricing) |
| `currency_code` | text | User's default currency |
| `referral_code` | text | Unique referral code |
| `referred_by` | text | Referrer's code (if applicable) |
| `bonus_quotes` | integer | Bonus quotes from referrals |
| `created_at`, `updated_at` | timestamptz | Timestamps |

### **`clients`** (Quote Recipients)
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | Auto-generated |
| `user_id` | uuid (FK) | Owner reference |
| `name` | text | Client name |
| `company` | text | Client company (nullable) |
| `email` | text | Client email (nullable) |
| `phone` | text | Client phone (nullable) |
| `created_at` | timestamptz | Timestamp |

### **`quotes`** (Main Quote Records)
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | Auto-generated |
| `user_id` | uuid (FK) | Owner reference |
| `client_id` | uuid (FK) | Client reference |
| `quote_number` | text | Human-readable ID |
| `status` | text | `'draft'`, `'review'`, `'sent'`, `'pending'`, `'accepted'`, `'rejected'`, `'won'`, `'lost'` |
| `project_title` | text | Quote title |
| `project_type` | text | `'Maintenance'`, `'Contracting'`, `'Interior Design'`, `'Logistics'`, `'Events'` |
| `brief_text` | text | Original project brief |
| `pdf_mode` | text | `'bilingual'` (English + Arabic) or `'english_only'` |
| `line_items` | jsonb | Array of `{ item_number, description, unit, quantity, unit_rate_aed, subtotal_aed }` |
| `subtotal_aed` | numeric(12,2) | Sum of line items |
| `vat_5_aed` | numeric(12,2) | Tax amount (legacy name) |
| `total_aed` | numeric(12,2) | Grand total |
| `currency` | text | `'AED'`, `'PKR'`, `'USD'`, `'GBP'`, `'SAR'` |
| `tax_rate` | numeric | Dynamic tax % (e.g., 5 for AED, 18 for PKR) |
| `share_token` | text | Unique public share token |
| `pdf_url` | text | Supabase Storage URL |
| `viewed_at` | timestamptz | When client first viewed |
| `created_at`, `updated_at` | timestamptz | Timestamps |

### **`referrals`**
| Column | Type | Notes |
|--------|------|-------|
| `user_id` | uuid | The referred user |
| `referrer_id` | uuid | The user who referred |
| `created_at` | timestamptz | Timestamp |

### **Supabase Storage**
- **Bucket:** `quotes-pdfs` (public, auto-delete on row delete)

---

## ✨ Core Features Implemented

### 1. **AI-Powered Quote Generation**
- Users submit a project brief (min 20 chars), client info, and approximate value
- OpenAI GPT generates structured line items with descriptions, quantities, unit rates
- Route: [`/api/quotes/generate`](app/api/quotes/generate/route.ts)
- Uses [`types/index.ts`](types/index.ts) schemas for validation (Zod)

### 2. **Dynamic Currency & Tax System**
- **Supported Currencies:** AED (5% VAT), PKR (18% tax), USD (0%), GBP (20% VAT), SAR (15% VAT)
- Config: [`lib/currency-config.ts`](lib/currency-config.ts)
- Auto-detection via timezone or IP geolocation
- Users can override currency per quote

### 3. **Multi-Language PDF Generation**
- **Bilingual Mode:** English + Arabic (RTL) side-by-side
- **English-Only Mode:** Standard LTR layout
- Uses [`@react-pdf/renderer`](lib/pdf/QuoteDocument.tsx) with custom Cairo font for Arabic
- Route: [`/api/quotes/[id]/generate-pdf`](app/api/quotes/[id]/generate-pdf/route.ts)
- Public PDF route: [`/api/quotes/public/[token]/generate-pdf`](app/api/quotes/public/[token]/generate-pdf/route.ts)

### 4. **Public Shareable Links**
- Each quote gets a unique `share_token` (UUID)
- Public view route: [`/quote/[token]`](app/quote/[token]/page.tsx)
- Displays quote details, line items, totals, and action buttons
- Tracks first view timestamp (`viewed_at`) and sends email notification

### 5. **One-Click WhatsApp Sharing**
- Component: [`components/ShareButtons.tsx`](components/ShareButtons.tsx)
- Generates `wa.me` link with pre-filled message containing public quote URL
- Share API route: [`/api/quotes/[id]/share`](app/api/quotes/[id]/share/route.ts)

### 6. **Client Action Buttons (Accept/Decline)**
- Component: [`components/quotes/QuoteActionButtons.tsx`](components/quotes/QuoteActionButtons.tsx)
- Public view: [`components/quotes/PublicQuoteView.tsx`](components/quotes/PublicQuoteView.tsx)
- Updates quote `status` to `'accepted'` or `'rejected'`
- Status update routes:
  - Private: [`/api/quotes/[id]/status`](app/api/quotes/[id]/status/route.ts)
  - Public: [`/api/quotes/public/[token]/status`](app/api/quotes/public/[token]/status/route.ts)

### 7. **Admin Dashboard with Pipeline Metrics**
- Route: [`/app/dashboard`](app/app/dashboard/page.tsx)
- Displays:
  - Quotes created this month
  - Pipeline value by currency (sum of `status: 'sent'` or `'pending'`)
  - Won value by currency (sum of `status: 'won'` or `'accepted'`)
  - List of all user quotes with status badges
- API: [`/api/quotes/stats`](app/api/quotes/stats/route.ts)

### 8. **Dynamic Agency Branding**
- User profile fields (`company_name`, `phone`) auto-populate PDFs
- Profile management: [`/app/profile`](app/app/profile/page.tsx)
- Profile form: [`components/ProfileForm.tsx`](components/ProfileForm.tsx)

### 9. **Quote Revision System**
- Users can request AI to revise generated quotes before saving
- Component: [`components/RevisionChat.tsx`](components/RevisionChat.tsx)
- Route: [`/api/quotes/revise`](app/api/quotes/revise/route.ts)
- Tracks revision history in local state

### 10. **Subscription Tiers & Usage Limits**
- **Free Plan:** 5 quotes/month
- **Starter Plan:** 30 quotes/month (AED 299 / USD 29 / PKR 2,500)
- **Growth Plan:** Unlimited quotes (AED 599 / USD 59 / PKR 5,999)
  - Fair use limit: 1,000/month server-side
- Geo-based pricing via [`lib/pricing.ts`](lib/pricing.ts)
- Usage tracking: [`lib/quote-usage.ts`](lib/quote-usage.ts)
- Usage API: [`/api/quotes/usage`](app/api/quotes/usage/route.ts)

### 11. **Stripe Integration**
- Checkout session creation: [`/api/billing/create-checkout-session`](app/api/billing/create-checkout-session/route.ts)
- Webhook handler: [`/api/webhooks/stripe`](app/api/webhooks/stripe/route.ts)
- Manual payment notify: [`/api/billing/manual-payment-notify`](app/api/billing/manual-payment-notify/route.ts)
- Stripe config: [`lib/stripe.ts`](lib/stripe.ts)

### 12. **Referral System**
- Each user gets a unique `referral_code`
- Referring users earn bonus quotes when referrals sign up
- Route: [`/refer`](app/refer/page.tsx)
- Component: [`components/ReferralCard.tsx`](components/ReferralCard.tsx)
- RPC function: `increment_bonus_quotes` (Supabase)
- Migration: [`supabase/migrations/20260607220000_day7_referral.sql`](supabase/migrations/20260607220000_day7_referral.sql)

### 13. **Email Notifications (Resend)**
- Sends email when client views a quote for the first time
- Route: [`/api/email/quote-viewed`](app/api/email/quote-viewed/route.ts)
- Email utility: [`lib/email.ts`](lib/email.ts)
- Free tier: 100 emails/day

### 14. **View Tracking**
- Tracks when clients view public quotes (`viewed_at` timestamp)
- Route: [`/api/quotes/[id]/track-view`](app/api/quotes/[id]/track-view/route.ts)

---

## 📂 Project Structure / Routing

### **App Routes** (Next.js App Router)
```
app/
├── page.tsx                          → Landing page
├── auth/
│   ├── page.tsx                      → Magic link auth
│   └── callback/route.ts             → Supabase auth callback
├── app/                              → Authenticated routes (middleware protected)
│   ├── dashboard/page.tsx            → Main dashboard with stats
│   ├── quotes/new/page.tsx           → Create new quote (form + preview)
│   ├── clients/page.tsx              → Client management
│   ├── profile/page.tsx              → Profile settings
│   ├── upgrade/page.tsx              → Upgrade/pricing page
│   └── manual-payment/page.tsx       → Manual payment instructions
├── quote/[token]/page.tsx            → Public quote view (no auth)
├── quotes/[id]/page.tsx              → Private quote detail (auth required)
└── refer/page.tsx                    → Referral landing page
```

### **API Routes**
```
app/api/
├── quotes/
│   ├── generate/route.ts             → AI quote generation
│   ├── revise/route.ts               → AI quote revision
│   ├── confirm/route.ts              → Save draft to DB
│   ├── usage/route.ts                → Monthly usage check
│   ├── stats/route.ts                → Dashboard metrics
│   ├── [id]/
│   │   ├── route.ts                  → CRUD operations
│   │   ├── generate-pdf/route.ts     → Private PDF generation
│   │   ├── share/route.ts            → Generate share token
│   │   ├── status/route.ts           → Update quote status
│   │   └── track-view/route.ts       → Track client views
│   └── public/[token]/
│       ├── generate-pdf/route.ts     → Public PDF generation
│       └── status/route.ts           → Public status update
├── billing/
│   ├── create-checkout-session/      → Stripe checkout
│   └── manual-payment-notify/        → Manual payment webhook
├── email/
│   └── quote-viewed/route.ts         → Email notification
├── referrals/
│   └── credit/route.ts               → Referral bonus credit
└── webhooks/
    └── stripe/route.ts               → Stripe webhook handler
```

### **Key Components**
```
components/
├── quotes/
│   ├── QuoteForm.tsx                 → Multi-step quote creation
│   ├── QuotePreview.tsx              → Preview generated quote
│   ├── EditableQuote.tsx             → Edit quote line items
│   ├── RevisionChat.tsx              → AI revision interface
│   ├── PublicQuoteView.tsx           → Public quote display
│   ├── QuoteActionButtons.tsx        → Accept/Decline buttons
│   ├── QuoteListItem.tsx             → Dashboard quote card
│   ├── LineItemCard.tsx              → Line item display
│   └── TotalsSummary.tsx             → Subtotal/Tax/Total
├── dashboard/
│   ├── StatCard.tsx                  → Metric card
│   └── UsageBanner.tsx               → Usage limit banner
├── pricing/
│   ├── PricingCard.tsx               → Pricing tier card
│   └── UpgradeSheetClient.tsx        → Upgrade modal
├── layout/
│   ├── AppShell.tsx                  → Main app layout
│   ├── Sidebar.tsx                   → Desktop sidebar
│   ├── BottomNav.tsx                 → Mobile bottom nav
│   └── PageHeader.tsx                → Page title header
├── landing/
│   ├── LandingHero.tsx               → Hero section
│   ├── FeaturesSection.tsx           → Features grid
│   ├── PricingSection.tsx            → Pricing table
│   ├── FAQAccordion.tsx              → FAQ section
│   └── Footer.tsx                    → Footer
└── ui/                               → Reusable UI primitives
```

### **Utilities & Config**
```
lib/
├── supabase/
│   ├── client.ts                     → Client-side Supabase client
│   └── server.ts                     → Server-side Supabase client
├── pdf/
│   ├── QuoteDocument.tsx             → React-PDF document structure
│   └── fonts.ts                      → Font registration (Cairo)
├── currency-config.ts                → Currency symbols, tax rates
├── pricing.ts                        → Geo-pricing logic
├── quote-usage.ts                    → Usage limit calculations
├── stripe.ts                         → Stripe client config
├── email.ts                          → Resend email utility
├── referral.ts                       → Referral logic
└── useQuoteDraft.ts                  → Quote draft state hook
```

---

## 🔄 Current Status & Next Steps

### ✅ Completed (Production-Ready)
- AI quote generation with OpenAI
- Multi-currency support (5 currencies)
- Dynamic tax calculation per currency
- Bilingual PDF generation (English + Arabic)
- Public shareable links with tracking
- WhatsApp sharing integration
- Client accept/decline actions
- Dashboard with pipeline metrics
- Subscription tiers with Stripe
- Referral system with bonus quotes
- Email notifications (Resend)
- Profile/branding customization
- Usage limits & enforcement
- Row-level security (RLS) policies

### 🚧 Known Issues / Technical Debt
- Legacy column naming: `subtotal_aed`, `vat_5_aed`, `total_aed` (should be currency-agnostic)
- `line_items` stored as JSONB (could normalize to separate table if complex queries needed)
- PDF generation is synchronous (could move to background queue for large quotes)
- No multi-tenant team features yet (single-user accounts only)

### 🎯 Potential Next Features
- [ ] Quote templates for recurring projects
- [ ] Multi-language UI (not just PDFs)
- [ ] Advanced analytics (conversion rates, avg. quote value)
- [ ] Client portal with quote history
- [ ] E-signature integration
- [ ] Invoice generation from accepted quotes
- [ ] Export to Excel/CSV
- [ ] Dark mode
- [ ] Mobile app (React Native)

---

## 🔐 Environment Variables Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_AED_STARTER=
STRIPE_PRICE_AED_GROWTH=
STRIPE_PRICE_PKR_STARTER=
STRIPE_PRICE_PKR_GROWTH=
STRIPE_PRICE_USD_STARTER=
STRIPE_PRICE_USD_GROWTH=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Site
NEXT_PUBLIC_SITE_URL=
```

---

## 📊 Metrics & Business Logic

### Quote Statuses
- `draft` → Not yet shared
- `review` → Being edited
- `sent` / `pending` → Awaiting client response
- `accepted` / `won` → Client approved
- `rejected` / `lost` → Client declined

### Usage Limits
- **Free:** 5 quotes/month
- **Starter:** 30 quotes/month
- **Growth:** Unlimited (UI shows 999,999, server enforces 1,000 fair use)

### Geo-Pricing
- **GCC Countries (AE, SA, OM, QA, BH, KW):** AED pricing
- **Pakistan (PK):** PKR pricing
- **Rest of World:** USD pricing

### Currency Tax Rates
- AED: 5% VAT
- PKR: 18% tax
- USD: 0% (no tax)
- GBP: 20% VAT
- SAR: 15% VAT

---

## 🧪 Development Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run type-check   # TypeScript validation
```

---

**End of PROJECT_STATE.md** — This file is your AI assistant's memory. Update it as the project evolves.
