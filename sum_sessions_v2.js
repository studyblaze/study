const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function sumSessions() {
  console.log('--- Summing Sessions Revenue V2 ---');
  const { data, error } = await supabase
    .from('sessions')
    .select('*');
    
  if (error) {
    console.error('Query Error:', error);
    return;
  }

  let totalRev = 0;
  data.forEach((s, i) => {
    const price = Number(s.price_per_student) || 0;
    const students = Number(s.current_students) || 1;
    const amount = price * students;
    
    if (s.status !== 'cancelled') {
        totalRev += amount;
        console.log(`Session ${i}: ${price} * ${students} = ${amount} ${s.currency} (Status: ${s.status})`);
    }
  });

  console.log('---------------------------');
  console.log(`Total Calculated Revenue: ${totalRev}`);
}

sumSessions();
