const db = require('./db');

(async () => {
    try {
        console.log('--- Fixing Missing Staff Records ---');

        // 1. Get all non-patient users
        // Use RoleID for accuracy if populated, but fallback/join for safety
        const [users] = await db.query(`
            SELECT u.UserID, u.Username, u.Role, r.RoleName 
            FROM User u
            LEFT JOIN Role r ON u.RoleID = r.RoleID
            LEFT JOIN Staff s ON u.UserID = s.UserID
            WHERE s.StaffID IS NULL 
            AND (r.RoleName != 'Patient' OR (r.RoleName IS NULL AND u.Role != 'Patient'))
        `);

        console.log(`Found ${users.length} users with missing Staff records.`);

        for (const u of users) {
            const role = u.RoleName || u.Role;
            console.log(`Fixing User: ${u.Username} (${role})`);

            // Insert into Staff
            // We'll use username as First/Last name for now
            await db.query(
                'INSERT INTO Staff (UserID, FirstName, LastName) VALUES (?, ?, ?)',
                [u.UserID, u.Username, 'Staff']
            );
        }

        console.log('--- Fix Complete ---');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
