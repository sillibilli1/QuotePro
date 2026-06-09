/**
 * /styleguide — Design-system component reference (dev-only).
 *
 * Phase A: token swatches
 * Phase B: every ui/* component in all variants/sizes/states
 *
 * NOT linked from any user-facing nav. Protect or remove in production.
 */

'use client';

import { useState } from 'react';
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    ChevronDown,
    FileText,
    Home,
    Info,
    Mail,
    Plus,
    Search,
    Settings,
    Star,
    Trash2,
    User,
    X,
    Zap,
    FilePlus,
    CreditCard,
} from 'lucide-react';

import { STATUS_MAP, QUOTE_STATUSES } from '@/lib/ui/status';

// UI components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { ToastContainer, useToasts } from '@/components/ui/Toast';
import { Skeleton, QuoteCardSkeleton, DashboardStatsSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
    Dialog,
    DialogRoot,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/Dialog';
import {
    Sheet,
    SheetRoot,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/components/ui/Sheet';

/* ─── helpers ─────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-14">
            <h2 className="mb-6 border-b border-zinc-200 pb-2 text-lg font-semibold text-text-primary">
                {title}
            </h2>
            {children}
        </section>
    );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="mb-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-tertiary">{label}</p>
            <div className="flex flex-wrap items-center gap-3">{children}</div>
        </div>
    );
}

function Swatch({ bg, label, hex }: { bg: string; label: string; hex: string }) {
    return (
        <div className="flex flex-col items-start gap-1">
            <div className={`w-16 h-16 rounded-xl border border-zinc-200 ${bg}`} />
            <span className="text-xs text-text-primary">{label}</span>
            <span className="text-xs text-text-tertiary">{hex}</span>
        </div>
    );
}

/* ─── page ────────────────────────────────────────────────────── */

export default function StyleguidePage() {
    // ── Toast demo ──
    const { toasts, addToast, removeToast } = useToasts();

    // ── Dialog demo ──
    const [dialogOpen, setDialogOpen] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);

    // ── Input demo state ──
    const [inputValue, setInputValue] = useState('');
    const [textareaValue, setTextareaValue] = useState('');
    const [selectValue, setSelectValue] = useState('');

    return (
        <div className="min-h-screen bg-bg px-6 py-10 max-w-5xl mx-auto">
            <ToastContainer toasts={toasts} onClose={removeToast} />

            {/* Header */}
            <div className="mb-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-1">
                    ⚠ Dev-only · Not linked from app nav
                </p>
                <h1 className="text-3xl font-bold text-text-primary">QuotePro Design System</h1>
                <p className="text-sm text-text-secondary mt-1">
                    Phase B — Component library. Every component rendered in all variants/states.
                </p>
            </div>

            {/* ── 1. Color Tokens ── */}
            <Section title="1. Teal Scale">
                <div className="flex flex-wrap gap-4">
                    {(
                        [
                            ['50', 'bg-teal-50', '#F0FDFA'],
                            ['100', 'bg-teal-100', '#CCFBF1'],
                            ['200', 'bg-teal-200', '#99F6E4'],
                            ['300', 'bg-teal-300', '#5EEAD4'],
                            ['400', 'bg-teal-400', '#2DD4BF'],
                            ['500', 'bg-teal-500', '#14B8A6'],
                            ['600', 'bg-teal-600', '#0D9488'],
                            ['700', 'bg-teal-700', '#0F766E'],
                            ['800', 'bg-teal-800', '#115E59'],
                            ['900', 'bg-teal-900', '#134E4A'],
                        ] as [string, string, string][]
                    ).map(([shade, bg, hex]) => (
                        <Swatch key={shade} bg={bg} label={`teal-${shade}`} hex={hex} />
                    ))}
                </div>
            </Section>

            <Section title="2. Semantic Tokens">
                <div className="flex flex-wrap gap-4 mb-4">
                    <Swatch bg="bg-[#FAFAFA] border border-zinc-200" label="--bg" hex="#FAFAFA" />
                    <Swatch bg="bg-white border border-zinc-200" label="--surface" hex="#FFFFFF" />
                    <Swatch bg="bg-[#F4F4F5] border border-zinc-200" label="--surface-subtle" hex="#F4F4F5" />
                    <Swatch bg="bg-[#E4E4E7] border border-zinc-300" label="--border" hex="#E4E4E7" />
                    <Swatch bg="bg-[#18181B]" label="--text-primary" hex="#18181B" />
                    <Swatch bg="bg-[#52525B]" label="--text-secondary" hex="#52525B" />
                    <Swatch bg="bg-[#A1A1AA]" label="--text-tertiary" hex="#A1A1AA" />
                    <Swatch bg="bg-teal-600" label="--accent" hex="#0D9488" />
                </div>
            </Section>

            <Section title="3. Status Tokens">
                <div className="flex flex-wrap gap-4">
                    {QUOTE_STATUSES.map((s) => {
                        const t = STATUS_MAP[s];
                        return (
                            <div key={s} className="flex flex-col items-start gap-1">
                                <div className={`px-3 py-1 rounded-lg text-xs font-medium ${t.bgClass} ${t.textClass} border ${t.borderClass}`}>
                                    {t.label}
                                </div>
                                <span className="text-xs text-text-tertiary">{t.hex}</span>
                            </div>
                        );
                    })}
                </div>
            </Section>

            {/* ── 4. Button ── */}
            <Section title="4. Button">
                <Row label="Variants">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger">Danger</Button>
                </Row>

                <Row label="Sizes">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                </Row>

                <Row label="With icons">
                    <Button icon={<Plus className="h-4 w-4" />}>New Quote</Button>
                    <Button iconRight={<ArrowRight className="h-4 w-4" />} variant="secondary">Continue</Button>
                    <Button icon={<Trash2 className="h-4 w-4" />} variant="danger">Delete</Button>
                </Row>

                <Row label="States">
                    <Button loading>Loading</Button>
                    <Button disabled>Disabled</Button>
                    <Button variant="secondary" loading>Loading Secondary</Button>
                </Row>

                <Row label="Toast triggers">
                    <Button variant="primary" onClick={() => addToast('Quote saved successfully.', 'success')}>
                        Show Success Toast
                    </Button>
                    <Button variant="danger" onClick={() => addToast('Failed to generate PDF.', 'error')}>
                        Show Error Toast
                    </Button>
                    <Button variant="secondary" onClick={() => addToast('Processing your request…', 'info')}>
                        Show Info Toast
                    </Button>
                </Row>
            </Section>

            {/* ── 5. Input ── */}
            <Section title="5. Input">
                <div className="max-w-sm space-y-4">
                    <Row label="Default">
                        <div className="w-full">
                            <Input
                                label="Client Name"
                                placeholder="Ahmed Khan"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                        </div>
                    </Row>
                    <Row label="With prefix">
                        <div className="w-full">
                            <Input label="Amount" prefix="AED" placeholder="35,000" type="number" />
                        </div>
                    </Row>
                    <Row label="With suffix">
                        <div className="w-full">
                            <Input label="Search" suffix={<Search className="h-4 w-4" />} placeholder="Search quotes…" />
                        </div>
                    </Row>
                    <Row label="Error state">
                        <div className="w-full">
                            <Input
                                label="Email"
                                placeholder="you@example.com"
                                error="Please enter a valid email address."
                                defaultValue="not-an-email"
                            />
                        </div>
                    </Row>
                    <Row label="With hint">
                        <div className="w-full">
                            <Input
                                label="Phone"
                                placeholder="+971 50 123 4567"
                                hint="Include country code for WhatsApp sharing."
                            />
                        </div>
                    </Row>
                    <Row label="Disabled">
                        <div className="w-full">
                            <Input label="Email (read-only)" value="user@example.com" disabled readOnly />
                        </div>
                    </Row>
                </div>
            </Section>

            {/* ── 6. Textarea ── */}
            <Section title="6. Textarea">
                <div className="max-w-sm space-y-4">
                    <Row label="Default">
                        <div className="w-full">
                            <Textarea
                                label="Project Brief"
                                placeholder="Describe the work…"
                                value={textareaValue}
                                onChange={(e) => setTextareaValue(e.target.value)}
                            />
                        </div>
                    </Row>
                    <Row label="With character counter">
                        <div className="w-full">
                            <Textarea
                                label="Notes"
                                placeholder="Add notes…"
                                showCount
                                maxLength={200}
                                value={textareaValue}
                                onChange={(e) => setTextareaValue(e.target.value)}
                            />
                        </div>
                    </Row>
                    <Row label="Error state">
                        <div className="w-full">
                            <Textarea
                                label="Brief"
                                error="Project brief is required."
                                defaultValue=""
                            />
                        </div>
                    </Row>
                    <Row label="Auto-grow">
                        <div className="w-full">
                            <Textarea
                                label="Auto-grow textarea"
                                placeholder="Type more lines to see it grow…"
                                autoGrow
                                value={textareaValue}
                                onChange={(e) => setTextareaValue(e.target.value)}
                            />
                        </div>
                    </Row>
                </div>
            </Section>

            {/* ── 7. Select ── */}
            <Section title="7. Select (Radix)">
                <div className="max-w-sm space-y-4">
                    <Row label="Default">
                        <div className="w-full">
                            <Select
                                label="Project Type"
                                placeholder="Select project type"
                                value={selectValue}
                                onValueChange={setSelectValue}
                                options={[
                                    { value: 'Maintenance', label: 'Maintenance' },
                                    { value: 'Installation', label: 'Installation' },
                                    { value: 'Renovation', label: 'Renovation' },
                                    { value: 'Fit-out', label: 'Fit-out' },
                                    { value: 'Civil Works', label: 'Civil Works' },
                                ]}
                            />
                        </div>
                    </Row>
                    <Row label="With icons per option">
                        <div className="w-full">
                            <Select
                                label="Plan"
                                placeholder="Choose plan"
                                options={[
                                    { value: 'free', label: 'Free', icon: <Star className="h-3.5 w-3.5" /> },
                                    { value: 'starter', label: 'Starter', icon: <Zap className="h-3.5 w-3.5" /> },
                                    { value: 'growth', label: 'Growth', icon: <ArrowRight className="h-3.5 w-3.5" /> },
                                ]}
                            />
                        </div>
                    </Row>
                    <Row label="Error state">
                        <div className="w-full">
                            <Select
                                label="Status"
                                placeholder="Select status"
                                error="Status is required."
                                options={[
                                    { value: 'draft', label: 'Draft' },
                                    { value: 'sent', label: 'Sent' },
                                ]}
                            />
                        </div>
                    </Row>
                    <Row label="Disabled">
                        <div className="w-full">
                            <Select
                                label="Currency"
                                placeholder="AED"
                                disabled
                                options={[{ value: 'AED', label: 'AED' }]}
                            />
                        </div>
                    </Row>
                </div>
            </Section>

            {/* ── 8. Card ── */}
            <Section title="8. Card">
                <Row label="Static">
                    <Card className="w-64">
                        <CardHeader>
                            <h3 className="font-semibold text-text-primary">Quote #QP-001</h3>
                            <p className="text-sm text-text-secondary">Ahmed Khan · ABC Corp</p>
                        </CardHeader>
                        <CardBody>
                            <p className="text-sm text-text-secondary">AED 35,000.00 · Maintenance</p>
                        </CardBody>
                        <CardFooter className="gap-2">
                            <Button size="sm" variant="secondary">View</Button>
                            <Button size="sm">Share</Button>
                        </CardFooter>
                    </Card>
                </Row>
                <Row label="Interactive (hover to lift)">
                    <Card interactive className="w-64 p-4 cursor-pointer">
                        <p className="font-semibold text-text-primary">Interactive Card</p>
                        <p className="text-sm text-text-secondary mt-1">Hover to see teal border lift.</p>
                    </Card>
                </Row>
            </Section>

            {/* ── 9. Badge ── */}
            <Section title="9. Badge">
                <Row label="Variants">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="danger">Danger</Badge>
                    <Badge variant="info">Info</Badge>
                </Row>
                <Row label="With dot">
                    <Badge variant="success" dot>Won</Badge>
                    <Badge variant="warning" dot>Pending</Badge>
                    <Badge variant="danger" dot>Lost</Badge>
                    <Badge variant="info" dot>Sent</Badge>
                </Row>
                <Row label="StatusBadge (from lib/ui/status.ts)">
                    {QUOTE_STATUSES.map((s) => (
                        <StatusBadge key={s} status={s} dot />
                    ))}
                </Row>
            </Section>

            {/* ── 10. Toast ── */}
            <Section title="10. Toast">
                <Row label="Trigger toasts (stacks at bottom-center)">
                    <Button
                        variant="primary"
                        icon={<CheckCircle2 className="h-4 w-4" />}
                        onClick={() => addToast('Quote saved successfully.', 'success')}
                    >
                        Success toast
                    </Button>
                    <Button
                        variant="danger"
                        icon={<AlertCircle className="h-4 w-4" />}
                        onClick={() => addToast('Failed to generate PDF.', 'error')}
                    >
                        Error toast
                    </Button>
                    <Button
                        variant="secondary"
                        icon={<Info className="h-4 w-4" />}
                        onClick={() => addToast('Processing your request…', 'info')}
                    >
                        Info toast
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            addToast('First notification', 'success');
                            setTimeout(() => addToast('Second notification', 'info'), 300);
                            setTimeout(() => addToast('Third notification', 'error'), 600);
                        }}
                    >
                        Stack 3 toasts
                    </Button>
                </Row>
            </Section>

            {/* ── 11. Skeleton ── */}
            <Section title="11. Skeleton">
                <Row label="Single boxes">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16 rounded-full" />
                    <Skeleton className="h-11 w-40" />
                </Row>
                <Row label="Quote card skeleton">
                    <div className="w-full max-w-sm">
                        <QuoteCardSkeleton />
                    </div>
                </Row>
                <Row label="Dashboard stats skeleton">
                    <div className="w-full">
                        <DashboardStatsSkeleton />
                    </div>
                </Row>
            </Section>

            {/* ── 12. EmptyState ── */}
            <Section title="12. EmptyState">
                <Row label="With icon + description + CTA">
                    <div className="w-full max-w-sm rounded-xl border border-border bg-surface">
                        <EmptyState
                            icon={FileText}
                            heading="No quotes yet"
                            description="Create your first AI-generated quote in under 60 seconds."
                            action={{ label: 'New Quote', href: '/app/quotes/new' }}
                        />
                    </div>
                </Row>
                <Row label="Minimal (heading only)">
                    <div className="w-full max-w-sm rounded-xl border border-border bg-surface">
                        <EmptyState heading="Nothing here yet" />
                    </div>
                </Row>
                <Row label="With onClick CTA">
                    <div className="w-full max-w-sm rounded-xl border border-border bg-surface">
                        <EmptyState
                            icon={CreditCard}
                            heading="No payment method"
                            description="Add a card to unlock Starter features."
                            action={{ label: 'Add Payment Method', onClick: () => addToast('Payment method flow…', 'info') }}
                        />
                    </div>
                </Row>
            </Section>

            {/* ── 13. Dialog ── */}
            <Section title="13. Dialog (Radix)">
                <Row label="Centered modal">
                    <Button variant="primary" onClick={() => setDialogOpen(true)}>
                        Open Dialog
                    </Button>
                    <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogContent title="Confirm action" description="Destructive action confirmation">
                            <DialogHeader>
                                <DialogTitle>Delete Quote QP-042?</DialogTitle>
                                <DialogDescription>
                                    This action is permanent. The quote and all its data will be removed.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
                                <Button variant="danger" onClick={() => { setDialogOpen(false); addToast('Quote deleted.', 'error'); }}>
                                    Delete
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </DialogRoot>
                </Row>
            </Section>

            {/* ── 14. Sheet ── */}
            <Section title="14. Sheet (bottom on mobile, centered on desktop)">
                <Row label="Bottom sheet / confirmation">
                    <Button variant="secondary" onClick={() => setSheetOpen(true)}>
                        Open Sheet
                    </Button>
                    <SheetRoot open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetContent title="Upgrade to Starter" description="Plan upgrade prompt">
                            <SheetHeader>
                                <SheetTitle>Upgrade to Starter</SheetTitle>
                                <SheetDescription>
                                    Unlock unlimited quotes, PDF downloads, and WhatsApp tracking.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="mt-4 space-y-2 text-sm text-text-secondary">
                                <p>✓ Unlimited AI-generated quotes</p>
                                <p>✓ Watermark-free PDFs</p>
                                <p>✓ WhatsApp view tracking</p>
                                <p>✓ Priority support</p>
                            </div>
                            <SheetFooter>
                                <Button variant="primary" size="lg" fullWidthMobile onClick={() => { setSheetOpen(false); addToast('Redirecting to checkout…', 'info'); }}>
                                    Upgrade Now
                                </Button>
                                <Button variant="ghost" size="md" onClick={() => setSheetOpen(false)}>
                                    Maybe later
                                </Button>
                            </SheetFooter>
                        </SheetContent>
                    </SheetRoot>
                </Row>
            </Section>

            {/* ── Phase A tokens (preserved) ── */}
            <Section title="15. Typography Scale (Phase A)">
                <div className="space-y-3">
                    <p className="type-h1 text-text-primary">Heading 1 — type-h1</p>
                    <p className="type-h2 text-text-primary">Heading 2 — type-h2</p>
                    <p className="type-h3 text-text-primary">Heading 3 — type-h3</p>
                    <p className="type-body text-text-primary">Body — type-body</p>
                    <p className="type-body-sm text-text-secondary">Body small — type-body-sm</p>
                    <p className="type-caption text-text-tertiary">Caption — type-caption</p>
                    <p className="type-mono text-text-primary tabular-nums">AED 1,234,567.89 — type-mono</p>
                </div>
            </Section>
        </div>
    );
}
