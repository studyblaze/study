import { createClient } from '@supabase/supabase-js';

export function getServiceSupabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Supabase server environment variables are missing.');
    }

    return createClient(supabaseUrl, serviceRoleKey);
}
