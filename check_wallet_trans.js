const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findWalletTrans() {
  const { data, error } = await supabase.from('wallet_transactions').select('*').limit(5);
  if (error) {
    console.log('No wallet_transactions table.');
  } else {
    console.log('Found wallet_transactions:');
    console.table(data);
  }
}

findWalletTrans();
