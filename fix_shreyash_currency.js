require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCurrency() {
    console.log('Resetting currency for users where country is India but currency is DKK...');
    
    // Reset specific user if needed, or broadly reset
    const { data, error } = await supabase
        .from('profiles')
        .update({ currency: 'INR', currency_symbol: '₹' })
        .eq('full_name', 'Shreyash Kale');
        
    if (error) {
        console.error('Error updating profile:', error);
    } else {
        console.log('Reset Shreyash profile to INR.');
    }
}

fixCurrency();
