const db = require('./db');

async function check() {
    try {
        console.log("--- Last 5 Users ---");
        const [users] = await db.query('SELECT UserID, Username, Role, RoleID FROM User ORDER BY UserID DESC LIMIT 5');
        console.log(JSON.stringify(users, null, 2));

        console.log("\n--- Last 5 Patients ---");
        const [patients] = await db.query('SELECT PatientID, UserID, FirstName, LastName FROM Patient ORDER BY PatientID DESC LIMIT 5');
        console.log(JSON.stringify(patients, null, 2));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
