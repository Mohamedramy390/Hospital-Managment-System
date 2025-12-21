const db = require('./db');

(async () => {
    try {
        console.log('--- Starting Migration ---');

        // 1. Populate Roles
        const roles = ['Admin', 'Doctor', 'Nurse', 'Lab Technician', 'Receptionist', 'Pharmacist', 'Patient'];
        console.log('Seeding Roles...');
        for (const r of roles) {
            await db.query(`INSERT IGNORE INTO Role (RoleName) VALUES (?)`, [r]);
        }

        // 2. Add RoleID to User if not exists
        console.log('Checking User table for RoleID...');
        const [userCols] = await db.query('DESCRIBE User');
        if (!userCols.find(c => c.Field === 'RoleID')) {
            console.log('Adding RoleID column...');
            await db.query('ALTER TABLE User ADD COLUMN RoleID INT');
            await db.query('ALTER TABLE User ADD FOREIGN KEY (RoleID) REFERENCES Role(RoleID)');

            // Migrate existing data
            console.log('Migrating existing user roles...');
            // We need to map ENUM strings to IDs. 
            // Note: 'LabTech' in enum should map to 'Lab Technician' in Role table
            const mapping = {
                'Admin': 'Admin',
                'Doctor': 'Doctor',
                'Nurse': 'Nurse',
                'Patient': 'Patient',
                'Receptionist': 'Receptionist',
                'LabTech': 'Lab Technician', // Fix the mapping
                'Lab Technician': 'Lab Technician',
                'Staff': 'Nurse' // Fallback for generic 'Staff' to something valid or NULL? 
                // User said "Doctor is staff", so generic 'Staff' role is invalid. 
                // We'll leave it NULL or default to 'Nurse' or 'Receptionist' if strict.
                // Let's try to infer or just warn.
            };

            const [users] = await db.query('SELECT UserID, Role FROM User');
            for (const u of users) {
                let targetRole = mapping[u.Role] || u.Role;
                const [rRows] = await db.query('SELECT RoleID FROM Role WHERE RoleName = ?', [targetRole]);
                if (rRows.length > 0) {
                    await db.query('UPDATE User SET RoleID = ? WHERE UserID = ?', [rRows[0].RoleID, u.UserID]);
                }
            }
        }

        // 3. Populate Permissions (Basic set)
        const permissions = [
            'manage_users', 'view_patients', 'create_patient',
            'create_appointment', 'view_medical_history', 'diagnose_patient',
            'order_lab_test', 'manage_lab_tests', 'perform_surgery', 'assign_surgery'
        ];
        console.log('Seeding Permissions...');
        for (const p of permissions) {
            await db.query(`INSERT IGNORE INTO Permission (ActionName) VALUES (?)`, [p]);
        }

        // 4. Link Roles to Permissions (Simple default mapping)
        // ... (This logic can be expanded, doing a simple pass for now)
        const rolePerms = {
            'Admin': permissions,
            'Doctor': ['view_patients', 'view_medical_history', 'diagnose_patient', 'order_lab_test', 'perform_surgery'],
            'Nurse': ['view_patients', 'view_medical_history'],
            'Receptionist': ['view_patients', 'create_patient', 'create_appointment'],
            'Lab Technician': ['manage_lab_tests']
        };

        for (const [rName, perms] of Object.entries(rolePerms)) {
            const [rRows] = await db.query('SELECT RoleID FROM Role WHERE RoleName = ?', [rName]);
            if (!rRows.length) continue;
            const rid = rRows[0].RoleID;

            for (const pName of perms) {
                const [pRows] = await db.query('SELECT PermissionID FROM Permission WHERE ActionName = ?', [pName]);
                if (!pRows.length) continue;
                const pid = pRows[0].PermissionID;

                // Check link
                const [link] = await db.query('SELECT * FROM Role_Permission WHERE RoleID = ? AND PermissionID = ?', [rid, pid]);
                if (!link.length) {
                    await db.query('INSERT INTO Role_Permission (RoleID, PermissionID) VALUES (?, ?)', [rid, pid]);
                }
            }
        }

        console.log('Migration Complete.');
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
