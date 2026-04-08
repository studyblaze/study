const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectRLS() {
  const { data, error } = await supabase.rpc('get_policies', { table_name: 'tutors' });
  
  if (error) {
    // If RPC doesn't exist, try a direct query (if we have permissions) or just list them via SQL
    console.log('Error calling get_policies RPC, trying direct SQL...');
    const { data: rawData, error: rawError } = await supabase.from('pg_policies').select('*').eq('tablename', 'tutors');
    if (rawError) {
      console.error('Error fetching policies:', rawError);
    } else {
      console.log('Policies on tutors table:');
      console.table(rawData);
    }
  } else {
    console.log('Policies on tutors table:');
    console.table(data);
  }
}

inspectRLS();
