const db = require('./db');

(async () => {
    try {
        console.log('Checking Surgery_Request schema...');
        const [columns] = await db.query('DESCRIBE Surgery_Request');
        const hasScheduledTime = columns.some(c => c.Field === 'ScheduledTime');

        if (!hasScheduledTime) {
            console.log('Adding ScheduledTime column...');
            await db.query('ALTER TABLE Surgery_Request ADD COLUMN ScheduledTime DATETIME');
            console.log('Column added.');
        } else {
            console.log('ScheduledTime column already exists.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
