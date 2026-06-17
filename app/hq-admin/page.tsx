import { requireAdmin } from '@/lib/admin/auth';
import StatCard from '@/components/admin/StatCard';
import { Users, CreditCard, FileText, TrendingUp } from 'lucide-react';
import { cookies } from 'next/headers';

async function getStats() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/stats`, {
        cache: 'no-store',
        headers: { Cookie: cookies().toString() },
    });
    return res.json();
}

export default async function AdminDashboard() {
    await requireAdmin();
    const stats = await getStats();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
            <div className="grid grid-cols-4 gap-4">
                <StatCard title="Total Users" value={stats.totalUsers} icon={<Users />} />
                <StatCard title="Active Subscriptions" value={stats.activeSubscriptions} icon={<CreditCard />} />
                <StatCard title="MRR (AED)" value={`AED ${stats.mrrAED}`} icon={<TrendingUp />} />
                <StatCard title="Quotes This Month" value={stats.quotesThisMonth} icon={<FileText />} />
            </div>
        </div>
    );
}
