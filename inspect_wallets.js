const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectProfiles() {
  console.log('--- Inspecting Profiles for Wallet ---');
  const { data: cols } = await supabase.from('profiles').select('*').limit(1);
  if (cols) {
    console.log('Columns in profiles:', Object.keys(cols[0] || {}));
  }

  const { data, error } = await supabase.from('profiles').select('full_name, wallet_balance, currency');
  if (error) {
    console.error(error);
  } else {
    let totalBalance = 0;
    data.forEach(p => {
       if (p.wallet_balance > 0) {
           console.log(`${p.full_name}: ${p.wallet_balance} ${p.currency || 'INR'}`);
           totalBalance += Number(p.wallet_balance);
       }
    });
    console.log(`Total Wallet Liquidity: ${totalBalance}`);
  }
}

inspectProfiles();
