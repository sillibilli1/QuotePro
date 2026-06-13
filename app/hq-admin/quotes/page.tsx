'use client';

import { useState, useEffect } from 'react';

interface Quote {
    id: string;
    quote_number: string;
    status: string;
    currency: string;
    total_aed: number;
    created_at: string;
    user: { email: string };
    client: { name: string; company?: string };
}

export default function QuotesPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [status, setStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetch(`/api/admin/quotes?status=${status}`)
            .then(res => res.json())
            .then(data => setQuotes(data.quotes || []));
    }, [status]);

    const filteredQuotes = quotes.filter(quote => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            quote.quote_number?.toLowerCase().includes(query) ||
            quote.client?.name?.toLowerCase().includes(query) ||
            quote.client?.company?.toLowerCase().includes(query) ||
            quote.user?.email?.toLowerCase().includes(query)
        );
    });

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Quote Analytics</h1>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search by quote #, client, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-900"
                />
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-red-900"
                >
                    <option value="all">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="accepted">Accepted</option>
                    <option value="won">Won</option>
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-800 rounded-lg">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-4 py-3 text-left">Quote #</th>
                            <th className="px-4 py-3 text-left">User</th>
                            <th className="px-4 py-3 text-left">Client</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Total</th>
                            <th className="px-4 py-3 text-left">Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredQuotes.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                                    {searchQuery.trim() ? 'No quotes found matching your search' : 'No quotes available'}
                                </td>
                            </tr>
                        ) : (
                            filteredQuotes.map((quote) => (
                                <tr key={quote.id} className="border-t border-gray-800 hover:bg-gray-900/50">
                                    <td className="px-4 py-3 text-sm">{quote.quote_number}</td>
                                    <td className="px-4 py-3 text-sm">{quote.user?.email}</td>
                                    <td className="px-4 py-3 text-sm">{quote.client?.name}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 rounded text-xs bg-gray-800">{quote.status}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{quote.currency} {quote.total_aed?.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm text-gray-400">{new Date(quote.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
