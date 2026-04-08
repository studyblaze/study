
const url = "https://exkgplqcdtoxfmxqkdpl.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2dwbHFjZHRveGZteHFrZHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTA0NzUsImV4cCI6MjA4Nzc4NjQ3NX0.KH1ZiIifSTntBq7tCQc5dLAE05YWxlgGXyI2chEZD0A";

async function diagnose() {
    const tutorId = 3;
    console.log(`--- Investigating Tutor ID: ${tutorId} ---`);

    try {
        // Get tutor profile
        const tResp = await fetch(`${url}/rest/v1/tutors?id=eq.${tutorId}`, {
            headers: { "apikey": key, "Authorization": `Bearer ${key}` }
        });
        const tutors = await tResp.json();
        console.log("Tutor Profile:", JSON.stringify(tutors[0], null, 2));

        // Get subscriptions
        const subResp = await fetch(`${url}/rest/v1/subscriptions?tutor_id=eq.${tutorId}`, {
            headers: { "apikey": key, "Authorization": `Bearer ${key}` }
        });
        const subs = await subResp.json();
        console.log(`Found ${subs.length} subscriptions.`);
        subs.forEach(s => {
            console.log(`Sub ID: ${s.id}, Monthly Price: ${s.monthly_price}, Status: ${s.status}, Student ID: ${s.student_id}`);
        });

    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

diagnose();
