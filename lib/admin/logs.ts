import { createClient } from '@/lib/supabase/server';

export async function logAdminAction(
    action: string,
    details: Record<string, any>,
    userId?: string
) {
    const supabase = await createClient();
    await (supabase as any).from('admin_logs').insert({
        event_type: 'admin_action',
        details: { action, ...details, timestamp: new Date().toISOString() },
        user_id: userId,
    });
}
