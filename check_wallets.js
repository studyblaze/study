const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkWallets() {
  const { data, error } = await supabase.from('wallets').select('balance, currency');
  if (error) {
    console.error(error);
  } else {
    console.table(data);
  }
}

checkWallets();
