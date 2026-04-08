const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixAdmins() {
  console.log('Fetching profiles matching founder emails...');
  
  const emails = ['tadabragroup026@gmail.com', 'rajendra34rathore@gmail.com'];
  
  for (const email of emails) {
    console.log(`Updating ${email} to admin (case-insensitive)...`);
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'admin' })
      .ilike('email', email)
      .select();
      
    if (error) {
      console.error(`Error updating ${email}:`, error);
    } else {
      console.log(`Success! Updated rows for ${email}:`, data);
    }
  }
}

fixAdmins().catch(console.error);
