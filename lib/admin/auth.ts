import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const ADMIN_EMAIL = 'salarakhoon12431243@gmail.com';

export async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== ADMIN_EMAIL) {
        redirect('/app/dashboard');
    }

    return user;
}

export async function isAdmin(): Promise<boolean> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email === ADMIN_EMAIL;
}
