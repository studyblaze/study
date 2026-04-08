const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function sumSessions() {
  console.log('--- Summing Sessions Revenue ---');
  const { data, error } = await supabase
    .from('sessions')
    .select('price_per_student, currency, status, current_students');
    
  if (error) {
    console.error('Error:', error);
    return;
  }

  let totalRev = 0;
  data.forEach((s, i) => {
    const amount = Number(s.price_per_student) * (Number(s.current_students) || 1);
    if (s.status !== 'cancelled') {
        totalRev += amount;
        console.log(`Session ${i}: ${amount} ${s.currency} (${s.status})`);
    }
  });

  console.log(`Total Session Revenue: ${totalRev}`);
}

sumSessions();
