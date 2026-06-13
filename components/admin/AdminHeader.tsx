'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Shield } from 'lucide-react';

export default function AdminHeader() {
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const getUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserEmail(user.email || '');
        };
        getUser();
    }, []);

    return (
        <header className="bg-red-950/20 border-b border-red-900/30 px-8 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-red-400 font-medium">Admin Mode — {userEmail}</span>
                </div>
                <div className="text-sm text-gray-500">QuotePro Admin Panel v1.0</div>
            </div>
        </header>
    );
}
