"use client";

import { Users } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';

/**
 * /app/clients — stub page for Phase C.
 * Client CRUD is out of scope; this prevents the nav tab from 404-ing.
 * Replace with real client list in a future phase.
 */
export default function ClientsPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Clients"
                subtitle="Manage your client contacts and companies."
            />
            <EmptyState
                icon={Users}
                heading="Clients coming soon"
                description="Your client list will live here. For now, client details are captured inside each quote."
                action={{ label: 'New Quote', href: '/app/quotes/new' }}
            />
        </div>
    );
}
