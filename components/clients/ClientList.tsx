'use client';

import { useState } from 'react';
import { Client } from '@/types';
import { ClientCard } from './ClientCard';
import { ClientDetailModal } from './ClientDetailModal';
import { AddClientDialog } from './AddClientDialog';
import { Search, Plus } from 'lucide-react';

interface ClientListProps {
    initialClients: Client[];
}

export function ClientList({ initialClients }: ClientListProps) {
    const [clients, setClients] = useState<Client[]>(initialClients);
    const [search, setSearch] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [showAddDialog, setShowAddDialog] = useState(false);

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.company?.toLowerCase().includes(search.toLowerCase())
    );

    const handleClientAdded = (newClient: Client) => {
        setClients([newClient, ...clients]);
        setShowAddDialog(false);
    };

    const handleClientUpdated = (updatedClient: Client) => {
        setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
    };

    return (
        <>
            <div className="mb-6 flex gap-4 items-center">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search clients by name or company..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    onClick={() => setShowAddDialog(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Client
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredClients.map(client => (
                    <ClientCard
                        key={client.id}
                        client={client}
                        onViewDetails={setSelectedClient}
                    />
                ))}
            </div>

            {selectedClient && (
                <ClientDetailModal
                    client={selectedClient}
                    onClose={() => setSelectedClient(null)}
                    onClientUpdated={handleClientUpdated}
                />
            )}

            {showAddDialog && (
                <AddClientDialog
                    onClose={() => setShowAddDialog(false)}
                    onClientAdded={handleClientAdded}
                />
            )}
        </>
    );
}
