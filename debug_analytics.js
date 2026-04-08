const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testCloudflare() {
    console.log('\n--- Testing Cloudflare ---');
    const token = process.env.CLOUDFLARE_API_TOKEN;
    const zoneId = process.env.CLOUDFLARE_ZONE_ID;

    if (!token || !zoneId) {
        console.error('Cloudflare credentials missing');
        return;
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const query = `
    query {
      viewer {
        zones(filter: { zoneTag: "${zoneId}" }) {
          httpRequests1hGroups(limit: 24, filter: { datetime_geq: "${yesterday}" }) {
            sum {
              requests
              pageViews
            }
          }
        }
      }
    }`;

    try {
        const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });
        const data = await res.json();
        console.log('Result:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

async function testGA4() {
    console.log('\n--- Testing GA4 ---');
    const propertyId = process.env.GA_PROPERTY_ID;
    const clientEmail = process.env.GA_CLIENT_EMAIL;
    const privateKey = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!propertyId || propertyId.includes('PASTE_YOUR_PROPERTY_ID') || !clientEmail || !privateKey) {
        console.error('GA4 credentials missing or invalid');
        return;
    }

    try {
        const now = Math.floor(Date.now() / 1000);
        const payload = {
            iss: clientEmail,
            sub: clientEmail,
            aud: 'https://oauth2.googleapis.com/token',
            iat: now,
            exp: now + 3600,
            scope: 'https://www.googleapis.com/auth/analytics.readonly',
        };

        const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
        const authRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: token,
            }),
        });

        const authData = await authRes.json();
        if (!authData.access_token) {
            console.error('Auth failed:', authData);
            return;
        }

        const reportRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authData.access_token}`,
            },
            body: JSON.stringify({
                dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
                metrics: [{ name: 'activeUsers' }],
            }),
        });

        const reportData = await reportRes.json();
        console.log('Result:', JSON.stringify(reportData, null, 2));
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

(async () => {
    await testCloudflare();
    await testGA4();
})();
