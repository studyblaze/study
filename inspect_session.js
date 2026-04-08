const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectSession() {
    const { data: session } = await supabase
        .from('sessions')
        .select('*')
        .eq('tutor_id', 3)
        .single();

    console.log("SESSION 1 DETAILS:");
    console.log(JSON.stringify(session, null, 2));

    const now = new Date();
    console.log("\nCurrent Time (JS):", now.toISOString());
    console.log("Current Time (Local):", now.toString());
}

inspectSession();
