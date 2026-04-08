const { EgressClient } = require('livekit-server-sdk');
require('dotenv').config({path: '.env.local'});
const apiKey = process.env.LIVEKIT_API_KEY.replace(/[\r\n\"]/g, '');
const apiSecret = process.env.LIVEKIT_API_SECRET.replace(/[\r\n\"]/g, '');
const wsUrl = 'https://' + process.env.LIVEKIT_URL.replace('wss://', '').replace(/[\r\n\"]/g, '');
const client = new EgressClient(wsUrl, apiKey, apiSecret);
async function getStatus() {
  const egresses = await client.listEgress({ egressId: 'EG_jQfkkWwMC8q3' });
  console.log('User 6s Recording:', JSON.stringify(egresses[0], null, 2));

  const egresses2 = await client.listEgress({ egressId: 'EG_jpVLFCxLFEDg' });
  console.log('My test recording:', JSON.stringify(egresses2[0], null, 2));
}
getStatus().catch(console.error);
