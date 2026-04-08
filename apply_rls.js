const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyRLS() {
  const sql = fs.readFileSync('rls_remediation.sql', 'utf8');
  
  // Note: Supabase doesn't have a direct 'sql' RPC by default unless we created one.
  // We'll try to use a common one or just explain to the user.
  // However, I can try to run specific parts via existing RPCs if they exist.
  
  console.log('Attempting to apply RLS remediation...');
  console.log('NOTE: If this fails, the user must run rls_remediation.sql in the Supabase SQL Editor.');

  try {
    // Try to run SQL via an RPC if it exists (some projects have 'exec_sql')
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
       console.log('RPC exec_sql not found (common). Please run the SQL manually in Supabase Dashboard.');
       console.log('File to run: f:/GroupLearn/rls_remediation.sql');
    } else {
       console.log('RLS remediation applied successfully!');
    }
  } catch (e) {
    console.log('Error attempting RPC. Please run the SQL manually.');
  }
}

applyRLS();
