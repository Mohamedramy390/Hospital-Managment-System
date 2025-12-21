const db = require('./db');

const seedShifts = async () => {
    try {
        console.log('Seeding shifts...');

        const shifts = ['Morning Shift (6AM-2PM)', 'Afternoon Shift (2PM-10PM)', 'Night Shift (10PM-6AM)'];

        for (const shift of shifts) {
            await db.query('INSERT IGNORE INTO Shift (ShiftName) VALUES (?)', [shift]);
        }

        console.log('Shifts seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding shifts:', err);
        process.exit(1);
    }
};

seedShifts();
