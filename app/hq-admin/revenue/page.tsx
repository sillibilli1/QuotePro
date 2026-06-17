'use client';

import { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';

interface Payment {
    id: string;
    date: string;
    user_name: string;
    user_email: string;
    payment_method: 'Stripe' | 'Manual';
    plan: string;
    amount: number;
    currency: string;
}

export default function RevenuePage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [monthlyTotal, setMonthlyTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/revenue')
            .then(res => res.json())
            .then(data => {
                setPayments(data.payments || []);
                setMonthlyTotal(data.monthlyTotal || 0);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading revenue data...</div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Revenue Ledger</h1>

            <div className="mb-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-800 rounded-lg p-6">
                <div className="flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-green-400" />
                    <div>
                        <p className="text-sm text-gray-400">Total Revenue This Month</p>
                        <p className="text-3xl font-bold text-green-400">${monthlyTotal.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border border-gray-800 rounded-lg">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-left">User</th>
                            <th className="px-4 py-3 text-left">Method</th>
                            <th className="px-4 py-3 text-left">Plan</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((payment) => (
                            <tr key={payment.id} className="border-t border-gray-800 hover:bg-gray-900/50">
                                <td className="px-4 py-3 text-sm text-gray-400">
                                    {new Date(payment.date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{payment.user_name}</span>
                                        <span className="text-xs text-gray-500">{payment.user_email}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${payment.payment_method === 'Stripe'
                                            ? 'bg-indigo-900/30 text-indigo-400'
                                            : 'bg-amber-900/30 text-amber-400'
                                        }`}>
                                        {payment.payment_method}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm capitalize">{payment.plan}</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className="text-sm font-medium text-green-400">
                                        {payment.currency} {payment.amount.toLocaleString()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {payments.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No revenue data available</p>
                    </div>
                )}
            </div>
        </div>
    );
}
