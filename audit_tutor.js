
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    "https://exkgplqcdtoxfmxqkdpl.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2dwbHFjZHRveGZteHFrZHBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxMDQ3NSwiZXhwIjoyMDg3Nzg2NDc1fQ.t7Knpc2zi0qDrjQS09AJHWRDrDrpgzFRd5rmP_KvTzE"
);

async function audit() {
    const profileId = '54fb63ef-cc85-4c65-8d02-0787497a381d';
    
    console.log('--- WALLET DATA ---');
    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', profileId).single();
    console.log(JSON.stringify(wallet, null, 2));

    console.log('\n--- LEDGER DATA (Available) ---');
    const { data: ledger } = await supabase
        .from('financial_ledger')
        .select('*')
        .eq('user_id', profileId)
        .eq('status', 'available')
        .lte('available_at', new Date().toISOString());
    console.log(JSON.stringify(ledger, null, 2));

    console.log('\n--- TOTAL LEDGER (All Types) ---');
    const { data: allLedger } = await supabase
        .from('financial_ledger')
        .select('*')
        .eq('user_id', profileId);
    console.log(JSON.stringify(allLedger, null, 2));
}

audit();
