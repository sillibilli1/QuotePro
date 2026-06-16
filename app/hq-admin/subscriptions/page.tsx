'use client';

import { useState, useEffect } from 'react';

interface Subscription {
    id: string;
    email: string;
    full_name: string;
    plan: string;
    billing_interval: 'monthly' | 'annual' | null;
    currency_code: string;
    created_at: string;
    subscription_ends_at: string | null;
}

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

    useEffect(() => {
        fetch('/api/admin/subscriptions')
            .then(res => res.json())
            .then(data => setSubscriptions(data.subscriptions || []));
    }, []);

    const handleCancel = async (userId: string) => {
        if (!confirm('Cancel this subscription?')) return;
        await fetch(`/api/admin/subscriptions/${userId}/cancel`, { method: 'POST' });
        setSubscriptions(subscriptions.filter(s => s.id !== userId));
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Active Subscriptions</h1>
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-800 rounded-lg">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-4 py-3 text-left">User</th>
                            <th className="px-4 py-3 text-left">Plan</th>
                            <th className="px-4 py-3 text-left">Billing</th>
                            <th className="px-4 py-3 text-left">Currency</th>
                            <th className="px-4 py-3 text-left">Since</th>
                            <th className="px-4 py-3 text-left">Expires On</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscriptions.map((sub) => (
                            <tr key={sub.id} className="border-t border-gray-800 hover:bg-gray-900/50">
                                <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{sub.full_name}</span>
                                        <span className="text-xs text-gray-500">{sub.email}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${sub.plan === 'growth' ? 'bg-purple-900/30 text-purple-400' : 'bg-blue-900/30 text-blue-400'}`}>
                                        {sub.plan}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm capitalize">{sub.billing_interval || '—'}</span>
                                </td>
                                <td className="px-4 py-3 text-sm">{sub.currency_code}</td>
                                <td className="px-4 py-3 text-sm text-gray-400">{new Date(sub.created_at).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-sm text-gray-400">
                                    {sub.subscription_ends_at ? new Date(sub.subscription_ends_at).toLocaleDateString() : '—'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button onClick={() => handleCancel(sub.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">Cancel</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
