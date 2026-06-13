'use client';

import { useState, useEffect } from 'react';

interface Referral {
    email: string;
    full_name: string;
    total_referrals: number;
    paid_referrals: number;
    conversion_rate: string;
}

export default function ReferralsPage() {
    const [referrals, setReferrals] = useState<Referral[]>([]);

    useEffect(() => {
        fetch('/api/admin/referrals')
            .then(res => res.json())
            .then(data => setReferrals(data.referrals || []));
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Referral Tracking</h1>
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-800 rounded-lg">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-4 py-3 text-left">User</th>
                            <th className="px-4 py-3 text-left">Total Referrals</th>
                            <th className="px-4 py-3 text-left">Paid Referrals</th>
                            <th className="px-4 py-3 text-left">Conversion Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {referrals.map((ref, idx) => (
                            <tr key={idx} className="border-t border-gray-800 hover:bg-gray-900/50">
                                <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{ref.full_name}</span>
                                        <span className="text-xs text-gray-500">{ref.email}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm">{ref.total_referrals}</td>
                                <td className="px-4 py-3 text-sm">{ref.paid_referrals}</td>
                                <td className="px-4 py-3 text-sm">{ref.conversion_rate}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
