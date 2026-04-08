const dotenv = require('dotenv');
const path = require('path');

// Load .env.local explicitly
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('--- ENV TEST ---');
console.log('DAILY_API_KEY length:', process.env.DAILY_API_KEY ? process.env.DAILY_API_KEY.length : 'MISSING');
console.log('DAILY_API_KEY starts with:', process.env.DAILY_API_KEY ? process.env.DAILY_API_KEY.substring(0, 5) : 'N/A');
console.log('--- END TEST ---');
