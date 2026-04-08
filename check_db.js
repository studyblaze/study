require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkDB() {
    const userId = '54fb63ef-cc85-4c65-8d02-0787497a381d'; // Shreyash ID
    
    const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId);
        
    const { data: ledgerData } = await supabase
        .from('financial_ledger')
        .select('*')
        .eq('user_id', userId);
        
    const { data: subsData } = await supabase
        .from('subscriptions')
        .select('*, tutor_id, plan_hours, razorpay_subscription_id')
        .eq('status', 'active');
        
    const { data: tutorData } = await supabase
        .from('tutors')
        .select('id, name, profile_id, is_owner, hourly_rate')
        .eq('profile_id', userId);

    console.log("Wallet:", walletData, walletError);
    console.log("Ledger Count:", ledgerData?.length);
    console.log("Tutor Data:", tutorData);
    console.log("Active Subs:", subsData?.length);
    
    // Write out the subscriptions to understand why it's 2 but 0 revenue
    fs.writeFileSync('f:/GroupLearn/debug_subs.json', JSON.stringify(subsData, null, 2));
}

checkDB();
