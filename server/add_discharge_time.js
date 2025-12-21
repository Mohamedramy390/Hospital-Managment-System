const db = require('./db');

(async () => {
    try {
        console.log('Checking Visit schema...');
        const [columns] = await db.query('DESCRIBE Visit');
        const hasDischargeTime = columns.some(c => c.Field === 'DischargeTime');

        if (!hasDischargeTime) {
            console.log('Adding DischargeTime column...');
            await db.query('ALTER TABLE Visit ADD COLUMN DischargeTime DATETIME');
            console.log('Column added.');
        } else {
            console.log('DischargeTime column already exists.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
