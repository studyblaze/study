const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const sql = `
        DROP POLICY IF EXISTS "Users can spend from their own wallet" ON public.transactions;
        CREATE POLICY "Users can spend from their own wallet" 
        ON public.transactions FOR INSERT 
        WITH CHECK (
            auth.uid() = user_id AND 
            type = 'payment' AND 
            amount <= 0
        );
    `;
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
        console.error('Error applying RLS fix:', error);
        process.exit(1);
    }
    console.log('RLS fix applied successfully');
    process.exit(0);
}

run();
