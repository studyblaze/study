
const { AccessToken } = require('livekit-server-sdk');
require('dotenv').config({ path: '.env.local' });

async function testToken() {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.LIVEKIT_URL;

    console.log("Testing with:");
    console.log("URL:", wsUrl);
    console.log("Key:", apiKey);
    console.log("Secret length:", apiSecret ? apiSecret.length : 0);

    if (!apiKey || !apiSecret || !wsUrl) {
        console.error("Missing env vars!");
        process.exit(1);
    }

    try {
        const at = new AccessToken(apiKey, apiSecret, {
            identity: "test-user",
        });
        at.addGrant({
            roomJoin: true,
            room: "test-room",
        });
        const token = await at.toJwt();
        console.log("Token generated successfully!");
        console.log("First 20 chars:", token.substring(0, 20));
    } catch (e) {
        console.error("Token generation failed:", e);
    }
}

testToken();
