const { fromZonedTime, toZonedTime, format } = require('date-fns-tz');

function simulateBookingSlots(tutorAvailability, tutorTimezone, userTimezone, rawDate) {
    const now = new Date();
    
    return tutorAvailability.map(s => {
        const hour = Math.floor(s.hour);
        const minute = (s.hour % 1) * 60;
        
        // 1. Create date object in tutor's "nominal" local time for that day
        const tutorDate = new Date(rawDate);
        tutorDate.setHours(hour, minute, 0, 0);
        
        // 2. Convert to UTC (considering the tutor's actual timezone)
        const utcDate = fromZonedTime(tutorDate, tutorTimezone);
        
        // 3. Convert to student's local timezone
        const localDate = toZonedTime(utcDate, userTimezone);

        return {
            tutorLocal: format(tutorDate, 'yyyy-MM-dd HH:mm'),
            userLocal: format(localDate, 'h:mm a', { timeZone: userTimezone }),
            raw: localDate
        };
    }).filter(slot => slot.raw > now);
}

// Test Case: Tutor in London (UTC+0), Student in New York (UTC-4)
// Tutor available at 10:00 AM London time
const tutorSlots = [{ dayIndex: 1, hour: 10 }];
const testDate = new Date();
testDate.setDate(testDate.getDate() + 1); // Tomorrow

console.log('--- NYC Student (UTC-4) booking London Tutor (UTC+0) @ 10 AM ---');
const nycSlots = simulateBookingSlots(tutorSlots, 'Europe/London', 'America/New_York', testDate);
console.log('Expected: 6:00 AM');
console.log('Result:', nycSlots[0].userLocal);

// Test Case: Tutor in Tokyo (UTC+9), Student in London (UTC+0)
// Tutor available at 9:00 AM Tokyo time
console.log('\n--- London Student (UTC+0) booking Tokyo Tutor (UTC+9) @ 9 AM ---');
const londonSlots = simulateBookingSlots(tutorSlots, 'Asia/Tokyo', 'Europe/London', testDate);
console.log('Expected: 12:00 AM (Midnight)');
console.log('Result:', londonSlots[0].userLocal);

if (nycSlots[0].userLocal === '6:00 AM' && londonSlots[0].userLocal === '12:00 AM') {
    console.log('\n✅ TIMEZONE CONVERSION VERIFIED');
} else {
    console.log('\n❌ VERIFICATION FAILED');
    process.exit(1);
}
