
const url = "https://exkgplqcdtoxfmxqkdpl.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2dwbHFjZHRveGZteHFrZHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTA0NzUsImV4cCI6MjA4Nzc4NjQ3NX0.KH1ZiIifSTntBq7tCQc5dLAE05YWxlgGXyI2chEZD0A";

async function diagnose() {
    const tutorId = 3;
    console.log(`--- Diagnosing Bookings for Tutor ID: ${tutorId} ---`);

    try {
        // Get sessions
        const sResp = await fetch(`${url}/rest/v1/sessions?tutor_id=eq.${tutorId}`, {
            headers: { "apikey": key, "Authorization": `Bearer ${key}` }
        });
        const sessions = await sResp.json();
        
        if (sessions.error) {
            console.error("Sessions Error:", sessions.error);
            return;
        }
        
        const sessionIds = sessions.map(s => s.id);
        console.log(`Found ${sessionIds.length} sessions.`);

        if (sessionIds.length === 0) return;

        // Get bookings
        const bResp = await fetch(`${url}/rest/v1/bookings?session_id=in.(${sessionIds.join(',')})`, {
            headers: { "apikey": key, "Authorization": `Bearer ${key}` }
        });
        const bookings = await bResp.json();
        
        if (bookings.error) {
            console.error("Bookings Error:", bookings.error);
            return;
        }
        
        console.log(`Found ${bookings.length} bookings.`);

        let sumConfirmed = 0;
        bookings.forEach(b => {
            console.log(`ID: ${b.id}, Amt: ${b.amount}, Status: ${b.status}, Demo: ${b.is_demo}, Promo: ${b.promo_code}`);
            if (b.status === 'confirmed') {
                sumConfirmed += b.amount;
            }
        });
        console.log(`--- Raw Total Confirmed: ${sumConfirmed} ---`);
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

diagnose();
