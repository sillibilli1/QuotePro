'use client';

import { Client } from '@/types';
import { Building2, Mail, Phone, FileText, Calendar } from 'lucide-react';
import Link from 'next/link';

interface ClientCardProps {
    client: Client;
    onViewDetails: (client: Client) => void;
}

export function ClientCard({ client, onViewDetails }: ClientCardProps) {
    const formatDate = (date: string | null) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatCurrency = (value: Record<string, number>) => {
        return Object.entries(value)
            .map(([currency, amount]) => `${currency} ${amount.toLocaleString()}`)
            .join(', ');
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white">{client.name}</h3>
                    {client.company && (
                        <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                            <Building2 className="w-4 h-4" />
                            <span>{client.company}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-2 mb-4 hidden md:block">
                {client.email && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Mail className="w-4 h-4" />
                        <span>{client.email}</span>
                    </div>
                )}
                {client.phone && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Phone className="w-4 h-4" />
                        <span>{client.phone}</span>
                    </div>
                )}
            </div>

            <div className="border-t border-gray-700 pt-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <FileText className="w-4 h-4" />
                    <span>{client.quote_count || 0} quote{client.quote_count !== 1 ? 's' : ''}</span>
                </div>
                {client.total_value && Object.keys(client.total_value).length > 0 && (
                    <div className="text-sm text-gray-300 font-medium">
                        Total: {formatCurrency(client.total_value)}
                    </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <Calendar className="w-4 h-4" />
                    <span>Last quote: {formatDate(client.last_quote_date || null)}</span>
                </div>
            </div>

            <div className="flex gap-2">
                <Link
                    href={`/app/quotes/new?client_id=${client.id}`}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors text-center"
                >
                    New Quote
                </Link>
                <button
                    onClick={() => onViewDetails(client)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    View
                </button>
            </div>
        </div>
    );
}
