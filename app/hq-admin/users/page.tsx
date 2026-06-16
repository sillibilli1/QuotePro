'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';

interface User {
    id: string;
    email: string;
    full_name: string;
    company_name: string;
    plan: string;
    billing_interval: 'monthly' | 'annual' | null;
    is_subscribed: boolean;
    quotes_used: number;
    quote_count: number;
    created_at: string;
    country: string;
    currency_code: string;
    subscription_ends_at: string | null;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetch(`/api/admin/users?search=${search}&filter=${filter}`)
            .then(res => res.json())
            .then(data => setUsers(data.users || []));
    }, [search, filter]);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Users</h1>
            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search by email or name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg"
                />
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg">
                    <option value="all">All Users</option>
                    <option value="free">Free Plan</option>
                    <option value="paid">Paid Plans</option>
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-800 rounded-lg">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Company</th>
                            <th className="px-4 py-3 text-left">Plan</th>
                            <th className="px-4 py-3 text-left">Quotes</th>
                            <th className="px-4 py-3 text-left">Country</th>
                            <th className="px-4 py-3 text-left">Joined</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-t border-gray-800 hover:bg-gray-900/50">
                                <td className="px-4 py-3 text-sm">{user.email}</td>
                                <td className="px-4 py-3 text-sm">{user.full_name || '—'}</td>
                                <td className="px-4 py-3 text-sm">{user.company_name || '—'}</td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col gap-1">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${user.is_subscribed && user.plan === 'growth'
                                            ? 'bg-purple-900/30 text-purple-400'
                                            : user.is_subscribed && user.plan === 'starter'
                                                ? 'bg-blue-900/30 text-blue-400'
                                                : 'bg-gray-800 text-gray-400'
                                            }`}>
                                            {user.is_subscribed ? `${user.plan}${user.billing_interval ? ` (${user.billing_interval})` : ''}` : 'free'}
                                            {user.is_subscribed && ' ✓'}
                                        </span>
                                        {user.subscription_ends_at && (
                                            <span className="text-[10px] text-gray-500">
                                                Expires {new Date(user.subscription_ends_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm">{user.quote_count} / {user.quotes_used}</td>
                                <td className="px-4 py-3 text-sm">{user.country} ({user.currency_code})</td>
                                <td className="px-4 py-3 text-sm text-gray-400">{new Date(user.created_at).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={`/hq-admin/users/${user.id}`}>
                                        <button className="p-1 hover:bg-gray-800 rounded" title="View Details">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
