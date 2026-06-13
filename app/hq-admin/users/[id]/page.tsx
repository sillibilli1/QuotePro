import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getPricing } from '@/lib/pricing';
import ImpersonateButton from './ImpersonateButton';

interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    company_name: string;
    plan: string;
    is_subscribed: boolean;
    created_at: string;
    country: string;
    currency_code: string;
}

export default async function UserDetailPage({ params }: { params: { id: string } }) {
    await requireAdmin();

    const supabase = createAdminClient();
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error || !profile) {
        notFound();
    }

    const { count: quoteCount } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', params.id);

    const user = profile as UserProfile;
    const pricing = getPricing(user.country || 'US');

    let quoteLimit: number | string;
    if (user.plan === 'growth' && user.is_subscribed) {
        quoteLimit = 'Unlimited';
    } else if (user.plan === 'starter' && user.is_subscribed) {
        quoteLimit = pricing.starter.quotes;
    } else {
        quoteLimit = pricing.free.quotes;
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <Link href="/hq-admin/users" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Users
                </Link>
                <ImpersonateButton userId={params.id} />
            </div>

            <h1 className="text-3xl font-bold mb-6">User Details</h1>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Email</label>
                        <p className="text-white">{user.email}</p>
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Full Name</label>
                        <p className="text-white">{user.full_name || '—'}</p>
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Company</label>
                        <p className="text-white">{user.company_name || '—'}</p>
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Plan</label>
                        <div>
                            <span className={`px-3 py-1 rounded text-sm font-medium ${user.plan === 'growth' ? 'bg-purple-900/30 text-purple-400' : user.plan === 'starter' ? 'bg-blue-900/30 text-blue-400' : 'bg-gray-800 text-gray-400'}`}>
                                {user.plan}
                                {user.is_subscribed && ' ✓'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Status</label>
                        <span className={`px-3 py-1 rounded text-sm font-medium ${user.is_subscribed ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                            {user.is_subscribed ? 'Active Subscription' : 'Free Plan'}
                        </span>
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Quotes Usage</label>
                        <p className="text-white">{quoteCount ?? 0} / {quoteLimit}</p>
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Country</label>
                        <p className="text-white">{user.country} ({user.currency_code})</p>
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Joined Date</label>
                        <p className="text-white">{new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
