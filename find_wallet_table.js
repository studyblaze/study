const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findWalletTable() {
  console.log('--- Searching for Wallet/Balance tables ---');
  
  const tables = ['wallets', 'user_wallets', 'balances', 'user_balances'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (!error) {
      console.log(`Found table: ${table}`);
      console.log('Columns:', Object.keys(data[0] || {}));
      
      const { data: allData } = await supabase.from(table).select('balance, currency');
      let total = 0;
      allData?.forEach(w => total += Number(w.balance || 0));
      console.log(`Total Liquidity in ${table}: ${total}`);
      return;
    }
  }
  console.log('No wallet tables found.');
}

findWalletTable();
