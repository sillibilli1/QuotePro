```markdown
# QuotePro — UI Upgrade Plan (Post Day-7)
**Goal:** Move from "functional but basic" to a polished, professional, award-winning-grade UI without breaking the working Day 1–7 product.
**Constraint:** Stack stays the same (Next.js 14 App Router, TypeScript, Tailwind, Supabase, Vercel). No new framework. UI-only changes.
**Principle:** Refine, don't rebuild. Every change ships behind the existing routes and is reversible.

---

## 0. Guiding Design Philosophy

Award-winning B2B SaaS UIs (Linear, Stripe, Vercel, Raycast) share five traits. We borrow all five:

1. **Restraint** — one accent color, lots of whitespace, no visual noise.
2. **Hierarchy** — the eye always knows where to look first. Size, weight, and color do the work.
3. **Motion with meaning** — subtle transitions that confirm actions, never decorative spinners-for-the-sake-of-it.
4. **Consistency** — the same button, the same spacing, the same radius, everywhere.
5. **Speed perception** — skeletons, optimistic updates, and instant feedback make the app *feel* faster than it is.

Our user is a UAE contractor on a phone at 7 AM. The UI must feel **fast, trustworthy, and effortless** — not flashy.

---

## 1. Design System Foundation (build this FIRST)

Everything else depends on this. Do not skip to page redesigns before the tokens exist.

### 1.1 Color Tokens

Replace ad-hoc hex values with a semantic scale. Extend `tailwind.config.ts`:

```ts
// Primary — Teal (keep brand, but use a full scale)
teal: {
  50:  '#F0FDFA',
  100: '#CCFBF1',
  200: '#99F6E4',
  300: '#5EEAD4',
  400: '#2DD4BF',
  500: '#14B8A6',
  600: '#0D9488', // current brand primary
  700: '#0F766E',
  800: '#115E59',
  900: '#134E4A',
}
```

Define semantic roles (use CSS variables so we can theme later):

| Role | Light value | Usage |
|---|---|---|
| `--bg` | `#FAFAFA` | App background (NOT pure white — softer) |
| `--surface` | `#FFFFFF` | Cards, modals, inputs |
| `--surface-subtle` | `#F4F4F5` | Table stripes, hover rows |
| `--border` | `#E4E4E7` | Hairline borders (1px) |
| `--text-primary` | `#18181B` | Headings, key data |
| `--text-secondary` | `#52525B` | Labels, descriptions |
| `--text-tertiary` | `#A1A1AA` | Placeholders, metadata |
| `--accent` | `teal-600` | CTAs, links, active states |
| `--accent-hover` | `teal-700` | Hover |

Status colors (keep Day-4 semantics, refine shades for accessibility AA):
- Draft `zinc-500`, Sent `blue-600`, Pending `amber-500`, Won `emerald-600`, Lost `rose-600`.

### 1.2 Typography

The single biggest "basic → professional" lever. Most basic UIs use one font size and one weight everywhere.

- Keep **Inter** (already loaded). Add `Inter` with `font-feature-settings: 'cv11', 'ss01'` and tabular numbers for money.
- Add a **tabular-nums** utility for all AED amounts so columns align: `font-variant-numeric: tabular-nums`.

Type scale (mobile-first, rem-based):

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| `display` | 32/40 → 40/48 md | 700 | Landing hero only |
| `h1` | 24/32 | 700 | Page titles |
| `h2` | 20/28 | 600 | Section headers |
| `h3` | 16/24 | 600 | Card titles |
| `body` | 16/24 | 400 | Default text |
| `body-sm` | 14/20 | 400 | Secondary text |
| `caption` | 12/16 | 500 | Labels, badges |
| `mono-num` | 16/24 | 500, tabular | Money values |

Rule: a screen should rarely use more than 3 sizes at once.

### 1.3 Spacing, Radius, Shadow

- **Spacing:** stick to a 4px grid (Tailwind default). Use generous section padding: `px-4` mobile, `px-6` md, `px-8` lg.
- **Radius:** standardize. `rounded-lg` (8px) for inputs/buttons, `rounded-xl` (12px) for cards, `rounded-2xl` (16px) for modals/sheets. No mixed radii.
- **Shadows:** soft, layered, not harsh. Define three:
  - `shadow-card`: `0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)`
  - `shadow-pop`: `0 4px 12px rgba(0,0,0,0.08)` (dropdowns, toasts)
  - `shadow-modal`: `0 20px 40px rgba(0,0,0,0.16)`
- **Borders over shadows** for most cards — a 1px `--border` line looks more refined than a heavy shadow.

### 1.4 Iconography

- Adopt **lucide-react** (tree-shakeable, consistent stroke, matches Inter's geometry). Already React-friendly.
- Standardize size: `16px` inline, `20px` buttons, `24px` empty states.
- Never mix emoji icons with line icons in the same surface. Replace the `📋` / `💳` empty-state emoji from Day 7 with lucide icons inside a tinted circle.

**Deliverable for Section 1:** `app/globals.css` with CSS variables, updated `tailwind.config.ts`, and a `/styleguide` internal page (dev-only) rendering all tokens. This page is your visual regression reference.

---

## 2. Core Component Library (build SECOND)

Refactor the Day 1–7 ad-hoc components into one consistent set. Each gets variants, sizes, and proper states (default, hover, active, focus, disabled, loading).

### 2.1 Button (`components/ui/Button.tsx`)
- Variants: `primary` (teal, white text), `secondary` (white, border), `ghost` (transparent), `danger` (rose).
- Sizes: `sm` (h-9), `md` (h-11), `lg` (h-12, full-width on mobile).
- Built-in `loading` prop → spinner replaces label, button keeps width (no layout shift), auto-disabled.
- `icon` and `iconRight` slots.
- Focus ring: `ring-2 ring-teal-500 ring-offset-2`.
- Active state: subtle `scale-[0.98]` + darker bg (feels tactile on mobile).

### 2.2 Input / Textarea / Select (`components/ui/`)
- Label above, consistent `text-secondary` color, `caption` size.
- Input: `h-11`, `rounded-lg`, `border --border`, focus `border-teal-500 ring-2 ring-teal-100`.
- Error state: `border-rose-500`, helper text below in rose, `aria-invalid` set.
- Prefix/suffix support (e.g., "AED" prefix inside the amount field — looks far more professional than a separate label).
- Select: replace native dropdown with a styled headless component (Radix Select) for the Project Type field — native selects look basic and inconsistent across devices.

### 2.3 Card (`components/ui/Card.tsx`)
- `Card`, `CardHeader`, `CardBody`, `CardFooter`.
- 1px border + `shadow-card`, `rounded-xl`, `bg-surface`.
- Optional `interactive` prop → hover lifts border to teal + tiny shadow increase (for clickable quote rows).

### 2.4 Badge (`components/ui/Badge.tsx`)
- Refine the Day-4 StatusBadge: soft tinted background + matching text (e.g., Won = `bg-emerald-50 text-emerald-700`), not solid blocks. A 6px dot before the label adds polish.

### 2.5 Feedback components
- **Toast:** reuse Day-7 toast but add slide-up + fade, icon per type, `shadow-pop`, `rounded-xl`. Stack multiple toasts.
- **Skeleton:** shimmer (not just pulse) — a subtle moving gradient reads as more premium. Build skeletons that match exact card layouts.
- **EmptyState:** lucide icon in a `teal-50` circle, `h3` heading, `body-sm` description, single primary CTA.
- **Dialog / Sheet:** Radix Dialog. On mobile, render as a bottom **sheet** (slides up) instead of a centered modal — this is the single most "native app" feeling upgrade. Use for the Upgrade prompt and confirmations.

### 2.6 Layout primitives
- **AppShell:** sticky top bar + content container (`max-w-3xl` for forms, `max-w-5xl` for dashboard) with consistent horizontal padding.
- **PageHeader:** title + optional subtitle + right-aligned action slot. Used on every `/app/*` page for consistency.
- **BottomNav (mobile):** fixed bottom tab bar (Dashboard / New Quote / Clients / Account) with safe-area padding. This alone transforms the app from "website" to "app". On desktop, collapse into a left sidebar.

**Deliverable for Section 2:** all components in `components/ui/`, documented on the `/styleguide` page. Migrate existing pages to use them incrementally (Section 4).

---

## 3. Motion & Micro-interactions

Adopt **Framer Motion** (already React, small footprint with tree-shaking) — or CSS-only if bundle size is a concern. Keep it subtle.

Rules:
- Durations: 150ms (micro), 250ms (transitions), 350ms (sheets/modals). Never longer.
- Easing: `ease-out` for enters, `ease-in` for exits.
- Respect `prefers-reduced-motion` — disable all non-essential motion.

Targeted interactions (high impact, low effort):
- **Page transitions:** fade + 8px upward slide on route change.
- **Quote line items:** new row animates in (height + opacity); removed row animates out.
- **Total recalculation:** when subtotal/VAT/total updates, animate the number with a brief color flash to teal (`AnimatePresence` or a count-up). This makes the live-recalc feel alive.
- **Button press:** scale 0.98 (Section 2.1).
- **Toast / sheet:** spring slide.
- **Generate Quote loading:** replace the plain spinner with a branded, staged loader ("Analyzing project… → Pricing line items… → Applying VAT…") cycling through real steps over ~10s. This turns dead wait time into perceived intelligence and is a signature moment.
- **Skeleton → content:** crossfade, never a hard pop.

---

## 4. Page-by-Page Redesign

Order = by user impact and demo value. Each page: keep the route, swap internals to the new system.

### 4.1 Landing Page `/` (highest external impact)
This is what strangers judge you on. Make it the most polished.
- **Hero:** large `display` heading, supportive subtext, two CTAs (primary teal + secondary ghost). Add a real product visual — a clean mockup of a generated quote PDF / dashboard inside a phone frame on the right (desktop) or below (mobile). A static, well-shot product image beats any abstract illustration.
- **Trust line** with small lucide check icons.
- **Features section:** 3 cards with lucide icons in tinted circles, hover lift. Add a one-line "how it works" 3-step strip (Describe → Generate → Share) with connecting line.
- **Pricing:** redesigned cards (see 4.6) — geo-detected currency unchanged, just visually elevated. Highlight Starter with a teal top border + "Most Popular" pill.
- **Social proof:** if you have even one quote stat ("X quotes generated"), show it as a number band. Otherwise a clean logo-less testimonial card.
- **FAQ:** accordion (Radix Accordion), not static text. Smooth expand.
- **Footer:** structured, multi-column on desktop, with the teal logo.
- Add subtle scroll-reveal (fade-up) on each section as it enters viewport.

### 4.2 Auth flow
- Centered card on a soft gradient/`--bg` background. Logo at top.
- Magic-link state machine with clear visuals: email input → "Check your inbox" confirmation screen with a mail icon, the email shown, and a "resend" link with a 30s cooldown. Currently this is likely a bare form — the confirmation screen is the polish.

### 4.3 Quote Builder `/app/quotes/new` (core moment)
- Single-column card, generous spacing, `PageHeader` "New Quote".
- Project Type: styled Radix Select with icons per type.
- Amount field: "AED" prefix inside the input.
- Textarea: auto-grow, character counter (min 20) with subtle progress.
- Sticky bottom action bar on mobile holding the full-width "Generate My Quote" button (always reachable with thumb).
- Use the staged loader (Section 3) during generation.
- Inline validation with the new error states; scroll to first error on submit.

### 4.4 Editable Quote `/app/quotes/[id]` (core moment)
- Quote presented as a **document-like card** — header with company + quote number, then the line-items table styled like the final PDF (builds trust: "what I see is what I send").
- Line items: each row in a clean grid. On mobile, stack into mini-cards (label + value pairs) rather than a cramped horizontal table — this is critical, tables don't work on phones.
- Editable fields use the new Input with inline focus states; tapping a value turns it into an editable field smoothly.
- Live totals in a right-aligned summary block with `mono-num` tabular figures and the recalc animation.
- Sticky action bar: "Save" (secondary) + "Generate PDF" (primary). After PDF, reveal Share row (WhatsApp + Copy Link) with a success check animation.

### 4.5 Dashboard `/app/dashboard`
- `PageHeader` "Your Quotes" + plan badge + usage chip.
- **Stats row:** 3 refined stat cards — big `mono-num` value, small label, tiny trend/icon. Subtle teal accent on the primary stat (Pipeline Value). On mobile, horizontal scroll or 1-col stack, not cramped 3-col.
- **Usage banner:** slim progress bar (quotes used / limit), turns amber near limit. Inline, not a heavy box.
- **Quote list:** interactive Cards, each showing client, quote number, amount (`mono-num`), status badge with dot, relative date ("2 days ago"). Won/Lost actions in a `⋯` menu (Radix Dropdown) to reduce clutter, or swipe-to-action on mobile.
- **Skeletons** matching this exact layout on load.
- **Empty state** when no quotes — illustration-free, lucide icon + CTA.

### 4.6 Upgrade `/app/upgrade` & Pricing cards
- Three cards, Starter highlighted (teal top border, "Most Popular" pill, slight scale-up on desktop).
- Feature lists with lucide check icons; muted dash for not-included.
- Local currency from `getPricing()` (unchanged logic), large `mono-num` price + small "/month".
- On mobile, render Upgrade as a **bottom sheet** when triggered by hitting the quote limit — feels native and contextual.
- FAQ accordion reused from landing.

### 4.7 Public quote view `/quote/[token]` (client-facing — second-highest external impact)
- This is what the *contractor's client* sees. It must look premium because it reflects on the contractor.
- Clean document layout, company branding header, mobile-optimized line-item cards, prominent total in a teal-tinted block, clear terms.
- "Powered by QuotePro" footer (your viral loop) — small, tasteful.
- Fast load, no auth, no clutter.

### 4.8 Profile / Account `/app/profile`
- Sectioned settings card layout (Personal, Company, Plan). Inline-editable fields with save-on-blur or a single Save button. Plan section shows current plan + manage/upgrade link.

---

## 5. Accessibility & Quality Bar

Award-grade = accessible.
- All interactive elements ≥ 44×44px touch target (already a Day-7 goal — enforce via the Button/Input sizes).
- Color contrast AA minimum (the token shades above are chosen for this).
- Every input has a `<label>`; errors use `aria-describedby` + `aria-invalid`.
- Focus visible everywhere (the teal ring). Never `outline: none` without a replacement.
- Radix primitives (Select, Dialog, Accordion, Dropdown) give keyboard nav + ARIA for free — a major reason to adopt them.
- Test with VoiceOver (iOS) on the core flow.

> Note: full WCAG validation requires manual testing with assistive tech and expert review. This plan gets us to a strong baseline, not a certified audit.

---

## 6. Implementation Phases (suggested order)

Each phase is shippable and reversible. Don't start a phase before the previous one's foundation exists.

**Phase A — Foundation (no visible change yet)**
Tokens, `tailwind.config.ts`, globals.css, lucide install, `/styleguide` page. Adopt Radix + Framer Motion.

**Phase B — Component library**
Build `components/ui/*`. Migrate existing buttons/inputs/badges to the new ones across the app (mechanical, low-risk).

**Phase C — App shell & navigation**
AppShell, PageHeader, mobile BottomNav / desktop sidebar. Instantly makes the whole app feel cohesive.

**Phase D — Core flow polish (highest user value)**
Quote Builder → Editable Quote → Dashboard. Add motion, skeletons, staged loader, mobile line-item cards.

**Phase E — External-facing surfaces**
Landing page redesign, Public quote view, Upgrade/pricing cards. Highest impact for conversion and word-of-mouth.

**Phase F — Final polish**
Auth confirmation screen, Profile, empty states, toasts, reduced-motion pass, accessibility sweep, cross-device testing (iPhone Safari, Android Chrome, Samsung Internet).

---

## 7. New Dependencies (all small, well-maintained)

| Package | Purpose | Why |
|---|---|---|
| `lucide-react` | Icons | Consistent, tree-shakeable |
| `@radix-ui/react-*` (select, dialog, accordion, dropdown-menu) | Headless accessible primitives | Accessibility + behavior for free |
| `framer-motion` | Motion | Industry-standard, reduced-motion aware |
| `tailwind-merge` + `clsx` | Class composition | Clean variant logic in components |
| `class-variance-authority` (optional) | Component variants | Tidy button/badge variant APIs |

Pin exact versions. No other stack changes. PDF generation, Supabase, Stripe, geo logic — all untouched.

---

## 8. Definition of Done (UI upgrade)

- [ ] `/styleguide` renders the full token + component set with no inconsistencies.
- [ ] Every page uses `components/ui/*` — zero ad-hoc buttons/inputs left.
- [ ] Mobile bottom nav + safe-area handling on all `/app/*` routes.
- [ ] Core flow (new → edit → PDF → share) feels fast: skeletons, staged loader, optimistic totals, motion.
- [ ] Landing + public quote view look client-ready and premium.
- [ ] All tables collapse to readable cards on mobile.
- [ ] Focus rings, labels, AA contrast, reduced-motion all verified.
- [ ] Tested on iPhone Safari, Android Chrome, Samsung Internet — no layout breaks.
- [ ] No regression in Day 1–7 functionality (auth, generation, PDF, payments, geo).

---

**North star:** A contractor opens it at 7 AM, and it feels like a tool built by a serious company — fast, clean, and something they're proud to put their name on when the quote reaches their client.
```

