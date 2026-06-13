'use client';

import { useState, useEffect } from 'react';
import { Check, X, Clock } from 'lucide-react';

interface PaymentRequest {
    id: string;
    user_id: string;
    plan: string;
    currency: string;
    amount: number;
    reference: string;
    created_at: string;
    user: {
        email: string;
        full_name: string;
        company_name: string;
    };
}

export default function PaymentsPage() {
    const [requests, setRequests] = useState<PaymentRequest[]>([]);

    useEffect(() => {
        fetch('/api/admin/payments/pending')
            .then(res => res.json())
            .then(data => setRequests(data.requests || []));
    }, []);

    const handleApprove = async (id: string) => {
        if (!confirm('Approve this payment?')) return;
        await fetch(`/api/admin/payments/${id}/approve`, { method: 'POST' });
        setRequests(requests.filter(r => r.id !== id));
    };

    const handleReject = async (id: string) => {
        if (!confirm('Reject this payment?')) return;
        await fetch(`/api/admin/payments/${id}/reject`, { method: 'POST' });
        setRequests(requests.filter(r => r.id !== id));
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manual Payment Queue</h1>
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-800 rounded-lg">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-4 py-3 text-left">User</th>
                            <th className="px-4 py-3 text-left">Plan</th>
                            <th className="px-4 py-3 text-left">Amount</th>
                            <th className="px-4 py-3 text-left">Reference</th>
                            <th className="px-4 py-3 text-left">Requested</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((request) => (
                            <tr key={request.id} className="border-t border-gray-800 hover:bg-gray-900/50">
                                <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{request.user.full_name}</span>
                                        <span className="text-xs text-gray-500">{request.user.email}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${request.plan === 'growth' ? 'bg-purple-900/30 text-purple-400' : 'bg-blue-900/30 text-blue-400'}`}>
                                        {request.plan}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm font-medium">{request.currency} {request.amount.toLocaleString()}</td>
                                <td className="px-4 py-3 text-sm text-gray-400">{request.reference || '—'}</td>
                                <td className="px-4 py-3 text-sm text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {new Date(request.created_at).toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleApprove(request.id)} className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">
                                            <Check className="w-4 h-4" />
                                            Approve
                                        </button>
                                        <button onClick={() => handleReject(request.id)} className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">
                                            <X className="w-4 h-4" />
                                            Reject
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {requests.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No pending payment requests</p>
                    </div>
                )}
            </div>
        </div>
    );
}
