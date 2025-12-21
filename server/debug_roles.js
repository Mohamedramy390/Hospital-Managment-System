const db = require('./db');

(async () => {
    try {
        console.log('--- Debugging Role Linkage ---');

        // 1. Check Role Table
        console.log('\nFetching Role Table:');
        const [roles] = await db.query('SELECT * FROM Role');
        console.table(roles);

        // 2. Check User Table Structure
        console.log('\nUser Table Structure:');
        const [cols] = await db.query('DESCRIBE User');
        // console.table(cols);
        console.log(cols.map(c => `${c.Field} (${c.Type})`).join(', '));

        // 3. Simulate Logic
        const targetRoleName = 'Lab Technician';
        console.log(`\nSimulating lookup for: "${targetRoleName}"`);
        const [lookup] = await db.query('SELECT RoleID FROM Role WHERE RoleName = ?', [targetRoleName]);
        console.log('Lookup result:', lookup);
        if (lookup.length > 0) {
            console.log('Found RoleID:', lookup[0].RoleID);
        } else {
            console.log('Role NOT found');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
