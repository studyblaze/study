
const { createClient } = require('@supabase/supabase-client');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGracyCurrency() {
  const { data, error } = await supabase
    .from('tutors')
    .select('name, currency, hourly_rate, price')
    .ilike('name', '%Gracy%')
    .single();

  if (error) {
    console.error('Error fetching tutor:', error);
    return;
  }

  console.log('Tutor Data:', JSON.stringify(data, null, 2));
}

checkGracyCurrency();
