
const url = "https://exkgplqcdtoxfmxqkdpl.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2dwbHFjZHRveGZteHFrZHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTA0NzUsImV4cCI6MjA4Nzc4NjQ3NX0.KH1ZiIifSTntBq7tCQc5dLAE05YWxlgGXyI2chEZD0A";

async function diagnose() {
    const tutorId = 3;
    console.log(`--- Checking Shares for Tutor ID: ${tutorId} ---`);

    try {
        const sResp = await fetch(`${url}/rest/v1/sessions?tutor_id=eq.${tutorId}`, {
            headers: { "apikey": key, "Authorization": `Bearer ${key}` }
        });
        const sessions = await sResp.json();
        const sessionIds = sessions.map(s => s.id);

        if (sessionIds.length === 0) return;

        const bResp = await fetch(`${url}/rest/v1/bookings?session_id=in.(${sessionIds.join(',')})`, {
            headers: { "apikey": key, "Authorization": `Bearer ${key}` }
        });
        const bookings = await bResp.json();
        
        console.log(`Found ${bookings.length} bookings.`);

        bookings.forEach(b => {
            console.log(`ID: ${b.id}, Amt: ${b.amount}, Tutor Share: ${b.tutor_share}, Co Share: ${b.company_share}, Status: ${b.status}, Demo: ${b.is_demo}`);
        });

    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

diagnose();
