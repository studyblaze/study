const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function clean() {
    const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .ilike('topic', '%CombinedFix%');
        
    const { data: b2 } = await supabase
        .from('bookings')
        .select('*')
        .ilike('student_name', '%CombinedFix%');
        
    const { data: b3 } = await supabase
        .from('bookings')
        .select('*')
        .ilike('tutor_name', '%CombinedFix%');

    let allToDelete = [...(bookings||[]), ...(b2||[]), ...(b3||[])];
    
    for (let b of allToDelete) {
        await supabase.from('bookings').delete().eq('id', b.id);
    }
    
    // Also clean up profiles if any
    const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .ilike('full_name', '%CombinedFix%');
        
    for (let p of profiles || []) {
        await supabase.from('profiles').update({ full_name: 'Test Student' }).eq('id', p.id);
    }
        
    require('fs').writeFileSync('deleted.json', JSON.stringify({ deletedBookings: allToDelete.length, fixedProfiles: profiles?.length || 0 }, null, 2));
}

clean();
