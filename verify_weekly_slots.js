const { fromZonedTime, toZonedTime, format } = require('date-fns-tz');

function simulateWeeklySlots(tutorAvailability, tutorTimezone, userTimezone, mondayOfViewWeek) {
    const now = new Date();
    const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(mondayOfViewWeek);
        d.setDate(mondayOfViewWeek.getDate() + i);
        return { rawDate: d, dayIndex: (d.getDay() + 6) % 7 };
    });

    const slots = {};
    days.forEach((_, i) => slots[i] = []);

    days.forEach((currentDay, dayIdx) => {
        const tutorSlotsForDay = tutorAvailability.filter(s => s.dayIndex === currentDay.dayIndex);

        tutorSlotsForDay.forEach(s => {
            [0, 0.5].forEach(offset => {
                const hourVal = s.hour + offset;
                const hour = Math.floor(hourVal);
                const minute = (hourVal % 1) * 60;

                const year = currentDay.rawDate.getFullYear();
                const month = String(currentDay.rawDate.getMonth() + 1).padStart(2, '0');
                const dateNum = String(currentDay.rawDate.getDate()).padStart(2, '0');
                const timeStr = `${year}-${month}-${dateNum} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

                const utcDate = fromZonedTime(timeStr, tutorTimezone);
                const localDate = toZonedTime(utcDate, userTimezone);
                
                const slotDayStart = new Date(localDate);
                slotDayStart.setHours(0, 0, 0, 0);

                const targetDayIdx = days.findIndex(d => {
                    const dStart = new Date(d.rawDate);
                    dStart.setHours(0, 0, 0, 0);
                    return dStart.getTime() === slotDayStart.getTime();
                });

                if (targetDayIdx !== -1) {
                    slots[targetDayIdx].push(format(localDate, 'HH:mm', { timeZone: userTimezone }));
                }
            });
        });
    });

    return slots;
}

// Test Case: Tutor available Monday at 10:00 (London)
// Student in India (GMT +5:30)
const tutorSlots = [{ dayIndex: 0, hour: 10 }]; // Monday 10 AM
const mon = new Date('2026-03-23T00:00:00Z'); // A Monday

console.log('--- London Tutor (10 AM Mon) -> India Student ---');
const indiaResults = simulateWeeklySlots(tutorSlots, 'Europe/London', 'Asia/Kolkata', mon);

console.log('Monday Slots (Expect 15:30, 16:00):', indiaResults[0]);

if (indiaResults[0].includes('15:30') && indiaResults[0].includes('16:00')) {
    console.log('✅ 30-MINUTE SLOT GENERATION VERIFIED');
} else {
    console.log('❌ VERIFICATION FAILED');
    process.exit(1);
}

// Test Day Shift: Tutor available Monday 22:00 (London)
// Student in Tokyo (GMT +9)
console.log('\n--- London Tutor (10 PM Mon) -> Tokyo Student ---');
const tokyoResults = simulateWeeklySlots([{ dayIndex: 0, hour: 22 }], 'Europe/London', 'Asia/Tokyo', mon);
console.log('Monday Slots:', tokyoResults[0]);
console.log('Tuesday Slots (Expect 07:00, 07:30):', tokyoResults[1]);

if (tokyoResults[1].includes('07:00') && tokyoResults[1].includes('07:30')) {
    console.log('✅ DAY SHIFT VERIFIED');
} else {
    console.log('❌ DAY SHIFT FAILED');
    process.exit(1);
}
