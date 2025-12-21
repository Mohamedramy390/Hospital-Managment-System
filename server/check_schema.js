const db = require('./db');

(async () => {
    try {
        console.log('Checking User table schema...');
        const [rows] = await db.query('DESCRIBE User');
        const roleColumn = rows.find(r => r.Field === 'Role');
        console.log('Current Role Column Type:', roleColumn.Type);

        // Fix ENUM if necessary including 'LabTech' and 'Lab Technician' just in case
        console.log('Updating Enum...');
        await db.query("ALTER TABLE User MODIFY COLUMN Role ENUM('Admin', 'Doctor', 'Nurse', 'Patient', 'Staff', 'Receptionist', 'LabTech', 'Lab Technician') DEFAULT 'Staff'");
        console.log('Enum updated.');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
