async function testEmail() {
    try {
        const response = await fetch('http://localhost:3000/api/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: 'contact@grouptutors.com',
                subject: 'Test Email',
                body: 'This is a test',
                type: 'test'
            })
        });
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Data:', data);
    } catch (e) {
        console.log('Fetch Error:', e.message);
    }
}
testEmail();
