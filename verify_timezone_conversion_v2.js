const { fromZonedTime, toZonedTime, format } = require('date-fns-tz');

function simulateBookingSlots(hour, minute, tutorTimezone, userTimezone, rawDate) {
    // 1. Construct a date string or object that represents the 'clock time'
    // We use a date string to avoid local timezone interference in the constructor
    const year = rawDate.getFullYear();
    const month = String(rawDate.getMonth() + 1).padStart(2, '0');
    const day = String(rawDate.getDate()).padStart(2, '0');
    const timeStr = `${year}-${month}-${day} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
    
    // 2. Convert that clock time in X zone to UTC
    const utcDate = fromZonedTime(timeStr, tutorTimezone);
    
    // 3. Convert that UTC to the student's local zone
    const localDate = toZonedTime(utcDate, userTimezone);

    return {
        utc: utcDate.toISOString(),
        userLocal: format(localDate, 'h:mm a', { timeZone: userTimezone }),
        raw: localDate
    };
}

const testDate = new Date('2026-03-20T00:00:00Z'); // Friday, before DST changes

console.log('--- NYC Student (America/New_York) booking London Tutor (Europe/London) @ 10:00 AM ---');
const nycResult = simulateBookingSlots(10, 0, 'Europe/London', 'America/New_York', testDate);
console.log('UTC Timestamp:', nycResult.utc);
console.log('Student Local Time:', nycResult.userLocal);
console.log('Expected: 6:00 AM (London is UTC+0, NYC is UTC-4)');

console.log('\n--- London Student booking Tokyo Tutor (Asia/Tokyo) @ 9:00 AM ---');
const londonResult = simulateBookingSlots(9, 0, 'Asia/Tokyo', 'Europe/London', testDate);
console.log('UTC Timestamp:', londonResult.utc);
console.log('Student Local Time:', londonResult.userLocal);
console.log('Expected: 12:00 AM (Tokyo is UTC+9, London is UTC+0)');

if (nycResult.userLocal === '6:00 AM' && londonResult.userLocal === '12:00 AM') {
    console.log('\n✅ REFINED LOGIC VERIFIED');
} else {
    console.log('\n❌ VERIFICATION FAILED');
}
