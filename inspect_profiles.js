const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectProfiles() {
  const { data: cols, error: colError } = await supabase.from('profiles').select('*').limit(1);
  if (colError) {
    console.error('Error fetching profiles columns:', colError);
  } else {
    console.log('Available columns in profiles:');
    console.log(Object.keys(cols[0] || {}));
  }
}

inspectProfiles();
