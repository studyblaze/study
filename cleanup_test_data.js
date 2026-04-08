const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function forceCleanup() {
    console.log('Starting Force Cleanup...');

    // 1. Delete by ID using direct string match (UUID)
    const { error: err1 } = await supabase
        .from('sessions')
        .delete()
        .eq('id', '08d71234-5678-90ab-cdef-9c7b8b7e7a7c');

    if (err1) console.error('Error err1:', err1);
    else console.log('Attempted delete of Advanced Algebra ID');

    // 2. Delete by Topic Name (more reliable for test data)
    const { error: err2 } = await supabase
        .from('sessions')
        .delete()
        .eq('topic', 'Mathematics - Advanced Algebra');

    if (err2) console.error('Error err2:', err2);
    else console.log('Attempted delete of topic: Mathematics - Advanced Algebra');

    // 3. Delete topic "1"
    const { error: err3 } = await supabase
        .from('sessions')
        .delete()
        .eq('topic', '1');

    if (err3) console.error('Error err3:', err3);
    else console.log('Attempted delete of topic: 1');

    // 4. Delete past dates
    const { error: err4 } = await supabase
        .from('sessions')
        .delete()
        .lt('date', '2025-03-01');

    if (err4) console.error('Error err4:', err4);
    else console.log('Attempted delete of past dates');

    console.log('Force Cleanup complete.');
}

forceCleanup();
