import { cookies } from 'next/headers';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from '@/types';

export function createClient() {
    const cookieStore = cookies();

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
                    try {
                        cookiesToSet.forEach(
                            ({ name, value, options }: { name: string; value: string; options: CookieOptions }) => {
                                cookieStore.set(name, value, options);
                            },
                        );
                    } catch {
                        // Server Components cannot always mutate cookies directly.
                    }
                },
            },
        },
    );
}

export function createServiceRoleClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.');
    }

    return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}

/**
 * Returns an untyped service-role client for write operations where TypeScript's
 * generic inference over the Database type produces `never` (e.g. partial updates
 * that don't satisfy every constraint of the Row shape).
 * Use only in server-side API routes — never expose the service-role key to clients.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createAdminClient(): ReturnType<typeof createSupabaseClient<any>> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createSupabaseClient<any>(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}
