'use client';

import { useState, useEffect } from 'react';
import { Client } from '@/types';
import { X, Mail, Phone, Building2, FileText, Calendar } from 'lucide-react';
import Link from 'next/link';
import { EditClientDialog } from './EditClientDialog';

interface ClientDetailModalProps {
    client: Client;
    onClose: () => void;
    onClientUpdated: (client: Client) => void;
}

interface Quote {
    id: string;
    quote_number: string | null;
    status: string;
    total_aed: number | null;
    currency: string;
    created_at: string;
}

export function ClientDetailModal({ client, onClose, onClientUpdated }: ClientDetailModalProps) {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditDialog, setShowEditDialog] = useState(false);

    useEffect(() => {
        fetch(`/api/clients/${client.id}/quotes`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setQuotes(data.quotes);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [client.id]);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{client.name}</h2>
                        {client.company && <p className="text-gray-400 mt-1">{client.company}</p>}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-3">
                        {client.email && (
                            <div className="flex items-center gap-3 text-gray-300">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <span>{client.email}</span>
                            </div>
                        )}
                        {client.phone && (
                            <div className="flex items-center gap-3 text-gray-300">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <span>{client.phone}</span>
                            </div>
                        )}
                        {client.company && (
                            <div className="flex items-center gap-3 text-gray-300">
                                <Building2 className="w-5 h-5 text-gray-400" />
                                <span>{client.company}</span>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Quotes ({quotes.length})
                        </h3>
                        {loading ? (
                            <p className="text-gray-400">Loading quotes...</p>
                        ) : quotes.length === 0 ? (
                            <p className="text-gray-400">No quotes yet</p>
                        ) : (
                            <div className="space-y-2">
                                {quotes.map(quote => (
                                    <Link
                                        key={quote.id}
                                        href={`/quotes/${quote.id}`}
                                        className="block p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-white font-medium">
                                                {quote.quote_number || `Quote #${quote.id.slice(0, 8)}`}
                                            </span>
                                            <span className="text-sm text-gray-400">
                                                {quote.currency} {quote.total_aed?.toLocaleString() || 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1 text-sm">
                                            <span className="text-gray-400 capitalize">{quote.status}</span>
                                            <span className="text-gray-500">
                                                {new Date(quote.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Link
                            href={`/app/quotes/new?client_id=${client.id}`}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-center"
                        >
                            Create New Quote
                        </Link>
                        <button
                            onClick={() => setShowEditDialog(true)}
                            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                        >
                            Edit
                        </button>
                    </div>
                </div>
            </div>

            {showEditDialog && (
                <EditClientDialog
                    client={client}
                    onClose={() => setShowEditDialog(false)}
                    onClientUpdated={(updated: Client) => {
                        onClientUpdated(updated);
                        setShowEditDialog(false);
                    }}
                />
            )}
        </div>
    );
}
