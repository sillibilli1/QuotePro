import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ClientList } from '@/components/clients/ClientList';
import { Users } from 'lucide-react';

export default async function ClientsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth');
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const res = await fetch(`${baseUrl}/api/clients`, {
        headers: { Cookie: (await import('next/headers')).cookies().toString() },
        cache: 'no-store',
    });

    const data = await res.json();
    const clients = data.success ? data.clients : [];

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white">Clients</h1>
                <p className="text-gray-400 mt-1">Manage your client relationships</p>
            </div>

            {clients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Users className="w-16 h-16 text-gray-600 mb-4" />
                    <p className="text-gray-400 text-lg mb-4">No clients yet. Create your first quote to get started.</p>
                    <a
                        href="/app/quotes/new"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Create Quote
                    </a>
                </div>
            ) : (
                <ClientList initialClients={clients} />
            )}
        </div>
    );
}
