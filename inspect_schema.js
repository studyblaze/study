const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectSchema() {
  const { data, error } = await supabase.rpc('inspect_table', { table_name: 'tutors' });
  
  if (error) {
    console.log('Error calling inspect_table RPC, trying direct query...');
    // Fallback to checking columns via a dummy select
    const { data: cols, error: colError } = await supabase.from('tutors').select('*').limit(1);
    if (colError) {
      console.error('Error fetching columns:', colError);
    } else {
      console.log('Available columns in tutors:');
      console.log(Object.keys(cols[0] || {}));
    }
  } else {
    console.log('Table Schema:');
    console.table(data);
  }
}

inspectSchema();
