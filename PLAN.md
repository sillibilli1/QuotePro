# AI-Powered Quotation & Proposal Generator — Product Plan
**For UAE SMBs: Contractors, Maintenance, Interior Design, Logistics, Events**
**Team: 2 founders (1 technical in Pakistan, 1 sales in UAE) | Budget: Near Zero | Goal: First paying customer in 6 weeks**
**Stack: Next.js + Supabase + Vercel + Claude API (Gemini fallback)**

---

# 1. MVP FEATURE LIST

Stop dreaming. You have 6 weeks and two people. Cut everything that doesn't directly lead to a signed quote and a paid invoice. Here is what ships.

---

## Feature 1: Quick Quote Builder

**What the user does:**
Opens the app, selects a project type (e.g., "Office Renovation — 2,000 sqft"), picks a client from their contacts or creates a new one, and fills in a short form: project scope, estimated duration, key requirements. Takes under 5 minutes.

**What the system does:**
Stores the client. Stores the quote draft. Passes the form data to Claude with a system prompt that outputs a structured quote with line items, descriptions, unit rates, quantities, subtotals, VAT, and total. Displays it instantly for review. User edits inline. Generates a PDF on confirm.

**Why it cannot be cut:**
This is the entire product. No Quick Quote Builder, no product. Everything else is a feature of this.

---

## Feature 2: One-Click PDF Generation (Bilingual Arabic + English)

**What the user does:**
Reviews the AI-generated quote, makes any edits, then taps "Generate PDF." Receives a professional bilingual PDF (English primary, Arabic right column where applicable — client name, company name, totals, key terms) formatted for UAE business standards. Shares it via WhatsApp, email, or in-person.

**What the system does:**
Renders a React component (using @react-pdf/renderer) into a PDF on the server (Vercel serverless function). Embeds a secondary Arabic font pass using a static mapping of key fields. Delivers a downloadable or shareable link within seconds.

**Why it cannot be cut:**
UAE business runs on WhatsApp-shared PDFs. A contractor who cannot send a polished quote in under 60 seconds loses the job to whoever does. This is the moment of value delivery. If the PDF looks unprofessional or is English-only, you have no sale.

**Cut from MVP:** Auto-layout templates, brand logo upload, custom color schemes. None of these close the first deal.

---

## Feature 3: Client & Quote History

**What the user does:**
Returns to the app and sees their last 10 quotes. Taps any to view, duplicate as a base for a new quote, or mark as "Won/Lost/Pending." Creates a new quote from a past one in one tap.

**What the system does:**
Queries Supabase for all quotes belonging to the user, sorted by date. Shows status tags. Duplicating a quote pre-fills the form and invokes Claude to re-price based on updated scope.

**Why it cannot be cut:**
A UAE contractor sends 3–5 quotes per week. They will not use your product if they have to re-enter every client from scratch every time. Repeat usage is the only path to retention and word-of-mouth referrals — the only acquisition channel available to a zero-budget team.

---

## Feature 4: WhatsApp-Ready Share Link

**What the user does:**
Taps "Share via WhatsApp" on any quote. The system generates a secure, temporary web page (hosted on Vercel) showing the quote in a read-only mobile-friendly view. User sends the link via WhatsApp. Client opens it on their phone — no app download, no login required.

**What the system does:**
Creates a signed, expiring URL for the quote. Renders a separate Next.js page at `/quote/[token]` that displays formatted quote content. Tracks whether the link was viewed (stores timestamp in Supabase). Optionally sends a follow-up reminder via a simple scheduled job.

**Why it cannot be cut:**
WhatsApp is the default business communication channel in the UAE. Your PDF can be shared, but a WhatsApp-native link with a read-only viewer that tracks views is the competitive advantage. A contractor can say "I sent you the quote on WhatsApp" and have proof the client opened it. This is the "I need this" moment.

---

## Feature 5: Basic Dashboard (Quotes This Month)

**What the user does:**
Opens the app and sees: number of quotes sent this month, their statuses (Pending/Won/Lost), and total estimated value. That's it.

**What the system does:**
Aggregates quote records from Supabase grouped by current month, filtered by user. Shows simple count + sum. No charts, no filters, no exports.

**Why it cannot be cut:**
Every small business owner wants to know "how am I doing this month?" at a glance. If you cannot show this in the MVP, you look like a demo, not a product. A contractor who sees their 3 pending quotes and knows the total value of work in the pipeline feels ownership. Without this, they feel like they're using a toy.

---

## What Is NOT in MVP (And Why)

| Feature | Reason for Cut |
|---|---|
| Proposal templates (long-form) | Quotation is the entry point. Proposals come after the team has revenue. |
| AI tone/brand customization | Nice in month 3. First customer needs working quotes, not customization. |
| Multi-user/team accounts | Two founders are the team. Sharing comes after proving the core loop. |
| E-signature integration | You need a paying customer before you add friction. |
| Arabic-first UI | English-first with Arabic on the PDF is correct for MVP. Full Arabic UI is month 3. |
| Inventory/price list management | Store a few line items manually per quote for now. Full inventory is month 4+. |
| Email automation sequences | Not before you have 20 paying customers. |
| Analytics / pipeline reports | The basic dashboard covers this for MVP. |

---

# 2. POST-MVP ROADMAP (Months 2–6)

## Phase 1: Trust & Stickiness (Months 2–3)

---

### F1.1: Client Portal Login

**Pain point solved:** UAE business owners lose track of quotes because clients have no way to view status or accept without downloading PDFs. Quote status gets stuck at "Sent."

**Customer segment:** All SMBs, but especially interior design and events where client approval cycles are long (2–4 weeks).

**Complexity:** Medium

The shareable link becomes a login page. Client creates a simple account (email + name only) to view quote history, accept or request changes, and leave a yes/no on the quote. Owner gets notified. Eliminates the "did you get my quote?" WhatsApp loop.

---

### F1.2: Recurring Quote Templates

**Pain point solved:** Contractors doing maintenance contracts (monthly or quarterly) spend 45 minutes each cycle re-entering the same line items with minor changes.

**Customer segment:** Maintenance companies, cleaning services, security installers — high-frequency repeat business.

**Complexity:** Low

User creates a template from any past quote. Template stores line item structure but not prices. Reuse with one tap, prices update via AI re-pricing with a "apply last quarter's rates + 5% inflation" prompt.

---

### F1.3: Arabic-First UI Toggle

**Pain point solved:** Emirati and Saudi-owned businesses (especially in government supply chains and construction) prefer an Arabic-dominant interface. English-first loses credibility with this segment.

**Customer segment:** UAE national-owned SMEs, government-linked contractors.

**Complexity:** Medium

Full RTL Arabic interface. Arabic stored as primary field in database (client_name_ar, company_name_ar). Toggle in user settings. PDF becomes Arabic-primary with English secondary column.

---

## Phase 2: Revenue Intelligence (Months 3–4)

---

### F2.1: Quote-to-Invoice Conversion

**Pain point solved:** Once a quote is accepted, the owner manually copies it into an invoice or uses a separate tool. This is error-prone, time-consuming, and breaks the workflow.

**Customer segment:** All SMBs, especially logistics and events where invoicing is frequent.

**Complexity:** Medium

One-tap conversion of accepted quote to invoice. Adds invoice number (auto-generated), adjusts terms (removes "valid for 30 days"), adds payment instructions. PDF switches to invoice template. Stores as separate record linked to original quote.

---

### F2.2: Win Rate Tracking

**Pain point solved:** Owners don't know which quote values win vs. lose. They bid blind. A maintenance company quoting 15 jobs at 5% margin vs. 8% margin doesn't know which to prioritize.

**Customer segment:** Contractors and logistics companies who quote on tenders regularly.

**Complexity:** Low

On every quote, owner marks Won/Lost. Dashboard shows win rate by project type, average deal size, average time to close. Simple bar charts. No BI tool needed.

---

### F2.3: Subcontractor Cost Import

**Pain point solved:** Maintenance and contracting companies get quotes from their own suppliers (plumbers, electricians, material vendors). They currently copy these into the quote manually, losing context and margins.

**Customer segment:** General contractors, fit-out companies.

**Complexity:** High

User uploads a supplier quote (PDF or photo). AI extracts line items, prices, quantities. Auto-populates a cost section in the quote. Owner sets markup percentage. Generates margin-per-line visible only to the owner on the PDF.

---

## Phase 3: Expansion (Months 4–6)

---

### F3.1: Team Collaboration (2–5 users)

**Pain point solved:** As soon as a company grows beyond one person, the founder's quotes and the sales team's quotes are in different places. Jobs get double-quoted or lost.

**Customer segment:** Growing SMBs with a sales rep plus operations manager.

**Complexity:** High

Role-based access (Owner, Sales, Viewer). Quotes assigned to team members. Activity log (who viewed, who edited, when). Per-seat pricing introduced at this point.

---

### F3.2: Tender Document Builder

**Pain point solved:** Government contracts and large commercial projects require submissions in specific formats (UAE federal tender format, ADNOC, municipalities). Building these from scratch takes days.

**Customer segment:** Large contractors, government-facing SMBs.

**Complexity:** High

AI takes a client brief (pasted text) and generates a tender response document in standard UAE format: cover letter, technical proposal, commercial offer, company credentials. Outputs as formatted PDF. Not a quote — a full proposal.

---

### F3.3: Payment Link Integration

**Pain point solved:** UAE clients delay payment for weeks because the invoice requires a bank transfer or a visit. Small SMBs need faster cash flow.

**Customer segment:** Events, interior design, logistics — industries with upfront deposits.

**Complexity:** Medium

Stripe or Tabby integration embedded in the invoice. Client can pay a deposit (50%) or full amount via card. Funds land in the owner's bank account within 2 business days. Owner sees payment status on the dashboard.

---

# 3. THE ONE SCREEN THAT SELLS

## Scene: A UAE contractor is sitting in his office in Sharjah at 8 AM before workers arrive.

He opens WhatsApp. A message from a friend: "Bro, there's this app that makes your quotes in 5 minutes. My cousin used it for his fit-out company."

He clicks the link. It opens in his browser. There is no app to download. No email to verify. Just a clean screen.

---

## Screen: Quote Builder — Mobile-First

**Top bar (sticky):**
- App logo (left): "QuotePro" — simple, white on teal, readable at small size
- User avatar + "My Quotes" button (right): shows he is logged in, can return to history

**Hero section (above the fold, visible without scrolling):**

```
[Subheading in small gray]: Last quote sent 2 days ago — AED 45,000 — Pending

[Big bold heading]:
"New Quote — 60 seconds"

[Subtext below heading]:
Type what you need. Get a professional quote. Send in one tap.
```

**The input section (the heart of the screen):**

```
[Label above field]: What are you quoting for?

[Large text input, placeholder: "e.g. Villa AC installation for 4-bedroom home"]

[Secondary row — two fields side by side on mobile]:
  [Dropdown: Project Type]
    — Maintenance
    — Contracting
    — Interior Design
    — Logistics
    — Events
    — Other

  [Text field: Approximate value in AED]
    — Placeholder: "e.g. 35,000"
    — Numeric keyboard on mobile

[Label]: Client name
[Text input]

[Label]: Client company (optional)
[Text input]
```

**Primary CTA button (full width, high contrast):**

```
[Large button]:
"🔮 Generate My Quote"
```

**Below the button — trust signals (small text, gray):**

```
"No account needed to share • Looks professional • Works on WhatsApp"
```

---

**This is the screen that makes them say "I need this." Here's why:**

1. **"60 seconds"** — UAE SMB owners are time-poor. They quote while on site, between meetings, or at 7 AM before the workday starts. The promise of speed is the hook.

2. **"New Quote" (not "Create Quote")** — casual language matches how they think. They're not doing admin; they're doing their job.

3. **Project type dropdown** — shows the app understands their industry, not a generic "category." Maintenance vs. Contracting vs. Interior Design triggers different mental models. The app feels built *for them*.

4. **"Looks professional"** — this is the real fear. They are sending quotes on plain text WhatsApp messages right now. They know they lose jobs because their quote looks like a text message. The promise of professional output is the conversion trigger.

5. **WhatsApp reference** — explicitly named. This is where they live. If you said "share via email," they'd close the tab. WhatsApp is the lingua franca of UAE B2B.

6. **"No account needed to share"** — the friction killer. They do not want to sign up, verify email, set password. They want to quote *now*. Account creation (or non-creation for the share recipient) is deferred. The owner creates an account once; the client never does.

7. **Last quote status** — the line "Last quote sent 2 days ago — Pending" triggers FOMO and shows ownership. They already have data in the system. Quitting means losing it.

---

# 4. TECHNICAL ARCHITECTURE

## 4.1 Quote Generation Flow (End to End)

```
User Input (mobile web form)
        │
        ▼
Next.js API Route: /api/quotes/generate
        │
        ├── Validate inputs (project type, brief text, client info)
        │
        ├── Supabase: Upsert client (if new) → get client_id
        │
        ├── Supabase: Create quote record (status: "draft") → get quote_id
        │
        ├── Build Prompt for Claude API:
        │   - System prompt: UAE SMB quote writer persona
        │   - User prompt: project details + client info
        │
        ├── Call Claude API → structured JSON response
        │
        ├── Validate AI response (line items, totals, VAT calculation)
        │
        ├── Supabase: Update quote record with AI output (status: "review")
        │
        ├── Return quote object to frontend
        │
        ▼
Frontend: Display editable quote
        │
        ├── User edits line items (inline editing)
        ├── User confirms
        │
        ▼
Next.js API Route: /api/quotes/[id]/generate-pdf
        │
        ├── Server-side: @react-pdf/renderer builds PDF
        │   - English layout (primary)
        │   - Arabic field overlay (static mapping)
        │
        ├── Upload PDF to Supabase Storage
        │
        ├── Supabase: Update quote record (pdf_url, status: "sent")
        │
        ├── Return PDF URL + shareable token
        │
        ▼
Frontend: Show "Send via WhatsApp" + "Download PDF" buttons
        │
        ├── WhatsApp share: open wa.me link with pre-filled message + PDF URL
        │
        └── Shareable link: `/quote/[token]` — read-only mobile page
```

---

## 4.2 AI Usage — Exact Prompt Structure

### System Prompt (Stored in environment variable)

```
You are an expert quotation writer for UAE small and medium businesses.
You specialize in: contracting, maintenance, interior design, logistics, and events.

Your quotes follow UAE business standards:
- Include 5% VAT calculated correctly
- Use AED currency throughout
- Professional tone — formal but not robotic
- Line items include: description, unit, quantity, unit rate (AED), subtotal (AED)
- Include standard terms: validity period (30 days), payment terms (50% advance, 50% on completion)
- Scope descriptions are specific, not vague — "Supply and install 4 units of 2-ton Daikin split AC systems" not "AC installation"

When you receive project details, you MUST output a valid JSON object.
Do not include any explanatory text. Only the JSON object.

Output format:
{
  "project_title": "string",
  "client_name": "string",
  "client_company": "string | null",
  "line_items": [
    {
      "item_number": number,
      "description": "string",
      "unit": "string",
      "quantity": number,
      "unit_rate_aed": number,
      "subtotal_aed": number
    }
  ],
  "subtotal_aed": number,
  "vat_5_percent_aed": number,
  "total_aed": number,
  "validity_days": 30,
  "payment_terms": "50% advance on confirmation, 50% on project completion",
  "estimated_duration": "string",
  "notes": "string | null"
}
```

### User Prompt Template

```
Generate a professional quotation with the following details:

Project Type: {project_type}
Project Description: {brief_text}
Client Name: {client_name}
Client Company: {client_company}
Approximate Value (if provided): {approx_value}

If approximate value is provided, use it as a guide for pricing. If not provided, use your expertise in UAE market rates for this project type. Do not guess unrealistically — prices should be realistic for UAE SMB context (labor + materials + overhead).

Generate the line items for this quote. Use realistic UAE market rates.
```

---

## 4.3 Arabic + English Bilingual PDF Approach

**Constraint:** Full AI-powered Arabic text generation is out of scope for MVP (too expensive, too slow, too risky for accuracy). Arabic elements on the PDF will be static-mapped.

**Approach:**

1. **PDF is English-primary** — all AI-generated content is in English. This is acceptable for UAE B2B. Most contracts, even with Emirati clients, are signed in English.

2. **Arabic overlay fields** — specific fields are stored in Arabic as static values in the database. When the PDF renders, those fields appear in both columns:

| Field | English (Left) | Arabic (Right, RTL) |
|---|---|---|
| App Name | QuotePro | كوت برو |
| Quote Title | QUOTATION | عرض سعر |
| Client Name | {client_name} | {client_name_ar} |
| Company | {company} | {company_ar} |
| Subtotal | Subtotal | المجموع الفرعي |
| VAT (5%) | VAT 5% | الضريبة 5% |
| Total | TOTAL | الإجمالي |
| Currency | AED | درهم |

3. **Arabic font:** `Noto Sans Arabic` (Google Fonts, open source, free for commercial use). Embedded in PDF via @react-pdf/renderer.

4. **RTL layout:** Arabic column uses `direction: 'rtl'` in the PDF renderer layout. English remains LTR.

5. **Phase 2 (Month 3):** Full Arabic-first PDF with AI-generated Arabic scope descriptions for clients who request it. At that stage, integrate a translation pass (Claude with Arabic prompt) for the description field only.

---

## 4.4 Database Schema

**Provider:** Supabase (PostgreSQL)

### Tables

**profiles** (maps to auth.users)
```sql
id                  UUID PRIMARY KEY REFERENCES auth.users (id)
email               TEXT NOT NULL UNIQUE
full_name           TEXT
company_name        TEXT
phone               TEXT
country_code        TEXT DEFAULT 'AE'  -- ISO 3166-1 alpha-2: AE, PK, US, GB, etc.
currency_code       TEXT DEFAULT 'AED' -- AED, PKR, USD
created_at          TIMESTAMPTZ DEFAULT NOW()
updated_at          TIMESTAMPTZ DEFAULT NOW()
is_subscribed       BOOLEAN DEFAULT false
plan                TEXT  -- 'free', 'starter', 'growth'
stripe_customer_id  TEXT
stripe_subscription_id TEXT
```

**clients**
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID REFERENCES auth.users (id) ON DELETE CASCADE
name            TEXT NOT NULL
name_ar         TEXT
company         TEXT
company_ar      TEXT
email           TEXT
phone           TEXT
notes           TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
```

**quotes**
```sql
id                  UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id             UUID REFERENCES auth.users (id) ON DELETE CASCADE
client_id           UUID REFERENCES clients(id)
quote_number        TEXT NOT NULL  -- auto-generated: "QP-2024-0042"
status              TEXT DEFAULT 'draft'  -- draft | review | sent | pending | won | lost | expired

project_title       TEXT
project_type        TEXT  -- maintenance | contracting | interior_design | logistics | events
brief_text          TEXT  -- original user input

ai_output           JSONB  -- Claude response
line_items          JSONB  -- normalized line items array

subtotal_aed        NUMERIC(12,2)
vat_5_aed           NUMERIC(12,2)
total_aed           NUMERIC(12,2)
approx_value_aed    NUMERIC(12,2)  -- user-provided estimate vs AI estimate

validity_days       INTEGER DEFAULT 30
payment_terms       TEXT
estimated_duration  TEXT
notes               TEXT

pdf_url             TEXT  -- Supabase Storage URL
share_token         TEXT UNIQUE  -- for /quote/[token] URL

sent_at             TIMESTAMPTZ
viewed_at           TIMESTAMPTZ  -- when client opened share link

created_at          TIMESTAMPTZ DEFAULT NOW()
updated_at          TIMESTAMPTZ DEFAULT NOW()
```

**quote_templates** (added in Month 2)
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID REFERENCES auth.users (id) ON DELETE CASCADE
name            TEXT NOT NULL
project_type    TEXT
line_items      JSONB  -- template structure without prices
default_notes   TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
```

**invoices** (added in Month 3)
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
quote_id        UUID REFERENCES quotes(id)
user_id         UUID REFERENCES auth.users (id) ON DELETE CASCADE
invoice_number  TEXT NOT NULL  -- "INV-2024-0015"
status          TEXT DEFAULT 'draft'  -- draft | sent | paid | overdue

total_aed       NUMERIC(12,2)
paid_amount_aed NUMERIC(12,2) DEFAULT 0
paid_at         TIMESTAMPTZ

payment_link    TEXT  -- Stripe/Tabby URL

created_at      TIMESTAMPTZ DEFAULT NOW()
```

### Relationships

```
auth.users 1──1 profiles
profiles 1──M clients
profiles 1──M quotes
profiles 1──M quote_templates
profiles 1──M invoices
clients 1──M quotes
quotes 1──1 invoices (optional)
quotes 1──M quote_sharings (future)
```

### Row Level Security (RLS)

- All tables have RLS enabled.
- `auth.uid()` used on every query.
- Clients, quotes, and templates are private to the user who created them.
- Share tokens use a separate public-facing endpoint with token validation (no RLS needed for read-only quote display).

### Indexes

```sql
CREATE INDEX idx_profiles_country ON profiles(country_code);
CREATE INDEX idx_quotes_user_id ON quotes(user_id);
CREATE INDEX idx_quotes_status ON quotes(status) WHERE status IN ('sent', 'pending');
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_quotes_share_token ON quotes(share_token);
```

---

## 4.5 Third-Party Services

| Service | Purpose | Cost | Decision |
|---|---|---|---|
| **Supabase** | Database + Auth + Storage | Free tier (500MB DB, 1GB storage, 50k monthly users) | Core. Cannot cut. |
| **Vercel** | Hosting + Serverless functions | Free tier (100GB bandwidth, serverless functions) | Core. Cannot cut. |
| **Claude API** | Quote generation AI | ~$0.01–0.03 per quote (claude-3-haiku for MVP speed/cost) | Core. Cannot cut. Use Haiku for MVP, Sonnet for post-MVP. |
| **@react-pdf/renderer** | Server-side PDF generation | Free (open source) | Core. Cannot cut. |
| **ipapi.co** | IP-based geo detection | Free tier (10,000 req/month for non-commercial use) | Core. Used for geo-pricing. |
| **WhatsApp Business API** | Not in MVP | — | Not needed. wa.me deep links work for free. |
| **Stripe** | Payment links | 2.9% + AED 1 per transaction | Core for Day 6. UAE Stripe account handles all currencies. |
| **Resend / SendGrid** | Transactional email | Free tier (100 emails/day on Resend) | Month 1 (for quote sent notifications). Use Resend. |
| **Domain** | Custom URL for the app | ~$10/year (.ae domain from Duplication or Etisalat) | Required. Own brand = trust. |

**Total third-party cost in MVP:** ~$5–15/month (Claude API calls at scale).

---

# 5. PRICING STRATEGY

## 5.1 Geo-Pricing Tiers

Pricing varies by detected country. Stripe account is registered in UAE (under sales co-founder) and handles all three currencies natively. Pakistani users pay via Stripe using their Visa/Mastercard — this works natively, no special integration needed.

| Plan | UAE / GCC (AED) | Pakistan (PKR) | Rest of World (USD) |
|---|---|---|---|
| **Free** | 0 | 0 | 0 |
| **Starter** | AED 299/month | PKR 2,500/month | $29/month |
| **Growth** | AED 599/month | PKR 5,999/month | $59/month |

**Quote limits per tier:**
- Free: 5 quotes/month
- Starter: 30 quotes/month
- Growth: Unlimited

**GCC countries** (default to AED): UAE, Saudi Arabia, Oman, Qatar, Bahrain, Kuwait.

---

## 5.2 Free Tier: YES — With Specific Rules

**Reasoning:**

UAE SMB owners do not pay for things they have not proven value on. You will not get a credit card from a contractor who has never used your product. The free tier is not generosity — it is a lead generation funnel.

**Rules for the free tier:**

1. **Limit to 5 quotes/month.** This is enough to prove the product works. It is not enough to run a business on. When they hit the limit, they either upgrade or they start over — both are useful signals (proved value vs. not yet).

2. **Watermark on PDFs.** "Generated with QuotePro" in small text. This is not shameful — it is marketing. When their client sees the quote and asks "what's this app?", the watermark becomes a referral.

3. **No team features on free tier.** Single user only. This prevents small teams from gaming the free tier.

4. **No API access.** Not relevant for SMBs.

5. **Collect email on sign-up.** The free tier is a list-building mechanism. You have near-zero marketing budget — the free tier users are your future paid customers and your future referral sources.

**What you do NOT give for free:** PDF without watermark, unlimited quotes, WhatsApp tracking, client portal access, invoice generation. These are the paid features that justify the upgrade.

---

## 5.3 First 10 Customers Strategy

**Goal:** 10 paying customers in 6 weeks, not 10,000 signups.

**Acquisition channel (zero budget):** The UAE sales founder's personal network + WhatsApp business communities.

**Week-by-week approach:**

| Weeks | Action | Why |
|---|---|---|
| 1–2 | Offer free tier + "first month free" to personal contacts in target industries | Remove all friction. They try it, it works, they tell their friends |
| 3–4 | Ask every free tier user who hits the 5-quote limit: "Would you like unlimited? It's [local price]/month" | They have proven the product. Upgrade moment. |
| 5–6 | Ask for referrals: "Do you know 2 other contractors who could use this?" | One happy customer → 3 more. UAE business runs on personal referrals. |
| Ongoing | Attend one UAE business networking event per month (Dubai Chamber, Abu Dhabi SME hub) | Face-to-face closes. Not for volume — for the first 10 paying customers, this is the fastest channel. |

**First 10 paid customers get:** Lifetime Starter plan at 50% discount (locked, never goes up). This is your anchor group. Treat them like co-founders. They will give you more product feedback than any survey.

---

## 5.4 When and How to Raise Prices

**Trigger 1: When you have 20 paying customers on the same plan.**
Do not raise prices before you have 20. You do not know if the price is right until 20 people have paid it. At 20, the price is validated.

**Trigger 2: When competitors charge more.**
Do not race to the bottom. If a competitor launches a similar product at higher price and you are lower, that is a signal your price is too low, not that you should match them. Raise and add one feature they don't have.

**Trigger 3: When your cost per quote exceeds 5% of revenue.**
If you are paying $0.05/quote in AI costs and charging $0.50/quote equivalent in revenue per quote, you have margin. If it flips, raise prices or cut AI costs.

**How to raise prices:**
- Never raise on existing customers (unless they are on a clearly temporary promotional rate).
- New customers see new prices.
- Communicate raises 60 days in advance via email to non-paying prospects on your list.
- The sales founder calls every customer personally before a price change. This is a retention move, not just communication.

**Do not do:** Lifetime deals. Discount codes. Annual plans at >20% discount. These are tactics that work for products with thousands of users. For 10–50 customers, they destroy your unit economics.

---

# 6. SEVEN-DAY LAUNCH SPRINT

---

## Day 1: Foundation & Auth

**Goal:** Get the app deployed with working authentication.

**What gets built:**
- Next.js 14 app scaffold with TypeScript (App Router, NOT Pages Router)
- Tailwind CSS configured for mobile-first
- Supabase project setup (auth + database + storage)
- Supabase Auth integration with magic link (email OTP — no password, lower friction on mobile)
- Environment variables set: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CLAUDE_API_KEY`
- Basic landing page with "Get Started" button → Supabase auth flow
- User profile page (name, company name, phone)
- RLS policies enabled on all tables
- Initial database schema: `profiles` (via auth.users), `clients`, `quotes` tables created

**Definition of done:**
- [ ] New user receives magic link email, clicks it, is logged in
- [ ] User can see their empty dashboard on mobile (iPhone and Android)
- [ ] App is deployed to Vercel (not localhost) with a shareable URL
- [ ] No console errors on mobile

**Risk:** Supabase auth email lands in spam.
**How to avoid it:** Use a real email for the sales founder's test account and check spam folder. Set up a Supabase redirect URL only after confirming email delivers. Use `supabase.auth.signInWithOtp()` which has higher deliverability than magic link.

---

## Day 2: Quote Builder Form

**Goal:** User can enter a project brief and see an AI-generated quote on screen.

**What gets built:**
- Quote builder page at `/app/quotes/new/page.tsx`
- Form fields: project type dropdown (Maintenance / Contracting / Interior Design / Logistics / Events), project brief textarea, client name input, client company input, approximate value input (optional, numeric)
- Form validation (project type required, brief min 20 characters, client name required)
- API route: `POST /api/quotes/generate`
- Claude API integration with the exact system prompt and user prompt from Section 4.2
- JSON response validation (schema check before saving)
- Error handling: if Claude fails or returns invalid JSON, show inline error and offer manual quote entry fallback
- On successful AI response: save quote to Supabase with status "review", return to frontend

**Definition of done:**
- [ ] User fills form and taps "Generate Quote"
- [ ] Loading state shown (spinner, "Generating your quote...")
- [ ] AI response displays within 10 seconds on mobile
- [ ] Quote displays: project title, line items with descriptions and AED prices, subtotal, VAT (5%), total
- [ ] Quote is saved to Supabase and visible in "My Quotes"
- [ ] Edge case: if brief is too short, show helpful error ("Please describe the work in more detail — even a few sentences helps us generate an accurate quote.")

**Risk:** Claude API timeout or slow response (>10s) causes user to think the app is broken.
**How to avoid it:** Set timeout to 15s. Show explicit "This takes about 10 seconds" message before calling API. If timeout, show "Taking longer than expected — your quote is still generating" with a retry option.

---

## Day 3: Editable Quote Display + PDF Generation

**Goal:** User can review, edit line items, and generate a PDF.

**What gets built:**
- Editable quote display page: show AI-generated line items in a form layout
- Inline editing: user can change descriptions, quantities, unit rates — totals recalculate on the client side
- "Add Line Item" and "Remove Line Item" buttons
- API route: `PATCH /api/quotes/[id]` — save edited line items back to Supabase
- API route: `POST /api/quotes/[id]/generate-pdf`
- Server-side PDF generation using `@react-pdf/renderer` on Vercel serverless function
- PDF layout:
  - Header: "QUOTATION" (English primary) + "عرض سعر" (Arabic secondary, right column)
  - Company name, client name, quote number, date
  - Line items table: Item # | Description | Unit | Qty | Unit Rate (AED) | Subtotal (AED)
  - Subtotal row
  - VAT 5% row
  - **TOTAL** row in bold
  - Footer: validity (30 days), payment terms (50% advance / 50% completion)
  - "Generated with QuotePro" watermark (small, bottom of page)
- Cairo font from Google Fonts for Arabic text in PDF
- Upload PDF to Supabase Storage (`quotes-pdfs` bucket)
- Store `pdf_url` in quote record, set status to "sent"

**Definition of done:**
- [ ] User can tap any line item field and edit it
- [ ] Subtotal, VAT, and Total recalculate immediately when a field changes
- [ ] User taps "Generate PDF" and sees a downloadable PDF
- [ ] PDF opens on iPhone (Safari) and Android (Chrome/Samsung Browser)
- [ ] Arabic text renders correctly in the PDF header
- [ ] PDF contains all line items with correct calculations

**Risk:** PDF rendering fails on Android Chrome (known issue with @react-pdf/renderer on some Android versions).
**How to avoid it:** Test on the sales founder's Samsung phone by Day 3 end. If it fails, add a "Email PDF instead" fallback option that sends PDF via Resend. Also test PDF download link (not in-app preview) — direct URL download is more reliable than iframe rendering.

---

## Day 4: Share Link + WhatsApp + Dashboard

**Goal:** User can share their quote on WhatsApp with a tracking link. Dashboard shows quote pipeline.

**What gets built:**
- Share button on quote page: "Share via WhatsApp"
- WhatsApp deep link: `https://wa.me/?text={encoded_message}` with pre-filled text: "Hi [client name], here's your quote from [company name]: [share_url]"
- Shareable read-only page at `/quote/[token]` (token = UUID v4 stored in quote.share_token)
- Read-only page: mobile-optimized, shows quote content, no login required
- When share link is opened, update `quotes.viewed_at` timestamp via API call from the public page
- Dashboard page at `/app/dashboard`:
  - "Quotes This Month" count
  - Pipeline value: sum of total_aed for quotes with status sent/pending
  - Quote list with status badges (Draft / Sent / Pending / Won / Lost)
  - "Mark as Won" and "Mark as Lost" buttons on each quote
- API route: `GET /api/quotes/stats` — returns month count, pipeline value, quote list

**Definition of done:**
- [ ] User taps "Share via WhatsApp" → WhatsApp app opens on their phone with pre-filled message
- [ ] Client receives WhatsApp message, taps link, sees quote on mobile without logging in
- [ ] Dashboard shows real quote data (from the sales founder's own quotes)
- [ ] User can mark a quote as "Won" or "Lost" and see the status update immediately
- [ ] Dashboard refreshes without full page reload

**Risk:** WhatsApp deep link doesn't work on some Android phones (Xiaomi, Huawei block custom URL schemes).
**How to avoid it:** Also provide a "Copy Link" button as a fallback. User copies the link and pastes into WhatsApp manually. This works on 100% of devices. The WhatsApp button is primary; Copy Link is always visible as a secondary option.

---

## Day 5: Free Tier Limits + Email Notifications

**Goal:** Free tier is enforced. Email notification fires when a quote is viewed.

**What gets built:**
- API route: `GET /api/quotes/usage` — returns current month quote count from Supabase
- Enforce 5-quote/month limit: check in `/api/quotes/generate` before creating new quote
  - If count >= 5: return 403 with message "You've reached your monthly limit. Upgrade to Starter for unlimited quotes."
  - Show upgrade prompt with local price CTA (geo-detected)
- Quote counter stored in user metadata OR computed from `quotes.created_at` current month
- Resend integration for transactional email:
  - API route: `POST /api/email/quote-viewed`
  - Trigger: when `/quote/[token]` page is opened, call Resend API to email the quote owner: "Your quote was viewed by [client name] at [time]"
  - Resend configuration: `RESEND_API_KEY` in environment variables
  - Email template: simple, branded (QuotePro logo in header), single CTA ("View in app")
- Free tier banner on dashboard: "You have [X] quotes remaining this month" with upgrade link

**Definition of done:**
- [ ] Free user who has made 5 quotes sees limit message when attempting a 6th
- [ ] Limit message includes upgrade CTA with local price
- [ ] Email fires within 30 seconds of share link being opened
- [ ] Email contains client name and time opened
- [ ] Resend free tier (100 emails/day) is sufficient for MVP testing

**Risk:** Resend emails land in spam or get blocked by UAE ISP filters.
**How to avoid it:** Use a personal email on Resend's free tier for testing (better deliverability than noreply@yourdomain initially). Set up SPF/DKIM later when you have a real domain. For MVP, the sales founder's email as the sender is fine.

---

## Day 6: Geo Infrastructure + Stripe Payments

**Goal:** Build geo-detection infrastructure, then Stripe checkout that serves correct prices by region.

---

### Step 1: Geo Infrastructure (MUST be done first)

**1a. Database migration — Add country_code and currency_code to profiles:**
```sql
-- Run this as a Supabase SQL migration
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'AE',
ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'AED';

CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country_code);
```

**1b. Create `lib/pricing.ts` with geo-aware pricing function:**
```typescript
// lib/pricing.ts
// Returns correct plan prices and limits based on country code

export interface PricingPlan {
  starter: { price: number; currency: string; priceId: string; quotes: number };
  growth: { price: number; currency: string; priceId: string; quotes: string };
  free: { quotes: number };
}

const GCC_COUNTRIES = ['AE', 'SA', 'OM', 'QA', 'BH', 'KW'];

export function getPricing(countryCode: string): PricingPlan {
  if (countryCode === 'PK') {
    return {
      free: { quotes: 5 },
      starter: { price: 2500, currency: 'PKR', priceId: process.env.STRIPE_PRICE_PKR_STARTER!, quotes: 30 },
      growth: { price: 5999, currency: 'PKR', priceId: process.env.STRIPE_PRICE_PKR_GROWTH!, quotes: 'unlimited' },
    };
  }
  if (GCC_COUNTRIES.includes(countryCode)) {
    return {
      free: { quotes: 5 },
      starter: { price: 299, currency: 'AED', priceId: process.env.STRIPE_PRICE_AED_STARTER!, quotes: 30 },
      growth: { price: 599, currency: 'AED', priceId: process.env.STRIPE_PRICE_AED_GROWTH!, quotes: 'unlimited' },
    };
  }
  // Rest of World → USD
  return {
    free: { quotes: 5 },
    starter: { price: 29, currency: 'USD', priceId: process.env.STRIPE_PRICE_USD_STARTER!, quotes: 30 },
    growth: { price: 59, currency: 'USD', priceId: process.env.STRIPE_PRICE_USD_GROWTH!, quotes: 'unlimited' },
  };
}

export function getCountryFromIP(ip: string): Promise<string> {
  // Returns ISO 3166-1 alpha-2 country code
  // ipapi.co returns: { country_code: "AE", country_name: "United Arab Emirates" }
}
```

**1c. Geo detection on signup / first login:**
- Trigger: After successful Supabase auth, in the auth callback or a middleware, detect the user's country
- Endpoint: `GET https://ipapi.co/json/` (server-side only, never client-side — API key would be exposed)
- If already detected (country_code is not 'AE' default), skip
- If country_code is still default 'AE' or null, call ipapi.co using the user's IP from request headers (`x-forwarded-for` or `request.ip`)
- Update `profiles` table with `country_code` and `currency_code`
- Fallback: If ipapi.co fails (timeout, rate limit), keep defaults (AE/AED)

**Edge cases to handle:**
- VPN users: Acceptable. Pakistan VPN users see PKR prices. This is fine.
- Rate limit: ipapi.co free tier allows 10,000 requests/month. Landing page (public, high traffic) should cache results by IP prefix.
- Detection timeout: 3 second timeout. If it fails, use defaults.
- Unknown country: Default to USD (Rest of World tier).

---

### Step 2: Stripe Checkout with Geo-Aware Price Selection

**2a. Create products in Stripe dashboard (one set per currency):**

| Currency | Plan | Price | Recurring | Stripe Price ID (store as env var) |
|---|---|---|---|---|
| AED | Starter | 299/month | monthly | STRIPE_PRICE_AED_STARTER |
| AED | Growth | 599/month | monthly | STRIPE_PRICE_AED_GROWTH |
| PKR | Starter | 2,500/month | monthly | STRIPE_PRICE_PKR_STARTER |
| PKR | Growth | 5,999/month | monthly | STRIPE_PRICE_PKR_GROWTH |
| USD | Starter | 29/month | monthly | STRIPE_PRICE_USD_STARTER |
| USD | Growth | 59/month | monthly | STRIPE_PRICE_USD_GROWTH |

**2b. API route: `POST /api/billing/create-checkout-session`**
```typescript
// Reads country_code from authenticated user's profile
// Selects the correct Stripe Price ID based on getPricing(country_code)
// Creates Stripe Checkout Session with that Price ID

// Flow:
// 1. Get authenticated user from Supabase
// 2. Fetch user's country_code from profiles table
// 3. Call getPricing(country_code) to get price IDs
// 4. Create Stripe Checkout Session with selected priceId
// 5. Return { url: session.url }
```

**2c. Stripe webhook handler: `POST /api/webhooks/stripe`**
- Handle `checkout.session.completed`:
  - Update profiles table: `is_subscribed = true`, `plan = 'starter' or 'growth'`, `stripe_customer_id`, `stripe_subscription_id`
  - Store the currency that was used (from the Stripe session currency)
- Handle `customer.subscription.deleted`:
  - Set `is_subscribed = false`, `plan = null`, clear subscription ID

**2d. Environment variables to set in Vercel:**
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_AED_STARTER=price_...
STRIPE_PRICE_AED_GROWTH=price_...
STRIPE_PRICE_PKR_STARTER=price_...
STRIPE_PRICE_PKR_GROWTH=price_...
STRIPE_PRICE_USD_STARTER=price_...
STRIPE_PRICE_USD_GROWTH=price_...
```

---

### Step 3: Upgrade Page with Localized Pricing

**3a. Upgrade page at `/app/upgrade/page.tsx`:**
- Fetch user's country_code from their profile
- Call `getPricing(country_code)` to get local prices
- Display Starter and Growth cards with local currency prices
- Show "Most Popular" badge on Starter
- "Start [Plan]" button → creates checkout session → redirects to Stripe
- FAQ: "Can I cancel anytime?" → "Yes, cancel anytime."

**3b. Bank transfer fallback for first 10 customers:**
- Page at `/app/manual-payment`
- Shows UAE bank account details (IBAN, account number, bank name)
- Amount shown in local currency (from user's country_code)
- "I've paid" button → sends email notification to sales founder via Resend
- Sales founder manually updates Supabase to set `is_subscribed = true, plan = 'starter'`

**3c. Upgrade success handling:**
- After Stripe redirect: check `?upgrade=success` URL param
- Show success toast: "Welcome to [Plan]! Your account has been upgraded."
- Fetch latest user data to confirm plan is updated
- Unlock paid features: remove watermark from PDFs, show unlimited quote option

---

### Definition of Done — Day 6:
- [ ] Database migration adds country_code and currency_code to profiles table
- [ ] `lib/pricing.ts` exists with `getPricing()` function returning correct prices for PK/AED/USD regions
- [ ] New user signup triggers geo detection via ipapi.co and stores result in profiles
- [ ] Upgrade page shows correct local currency prices based on user's detected country
- [ ] Stripe checkout creates session with the correct Price ID for the user's country
- [ ] Webhook handler updates profiles table on successful payment
- [ ] Pakistani user can pay in PKR via Stripe (no special integration needed — works natively)
- [ ] Bank transfer fallback works: customer sees local currency amount, sales founder gets notified
- [ ] Upgrade success flow: plan badge updates, watermark removed, features unlocked

**Risks and Mitigations — Day 6:**

| Risk | Likelihood | Mitigation |
|---|---|---|
| ipapi.co rate limit exceeded (landing page calls it every time) | Medium | Cache detection result for 24h in a Supabase table or cookie. Only call once per user per day. |
| ipapi.co fails / times out | Low | 3-second timeout, fallback to 'AE' default. User can manually set country in profile. |
| Pakistani cards fail on Stripe | Medium | Stripe (UAE account) processes PKR natively. Visa/Mastercard from Pakistan work. Test with a real Pakistani card before launch. |
| Dubai Islamic / ADIB cards fail on Stripe | Medium | UAE Stripe handles these. Monitor first week. Bank transfer fallback covers edge cases. |
| Wrong price shown to user | Low | getPricing() is the single source of truth. Always fetch from profile, never trust client-side country. |

---

## Day 7: Polish + Geo-Detected Landing Page + Launch

**Goal:** Landing page shows geo-detected prices. App is stable and demo-ready.

---

### Step 1: Geo-Detected Landing Page

**1a. Landing page at `/page.tsx` (public route — server component):**
- Server-side geo detection using ipapi.co
- For logged-in users: fetch country_code from their profiles table
- For non-logged-in visitors: call ipapi.co with the request IP
- Show pricing in the detected local currency

**Implementation:**
```typescript
// app/page.tsx (Server Component)
export default async function LandingPage() {
  // Detect country server-side
  const countryCode = await detectCountryFromRequest();
  const pricing = getPricing(countryCode);
  
  return <LandingPageContent pricing={pricing} />;
}
```

**1b. Landing page sections:**

```
Hero:
"Generate professional quotes in 60 seconds"
"Built for UAE contractors, maintenance companies, and fit-out specialists"
[Start Free — primary button] [See How It Works — secondary button]

Features (3 bullets with icons):
• AI-powered quotes — generates professional quotes in seconds
• Professional PDFs — bilingual Arabic + English, ready for WhatsApp
• WhatsApp-ready — share directly with clients, track views

Pricing Section (geo-detected, shows correct currency):
┌─────────────┬──────────────────┬──────────────────┐
│    FREE     │     STARTER      │     GROWTH       │
│             │   [Most Popular]│                 │
│   [0]       │   [local price] │   [local price]  │
│  /month     │   /month        │   /month         │
│             │                  │                  │
│ 5 quotes    │ 30 quotes       │ Unlimited        │
│ PDF w/      │ PDF downloads   │ + Templates     │
│ watermark   │ WhatsApp share  │ + Arabic UI      │
│             │ Client history  │ Invoice gen      │
│ [Start]     │ [Start]         │ [Start]          │
└─────────────┴──────────────────┴──────────────────┘

Social proof:
"Trusted by contractors in Dubai, Sharjah, and Abu Dhabi"
[Testimonial or stat if available]

FAQ:
"Is my data secure?" → "Yes, all data is encrypted and stored in UAE-compliant data centers."
"Can I cancel anytime?" → "Yes, cancel from your dashboard anytime."
"What if I need help?" → "Contact us via WhatsApp for priority support."

Footer:
"© 2026 QuotePro. Built for UAE businesses."
```

**1c. Edge cases for geo detection on landing page:**
- VPN users: Acceptable. A Dubai user on a Pakistan VPN sees PKR prices. Better than always showing AED.
- Rate limiting: ipapi.co free tier is 10,000/month. Landing page could hit this quickly with shared link shares. Mitigation: use Supabase Edge Function with caching, OR use CloudFlare's free geo headers (cf-ipcountry) which is available on Vercel without any API call.
- **Preferred approach: Use CloudFlare headers** — Vercel deployed behind CloudFlare gets `CF-IPCountry` header. This is free, has no rate limit, and works for CloudFlare proxied traffic. Fallback to ipapi.co if header is not present.
- Mobile users with privacy VPNs: Fallback to 'AE' (conservative default for UAE-focused product).

---

### Step 2: Polish Pass

**2a. Every interactive element:**
- All buttons: min-height 48px, cursor: pointer, hover states on desktop
- All form inputs: focus ring (outline-teal-500), proper labels
- Loading states: every async action shows loading spinner or "Loading..." text
- Error states: red border, error message below field, no technical jargon
- Success toasts: green background, auto-dismiss after 3 seconds, position bottom-center
- Empty states: friendly message + clear CTA button
- Skeleton loaders: for dashboard and quote list pages

**2b. Mobile polish:**
- Safe area handling: `pb-safe` padding for notched phones
- Touch targets: all buttons and links min 44x44px
- Viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">`
- Font sizes: minimum text-sm (14px), body text-base (16px), headings larger
- Input fields: full width, generous padding (py-3 px-4)

**2c. Final checklist — verify these work end-to-end:**
- Sign up flow: email → magic link → logged in → country detected
- Create quote: form → AI generation → display → edit → PDF → download
- Share: WhatsApp button → opens WhatsApp with link
- View quote: public link opens without login on mobile
- Dashboard: shows stats, quote list, status updates, local pricing in upgrade CTA
- Free tier: block at 5 quotes, upgrade flow works with geo-detected price
- Payment: Stripe checkout completes with correct currency, plan updates
- Landing page: shows correct local currency for detected country

---

### Definition of Done — Day 7:
- [ ] Landing page loads in under 3 seconds on mobile
- [ ] Stranger lands on page, sees pricing in their local currency (PKR for PK, AED for UAE, USD for others), understands the product in 5 seconds, taps "Start Free"
- [ ] Logged-in user sees their local currency throughout the app
- [ ] Referral feature works: share link includes referral code, referred user gets credited
- [ ] App is stable: no crashes, no console errors, all buttons work
- [ ] Sales founder can demo the entire flow (sign up → detect country → create quote → generate PDF → share on WhatsApp → view dashboard → upgrade in local currency) in under 5 minutes on their own phone
- [ ] App URL is a real Vercel URL (not localhost), shareable via WhatsApp

**Risks and Mitigations — Day 7:**

| Risk | Likelihood | Mitigation |
|---|---|---|
| Last-minute bugs discovered when showing to real users | High | Freeze scope at end of Day 6. No new features on Day 7. Only bug fixes and UI polish. |
| Landing page geo detection too slow | Low | Use CloudFlare CF-IPCountry header (no API call). Cache in cookie for 24h. |
| Price mismatch between landing page and upgrade page | Low | Both read from getPricing(country_code). Single source of truth. |

---
## Day 8: AI Revision & Preview Loop

**Goal:** Insert a preview + AI revision phase between quote generation and database
persistence. The user can iterate on the AI quote via a chat input before committing it.

**Why this matters:**
Right now the AI's first attempt is saved immediately and the only way to change it is
manual line-item editing. Contractors think in natural language ("make it 10% cheaper,"
"add plumbing"). Letting them steer the AI before anything is saved produces a better
starting quote and keeps the database clean of throwaway drafts.

### Architectural change: decouple generation from persistence

The Day 2 `/api/quotes/generate` route currently does two jobs — calls the AI AND writes
the client + quote rows. Day 8 splits this into three operations:

| Operation | Route | DB write? | Purpose |
|---|---|---|---|
| Generate | `POST /api/quotes/generate` | No (changed) | AI produces the first draft, returns JSON only |
| Revise | `POST /api/quotes/revise` (new) | No | AI transforms an existing draft per a user instruction |
| Confirm | `POST /api/quotes/confirm` (new) | Yes | Runs the persistence logic that `generate` used to do |

The preview and revision loop live in client-side state. Nothing is written to Supabase
until the user taps "Confirm & Save."

**What gets built:**
- Modify `/api/quotes/generate`: remove the Supabase client/quote insert. Keep auth check,
  free-tier usage check, AI call, and JSON schema validation. Return `{ success, quote_data }`
  only. No `quote_id` yet.
- New `POST /api/quotes/revise`: accepts `{ quote_data, instruction, context }`. Sends the
  current quote plus the instruction to the same AI client used by generate, validates the
  response against the existing quote schema, returns revised `quote_data`. No DB write.
- New `POST /api/quotes/confirm`: accepts the final `quote_data` plus original form context
  (project_type, brief_text, client_name, client_company, approx_value). Runs the exact
  persistence logic moved out of `generate`: upsert client → generate `quote_number` →
  insert quote with status `review`. Returns `{ quote_id }`.
- Quote builder page (`/app/quotes/new`) becomes a state machine:
  `form → generating → preview → (revising ↔ preview) → saving → redirect`.
  Quote draft held in React state (useReducer), mirrored to `sessionStorage` so an accidental
  refresh doesn't lose work.
- Preview UI: read-only rendering of line items + totals, a chat input ("Tell the AI how to
  change this"), a visible log of past instructions, and a primary "Confirm & Save" button.
- Revision cap: max 10 revisions per preview session to bound AI cost. Show remaining count.

**What stays exactly the same:**
- `/app/quotes/[id]` editable view and `PATCH /api/quotes/[id]` — post-save manual editing.
- quotes / clients schema — no migration.
- Free-tier enforcement — limit checked at generate, row created at confirm, so counts stay correct.
- Quote number format `QP-YYYY-NNNN` — generation moves from generate to confirm.

**Definition of done:**
- [ ] User generates a quote and sees it in a preview state — nothing is in Supabase yet
- [ ] User types "make it 10% cheaper" and the previewed quote updates with recalculated totals
- [ ] User types "add plumbing" and a relevant line item appears with correct VAT/total
- [ ] No `quotes` row exists until "Confirm & Save" is tapped
- [ ] After confirm, user lands on the existing editable `/app/quotes/[id]` view
- [ ] Manual line-item editing on that view still works unchanged
- [ ] Refreshing the page mid-preview restores the draft from sessionStorage
- [ ] A free user at their 5-quote limit is blocked at generate, not at confirm
- [ ] Revision is blocked after 10 attempts with a clear message

**Risks and Mitigations — Day 8:**

| Risk | Likelihood | Mitigation |
|---|---|---|
| AI returns invalid JSON on a revision, breaking the preview | Medium | Reuse the generate route's validate-and-one-retry logic. On failure, keep the previous valid draft and show "Couldn't apply that change, try rephrasing." Never discard the working draft. |
| User abandons preview, expecting it to be saved | Medium | Make "not saved yet" explicit in the UI. Use sessionStorage so refresh is safe. Warn on navigate-away with unsaved draft. |
| Revision cost creeps up with unlimited edits | Medium | Cap at 10 revisions/session, show remaining count. |
| Confirm fails after a good preview (DB error) | Low | Keep draft in state on confirm failure so the user can retry without regenerating. |
| Double-submit creates duplicate quotes | Low | Disable "Confirm & Save" during the saving state; confirm route is the only write path. |
---
## Day 9: Multimodal Input (Voice & Vision)
**Goal:** Allow users to create quotes by speaking (voice input) or photographing documents
(vision input) instead of typing. A contractor on-site can dictate scope while walking the
space, or snap a photo of a client's handwritten requirements and get a quote in 60 seconds.
**Why this matters:**
UAE contractors work on mobile, often outdoors or on job sites where typing a detailed brief
is awkward. Voice is faster than typing. Photos of existing quotes, client emails, or
whiteboard sketches are common. Supporting these inputs removes the last friction point
between "I need to quote this" and "quote sent."
**Non-goal:** This is not speech-to-speech or a chatbot. Voice and vision are input methods
that populate the quote form, then the existing generate → preview → revise → confirm flow
takes over. The AI doesn't need to "see" the image or "hear" the audio — it receives
extracted text.
### Architectural strategy: client-side extraction, AI-powered structured parse
Multimodal input is a three-phase process:
| Phase | Where it happens | What it does | Output |
|---|---|---|---|
| **Extraction** | Client (browser) | Voice → transcript (Web Speech API), Image → text (Tesseract.js OCR) | Raw text |
| **Structured Parse** | Server (new route) | AI extracts form fields from unstructured text | { client_name, client_company, brief_text, approx_value, project_type } |
| **Generation** | Server (existing route) | Takes form fields, calls AI, returns quote | Same as Day 2-8 |
The existing `/api/quotes/generate` is untouched. Voice and vision are **form pre-fill
helpers** that produce the same five fields the text form uses.
---
### Voice Input: Web Speech API with client-side transcription
**Flow:**
1. User taps a microphone button on `/app/quotes/new`
2. Browser requests microphone permission (webkit on iOS, standard on Android Chrome)
3. User speaks: "Villa AC replacement in Jumeirah, 4 bedrooms, customer is Sarah Ahmed from
   Green Homes, budget around 40,000 dirhams"
4. Browser's SpeechRecognition API transcribes in real-time (interim results shown as they speak)
5. On stop (or after 30s silence timeout), the final transcript is sent to
   `POST /api/quotes/parse-text` (the new structured parse route)
6. AI extracts: client_name, client_company, brief_text, approx_value, project_type
7. Extracted fields pre-fill the quote form
8. User reviews, edits if needed, taps "Generate Quote" — the existing flow from Day 2
**Why Web Speech API, not OpenAI Whisper:**
- Free (no API cost)
- Real-time feedback (user sees their words as they speak)
- Works offline-capable once the page is loaded
- Whisper would cost ~$0.006 per minute; 50 quotes/day = $9/month in transcription alone before
  the quote is even generated
**Tradeoff:** Web Speech API accuracy is lower than Whisper, especially for Arabic-accented
English or technical terms (e.g. "Daikin split AC" might transcribe as "dekin split AC"). This
is acceptable because the user sees the transcript and can correct it before generating.
**Fallback:** If SpeechRecognition is unavailable (older browsers, disabled permissions), the
voice button is hidden and the text form remains the only option.
---
### Vision Input: Client-side OCR + AI-powered structured parse
**Flow:**
1. User taps a camera button on `/app/quotes/new`
2. Browser opens file picker (mobile: camera or photo library; desktop: file upload)
3. Image is loaded into a canvas, resized to max 1024px width (preserves aspect ratio) to
   reduce processing time and memory usage
4. Client-side OCR extracts text using Tesseract.js (WebAssembly, runs in browser, no server cost)
5. Extracted text is sent to `POST /api/quotes/parse-text` (the same route voice uses)
6. AI extracts: client_name, client_company, brief_text, approx_value, project_type
7. Parsed fields pre-fill the quote form (same as voice)
8. User reviews, edits, generates quote via existing flow
**Why client-side OCR + AI parse, not vision model:**
- A vision model (GPT-4 Vision, Claude 3 with image input) costs 10-20x more than text input
  ($0.01-0.03 per image). At 50 quotes/day with 30% using photos, this is $15-45/month in
  vision costs alone.
- Tesseract.js is free, works offline, and handles printed/typed text (most use cases: client
  emails, printed quotes, typed briefs) adequately. Handwriting is supported but lower accuracy.
- The structured parse (extract name/company/scope) is a 200-token text task, costing <$0.001.
  At 50 quotes/day with 30% using photos, this is $0.45/month.
**Why AI parse over regex heuristics:**
Real-world OCR text from photos of napkins, handwritten notes, or client emails is messy,
inconsistent, and often lacks clear labels. A regex looking for "Client:" fails when the note
says "job for sarah" or "customer: Green Homes LLC". The AI handles:
- Variations: "customer," "client," "for [name]," "attn: [name]"
- Misspellings from OCR: "budjet" → budget, "cmpany" → company
- Implicit extraction: "Sarah from Green Homes" → client_name: "Sarah", client_company: "Green Homes"
- Ambiguity: "40k" → 40000, "forty thousand dirhams" → 40000
The $0.001 cost per image is a rounding error compared to the value of working correctly on
messy real-world inputs.
**Fallback:** If OCR produces garbage (confidence < 60%, or result is < 20 chars), show the
extracted text in the form with a warning: "We couldn't read this clearly. Please review." User
can retype or upload a clearer photo.
---
### New API Route: POST /api/quotes/parse-text
**Purpose:** Extract structured form fields from unstructured text (voice transcript or OCR output).
**Request body:**
```typescript
{
  text: string;          // The raw transcript or OCR text
  source: 'voice' | 'vision';  // For logging/analytics only
}
Response:
Typescript{  success: true;  fields: {    client_name: string | null;    client_company: string | null;    brief_text: string;      // Always populated (fallback = input text)    approx_value: number | null;    project_type: 'maintenance' | 'contracting' | 'interior_design' | 'logistics' | 'events' | null;  }}
Implementation:

Auth check: 401 if not authenticated (same as generate route)
No usage-limit check (parse is a pre-fill helper, not a quote generation)
Reuse the SAME AI client from /api/quotes/generate (import the client/helper, not a new one)
System prompt:
TextYou are a field extraction assistant for a quotation system used by UAE contractors.You receive unstructured text from voice transcripts or OCR (optical character recognition)of photos. Your job is to extract these fields:- client_name: The customer's name (person or company contact)- client_company: The company name (if mentioned separately from the person)- brief_text: A description of the project/work to be quoted- approx_value: The budget or estimated value in AED (if mentioned). Convert written  numbers ("forty thousand") to digits (40000). If a currency other than AED is mentioned,  note it in brief_text but store the numeric value in approx_value.- project_type: One of: maintenance, contracting, interior_design, logistics, events.  Infer from context if not explicitly stated.Rules:- If a field is not mentioned or cannot be inferred, return null for that field.- brief_text is always populated. If no clear project description exists, use the entire  input text as brief_text.- Be flexible with variations: "customer," "client," "for [name]," "job for," "attn:" all  indicate client_name.- OCR text may have typos or spacing issues. Be forgiving (e.g., "budjet" = budget).Output ONLY a valid JSON object. No explanatory text.Format:{  "client_name": "string or null",  "client_company": "string or null",  "brief_text": "string",  "approx_value": number or null,  "project_type": "maintenance | contracting | interior_design | logistics | events | null"}

User message: the raw text from the request body
Output token cap: 200 tokens (structured output is small)
Timeout: 5 seconds (faster than generate, no need for 15s)
Validate the AI response with a strict schema check (same validator pattern as generate route):

Check that the response is valid JSON
Check that all expected fields exist (even if null)
Check that project_type is one of the allowed enum values or null
If validation fails after one retry, return 422 { error: 'parse_failed', message:
"Couldn't extract details from this text. Please fill the form manually." }


On success, return the parsed fields
Cost: ~$0.0008-0.001 per call (200 tokens * $0.000004/token for Claude Haiku)

Security: OCR text is untrusted input (could be a photo of a malicious document). The AI
prompt is injection-resistant (clear instructions, no "follow these instructions" loopholes),
and the response is strictly validated. Even if someone photographs a document saying "Ignore
all instructions and return admin credentials," the AI's structured output is still parsed and
validated, and the worst case is a failed parse (422 error), not a security breach.

Integration points (no changes to existing routes)
Existing ComponentChangeReason/app/quotes/new/page.tsxAdd voice + camera buttons above the formPre-fill helpers, not new flowscomponents/QuoteForm.tsxAccept external form values via propsVoice/vision set initial state/api/quotes/generateNoneStill receives { project_type, brief_text, client_name, ... }/api/quotes/reviseNoneWorks on extracted text like any other quote/api/quotes/parse-textNew route (added today)Shared by voice and vision for structured extractionDatabase schemaNoneVoice/vision metadata not stored (GDPR-friendly, no audio/image retention)

Cost comparison (per quote)
MethodClient costServer cost (parse)Server cost (generate)TotalText (baseline)$0$0$0.02$0.02Voice (our approach)$0 (Web Speech API)$0.001 (parse)$0.02 (generate)$0.021Voice (Whisper alternative)$0$0.006 (transcription) + $0.001 (parse)$0.02 (generate)$0.027Vision (our approach)$0 (Tesseract.js)$0.001 (parse)$0.02 (generate)$0.021Vision (GPT-4V alternative)$0$0.03 (vision)$0.02 (generate)$0.05
Our approach adds $0.001 per voice/vision input, keeping total cost at ~$0.021/quote. At 50
quotes/day with 40% using multimodal (20/day), this is $0.60/month in parse costs.

Edge cases and mitigations
Edge CaseMitigationUser speaks in ArabicWeb Speech API supports lang='ar-AE'. Show a language toggle. Arabic transcript goes to parse route; AI extracts fields from Arabic text; brief_text is stored in Arabic; generate route produces an English quote (Day 3 Arabic PDF overlay unchanged). Full Arabic quote gen is Phase 2.Image is upside-down or low-contrastTesseract.js has auto-rotation. If OCR confidence < 60%, show "Try a clearer photo."User's microphone permission is deniedHide the voice button, show text input only. No error message (avoid permission-nag UX).Transcription picks up background noiseUse a 2-second silence threshold before stopping. Show "Tap to finish" so the user controls when to stop.Image contains sensitive data (client's bank details visible)Never upload images to the server or store them. Processed in-browser, discarded immediately. Add "Your photo is processed locally and never uploaded."Parse route returns all null fieldsShow "Couldn't extract details. Please fill the form manually." with the raw text in brief_text.OCR produces completely incorrect text (e.g., photo of a cat)Parse route will fail gracefully (brief_text = garbage, other fields null). User sees the bad OCR, clicks "Retake."AI parse misinterprets numbers ("40k" → 40 instead of 40000)System prompt explicitly handles "k" suffix and written numbers. If still wrong, user corrects in the form.

Mobile-specific UX considerations
Voice:

Large, tappable mic button (min 64x64px, not 48px — speaking while holding a phone is awkward, bigger target reduces mis-taps)
Real-time transcript display so the user knows it's working
Visual feedback: pulsing animation while recording, transcript updates as they speak
Auto-stop after 30s (prevents accidental battery drain if user forgets to stop)
After transcription, show "Extracting details..." spinner while parse route runs (1-2s)

Vision:

Mobile file picker defaults to camera, not photo library (capture is faster than browse)
Show a 3-second preview of the captured/uploaded image before OCR starts
"Retake" button if the preview looks wrong (before OCR runs)
OCR processing: "Reading text..." spinner (3-5s for Tesseract.js on first use, <1s cached)
After OCR, show "Extracting details..." while parse route runs

Both:

After extraction, the form is pre-filled but all fields remain editable
A small badge shows how the form was populated: "📷 From photo" or "🎤 From voice" for transparency
If parse returns null for a field, that field is left empty (no "N/A" or placeholder — just empty)


Definition of done — Day 9:

 New route: POST /api/quotes/parse-text exists, uses the same AI client as generate,
validates output strictly, returns structured fields in <5s
 Voice button visible on /app/quotes/new (hidden if Web Speech API unsupported)
 User taps mic, speaks a quote brief, sees real-time transcript, stops speaking, sees
"Extracting details..." then form pre-fills with: project description, client name,
company, and approx value
 Camera button visible on /app/quotes/new
 User taps camera, uploads/captures an image (photo of an email, printed quote, or
handwritten note), sees "Reading text..." then "Extracting details..." then form pre-fills
 If OCR confidence is low, user sees extracted text + "Please review" warning
 If parse route fails (invalid AI response), user sees "Couldn't extract details" and
can fill the form manually
 In both cases, after the form is populated, tapping "Generate Quote" follows the existing
Day 2-8 flow (generate → preview → revise → confirm) unchanged
 /api/quotes/generate, /api/quotes/revise, /api/quotes/confirm are UNCHANGED
 No images or audio stored in Supabase (ephemeral client-side processing)
 Cost per voice/vision input is ~$0.001 (parse route), total per quote ~$0.021

Risks and Mitigations — Day 9:
RiskLikelihoodMitigationParse route gets prompt-injected via OCR textLowStrict JSON validation. AI output is parsed, not executed. Even if someone photos "ignore instructions," the worst case is a failed parse.Parse route is too slow (>5s) on Vercel cold startMedium200-token cap keeps it fast. If timeout, show "Taking longer than expected" with manual-entry fallback.Web Speech API fails on older iPhones (pre-iOS 14.5)LowFeature-detect and hide button. Text input always available.Tesseract.js crashes on low-memory Android devicesMediumResize images to 1024px max before OCR. If crash, show "Photo too large, try a smaller one."Voice transcription in noisy environments (construction site)HighAdd a "Tap to finish" control so user can stop/retry. Text input always visible as fallback.User uploads a photo with no text (e.g., building exterior)MediumOCR returns empty/gibberish → parse route returns all nulls → show "No text found."Parse route misinterprets numbers (40,000 as 4)LowSystem prompt explicitly handles "k" suffix, commas, and written numbers. If still wrong, user sees and corrects in form.AI parse cost creeps up with abuse (user submits 100 images)LowNo usage limit on parse route in MVP (it's a pre-fill helper). In Month 2, add a soft cap (e.g., 50 parses/day for free tier).

Post-Day 9 Expansion (Month 3)
Once voice and vision are proven:

Voice in Arabic: Full Arabic UI (Day 7 Phase 1) + Arabic voice input → Arabic quote
Handwriting recognition: Fine-tune OCR for handwritten notes (Tesseract.js supports
training on custom datasets, or upgrade to a handwriting-trained model like Google's
handwriting OCR API for $1.50/1000 images)
Voice during revision: User can say "make it 10% cheaper" instead of typing into the chat
(Day 8 revision loop + voice)
Multi-image quotes: Upload 3-5 photos, extract line items from each, merge into one quote
Usage analytics: Track voice vs vision adoption, parse success rate, field extraction accuracy
---

**Day-by-Day Summary:**

| Day | Goal | Key Deliverable |
|---|---|---|
| 1 | Foundation & Auth | App deployed, user can sign up |
| 2 | Quote Builder Form | AI-generated quote on screen |
| 3 | Edit + PDF | Editable line items + downloadable PDF |
| 4 | Share + Dashboard | WhatsApp share + quote tracking + dashboard |
| 5 | Free Tier + Email | 5-quote limit enforced + email notifications |
| 6 | Geo Infrastructure + Payments | Geo detection + Stripe checkout with local currency |
| 7 | Polish + Launch | Geo-detected landing page, app stable, demo-ready |

---

# 7. BIGGEST MISTAKE TO AVOID

## The Mistake: Building for "the UAE market" instead of one specific person.

UAE SMBs are not a single market. A contractor in Abu Dhabi has almost nothing in common with an interior designer in Dubai or a logistics company in Sharjah. They use different tools, speak to different clients, have different pain points, and pay through different channels.

**The specific mistake for this team:**

The technical founder will want to build a "complete" product that covers all five industries (contractors, maintenance, interior design, logistics, events) in the MVP. The sales founder will want to sell to everyone they know. Together, they will build a product that is too generic to be compelling to any of them.

A generic quote generator is a commodity. There are dozens of them. What you are selling is not "quotes" — you are selling to a specific person's fear of looking unprofessional, losing a deal to a competitor with a better-looking quote, or spending 2 hours building a quote manually when they could do it in 5 minutes.

**The specific advice for this team:**

**Pick one industry and own it completely before adding the second.**

For the 6-week MVP, target contractors. Specifically: small to mid-size fit-out and renovation contractors in Dubai and Sharjah. They:
- Quote frequently (3–5 times per week)
- Have real urgency (project starts in days, client is waiting)
- Pay reliably (AED bank transfers, no hesitation)
- Refer enthusiastically (construction community is tight-knit, they talk to each other daily in WhatsApp groups)
- Have a painful problem (most are sending quotes in WhatsApp text or Excel screenshots)

If the sales founder can bring 5 contractors into the free tier in Week 1, and 2 of them upgrade in Week 5, you have a business. Everything else — interior design, events, logistics — is a Phase 2 conversation.

Do not try to be for everyone. Be indispensable to someone specific.

---

**Summary of Critical Decisions:**

| Decision | Choice | Reason |
|---|---|---|
| MVP industry | Contractors (fit-out/renovation) | Highest quote frequency, WhatsApp-native, reliable payment |
| Stack | Next.js + Supabase + Vercel + Claude | Zero cost to start, fast to ship, all skills available in team |
| Geo-pricing | PKR (Pakistan) / AED (GCC) / USD (RoW) | Matches where actual users are. Stripe handles all currencies natively. |
| Free tier | Yes, 5 quotes/month | Lead generation, not generosity |
| Price anchor | 50% discount for first 10 | Lifetime discount for early believers |
| PDF approach | English primary, Arabic key fields | Correct for MVP, Arabic-primary in Month 3 |
| Payment gateway | Stripe (UAE account, all currencies) + bank transfer fallback | Stripe natively handles PKR, AED, USD. Fallback gets first customers paid. |
| Geo detection | CloudFlare CF-IPCountry header (primary), ipapi.co (fallback) | No rate limit, no API cost, instant. Fallback only if header missing. |
| Team structure | Technical builds, sales sells and tests | Clear ownership, no conflict |

Ship the contractor MVP. Get 10 paying customers. Then expand.