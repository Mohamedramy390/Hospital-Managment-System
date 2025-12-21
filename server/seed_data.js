const db = require('./db');
const bcrypt = require('bcrypt');

const seed = async () => {
    try {
        console.log('--- Seeding Data ---');

        // Helper to get random item from array
        const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];
        // Helper to get random int
        const randint = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('password123', salt);

        // 1. Departments
        console.log('Seeding Departments...');
        const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Emergency', 'Oncology', 'Radiology', 'Pathology', 'Surgery', 'General'];
        for (const d of departments) {
            await db.query('INSERT IGNORE INTO Department (DepartmentName) VALUES (?)', [d]);
        }
        const [deptRows] = await db.query('SELECT DepartmentID, DepartmentName FROM Department');

        // 2. Roles (Already seeded, but ensure IDs are known)
        // We'll trust the DB has them from previous migration.
        const [roleRows] = await db.query('SELECT RoleID, RoleName FROM Role');
        const getRoleId = (name) => roleRows.find(r => r.RoleName === name)?.RoleID;

        // 3. Staff Users
        console.log('Seeding Staff...');
        const staffData = [
            { role: 'Admin', first: 'Admin', last: 'User', dept: 'General' },
            { role: 'Doctor', first: 'Gregory', last: 'House', dept: 'Cardiology' },
            { role: 'Doctor', first: 'James', last: 'Wilson', dept: 'Oncology' },
            { role: 'Doctor', first: 'Lisa', last: 'Cuddy', dept: 'General' },
            { role: 'Nurse', first: 'Allison', last: 'Cameron', dept: 'Emergency' },
            { role: 'Nurse', first: 'Robert', last: 'Chase', dept: 'Surgery' },
            { role: 'Nurse', first: 'Eric', last: 'Foreman', dept: 'Neurology' },
            { role: 'Lab Technician', first: 'Dexter', last: 'Morgan', dept: 'Pathology' },
            { role: 'Lab Technician', first: 'Walter', last: 'White', dept: 'Pathology' },
            { role: 'Receptionist', first: 'Pam', last: 'Beesly', dept: 'General' },
            { role: 'Receptionist', first: 'Erin', last: 'Hannon', dept: 'General' },
            { role: 'Pharmacist', first: 'Jesse', last: 'Pinkman', dept: 'General' }
        ];

        for (const s of staffData) {
            const username = `${s.role.toLowerCase().replace(' ', '')}_${s.last.toLowerCase()}${randint(1, 99)}`;
            // Check existence
            const [exists] = await db.query('SELECT * FROM User WHERE Username = ?', [username]);
            if (exists.length === 0) {
                const rID = getRoleId(s.role);
                const [uRes] = await db.query(
                    'INSERT INTO User (Username, PasswordHash, Role, RoleID) VALUES (?, ?, ?, ?)',
                    [username, hash, s.role === 'Lab Technician' ? 'LabTech' : s.role, rID]
                );

                const dID = deptRows.find(d => d.DepartmentName === s.dept)?.DepartmentID;
                await db.query(
                    'INSERT INTO Staff (UserID, FirstName, LastName, DepartmentID) VALUES (?, ?, ?, ?)',
                    [uRes.insertId, s.first, s.last, dID]
                );
            }
        }

        // 4. Patients
        console.log('Seeding Patients...');
        const patients = [
            { first: 'John', last: 'Doe' }, { first: 'Jane', last: 'Smith' },
            { first: 'Michael', last: 'Johnson' }, { first: 'Emily', last: 'Davis' },
            { first: 'David', last: 'Wilson' }, { first: 'Sarah', last: 'Brown' },
            { first: 'Chris', last: 'Taylor' }, { first: 'Anna', last: 'Anderson' },
            { first: 'Tom', last: 'Thomas' }, { first: 'Laura', last: 'Jackson' }
        ];

        const rIDPatient = getRoleId('Patient');
        for (const p of patients) {
            const username = `patient_${p.last.toLowerCase()}${randint(1, 999)}`;
            const [exists] = await db.query('SELECT * FROM User WHERE Username = ?', [username]);
            if (exists.length === 0) {
                const [uRes] = await db.query(
                    'INSERT INTO User (Username, PasswordHash, Role, RoleID) VALUES (?, ?, ?, ?)',
                    [username, hash, 'Patient', rIDPatient]
                );
                await db.query(
                    'INSERT INTO Patient (UserID, FirstName, LastName, DateOfBirth) VALUES (?, ?, ?, ?)',
                    [uRes.insertId, p.first, p.last, `19${randint(50, 99)}-${randint(1, 12)}-${randint(1, 28)}`]
                );
            }
        }

        // 5. Beds & Op Rooms
        console.log('Seeding Facilities...');
        for (let i = 101; i <= 110; i++) {
            await db.query('INSERT IGNORE INTO Bed (RoomNumber) VALUES (?)', [`R-${i}`]);
        }
        for (let i = 1; i <= 5; i++) {
            await db.query('INSERT IGNORE INTO Operation_Room (RoomName) VALUES (?)', [`OR-${i}`]);
        }

        // 6. Medical Data (Visits, etc.)
        const [allPatients] = await db.query('SELECT PatientID FROM Patient');
        const [allStaff] = await db.query('SELECT StaffID, DepartmentID FROM Staff');
        const [allDocs] = await db.query(`
            SELECT s.StaffID FROM Staff s 
            JOIN User u ON s.UserID = u.UserID 
            JOIN Role r ON u.RoleID = r.RoleID 
            WHERE r.RoleName = 'Doctor'
        `);

        console.log('Seeding Visits & Clinical Data...');
        if (allPatients.length > 0 && allDocs.length > 0) {
            for (const p of allPatients) {
                // Create a visit
                const type = sample(['Inpatient', 'Outpatient', 'Emergency']);
                const [vRes] = await db.query(
                    'INSERT INTO Visit (PatientID, VisitType) VALUES (?, ?)',
                    [p.PatientID, type]
                );
                const visitId = vRes.insertId;

                // Create Appointment
                const doc = sample(allDocs);
                await db.query(
                    'INSERT INTO Appointment (PatientID, StaffID, AppointmentTime, Status) VALUES (?, ?, NOW(), ?)',
                    [p.PatientID, doc.StaffID, sample(['Scheduled', 'Completed'])]
                );

                // Diagnosis
                await db.query(
                    'INSERT INTO Diagnosis (VisitID, StaffID, DiagnosisNotes) VALUES (?, ?, ?)',
                    [visitId, doc.StaffID, 'Routine checkup, patient presents with mild symptoms.']
                );

                // If Inpatient, assign Bed (randomly)
                if (type === 'Inpatient' || type === 'Emergency') {
                    const [beds] = await db.query('SELECT BedID FROM Bed WHERE IsAvailable = 1 LIMIT 1');
                    if (beds.length > 0) {
                        await db.query(
                            'INSERT INTO Bed_Assignment (PatientID, BedID, VisitID) VALUES (?, ?, ?)',
                            [p.PatientID, beds[0].BedID, visitId]
                        );
                        await db.query('UPDATE Bed SET IsAvailable = 0 WHERE BedID = ?', [beds[0].BedID]);
                    }
                }
            }
        }

        // 7. Lab & Pharma
        console.log('Seeding Lab & Pharma...');
        const medicines = ['Paracetamol', 'Ibuprofen', 'Amoxicillin', 'Metformin', 'Atorvastatin', 'Omeprazole', 'Lisinopril', 'Amlodipine', 'Metoprolol', 'Albuterol'];
        for (const m of medicines) {
            await db.query('INSERT IGNORE INTO Medicine (Name) VALUES (?)', [m]);
        }

        const tests = ['Complete Blood Count', 'Lipid Profile', 'Blood Glucose', 'Liver Function Test', 'Kidney Function Test', 'Thyroid Profile', 'Urinalysis', 'X-Ray Chest', 'ECG', 'MRI Brain'];
        for (const t of tests) {
            await db.query('INSERT IGNORE INTO Test_Type (TestName) VALUES (?)', [t]);
        }

        const devices = ['Analyzer X1', 'Centrifuge C200', 'Microscope M50'];
        for (const d of devices) {
            await db.query('INSERT IGNORE INTO Lab_Device (DeviceName) VALUES (?)', [d]);
        }

        // Create some orders for existing visits
        const [visits] = await db.query('SELECT VisitID FROM Visit LIMIT 5');
        const [testTypes] = await db.query('SELECT TestTypeID FROM Test_Type');

        if (visits.length && testTypes.length && allDocs.length) {
            for (const v of visits) {
                // Lab Order
                const [oRes] = await db.query(
                    'INSERT INTO Lab_Order (VisitID, RequestingStaffID) VALUES (?, ?)',
                    [v.VisitID, sample(allDocs).StaffID]
                );
                // Lab Tests
                await db.query(
                    'INSERT INTO Lab_Test (OrderID, TestTypeID, Status) VALUES (?, ?, ?)',
                    [oRes.insertId, sample(testTypes).TestTypeID, sample(['Pending', 'Completed'])]
                );
            }
        }

        // 8. Insurance
        const insurances = ['Blue Cross', 'Aetna', 'UnitedHealth', 'Cigna', 'Kaiser'];
        for (const i of insurances) {
            await db.query('INSERT IGNORE INTO Insurance_Provider (ProviderName) VALUES (?)', [i]);
        }

        console.log('--- Seeding Complete ---');
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
