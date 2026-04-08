
async function checkTutor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Get tutor info
    const response = await fetch(`${url}/rest/v1/tutors?name=ilike.*shreyash*&select=*`, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    });
    const tutors = await response.json();
    console.log('Tutor Details:', JSON.stringify(tutors, null, 2));

    if (tutors.length > 0) {
        const tid = tutors[0].id;
        
        // Get all bookings for his sessions
        const bResp = await fetch(`${url}/rest/v1/bookings?select=amount,status,is_demo,promo_code,sessions!inner(tutor_id)&sessions.tutor_id=eq.${tid}`, {
             headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });
        const bookings = await bResp.json();
        console.log('Bookings Count:', bookings.length);
        console.log('Sample Bookings (first 10):', JSON.stringify(bookings.slice(0, 10), null, 2));
    }
}
checkTutor();
