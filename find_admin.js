const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findAdmin() {
    const { data: admins, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin');
    
    if (error) {
        console.error('Error fetching admins:', error);
        return;
    }

    console.log('Admins found:', admins.map(a => ({ id: a.id, email: a.email, name: a.full_name, role: a.role })));
}

findAdmin();
