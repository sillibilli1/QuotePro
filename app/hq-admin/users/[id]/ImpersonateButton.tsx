'use client';

import { UserCircle } from 'lucide-react';
import { useState } from 'react';

export default function ImpersonateButton({ userId }: { userId: string }) {
    const [loading, setLoading] = useState(false);

    const handleImpersonate = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${userId}/impersonate`, {
                method: 'POST',
            });
            const data = await res.json();

            if (res.ok && data.url) {
                window.prompt('Copy this Magic Link and paste it in an Incognito Window to login as this user:', data.url);
            } else {
                alert(data.error || 'Failed to impersonate user');
            }
        } catch (error) {
            alert('Failed to impersonate user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleImpersonate}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
            <UserCircle className="w-4 h-4" />
            {loading ? 'Loading...' : 'Impersonate User'}
        </button>
    );
}
