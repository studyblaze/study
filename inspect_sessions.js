const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectSessions() {
  console.log('--- Inspecting Sessions Table ---');
  const { data: cols } = await supabase.from('sessions').select('*').limit(1);
  if (cols) {
    console.log('Columns in sessions:', Object.keys(cols[0] || {}));
    console.log('Sample Session:', cols[0]);
  }

  const { count } = await supabase.from('sessions').select('*', { count: 'exact', head: true });
  console.log(`Total Sessions in DB: ${count}`);
}

inspectSessions();
