const db = require('../db');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Visit = require('../models/Visit');
const Bed = require('../models/Bed');

exports.getPatients = async (req, res) => {
    try {
        const [patients] = await Patient.findAll();
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const bcrypt = require('bcrypt');

exports.createPatient = async (req, res) => {
    try {
        const { firstName, lastName, dob } = req.body;

        if (!firstName || !lastName) {
            return res.status(400).json({ message: 'First Name and Last Name are required' });
        }

        // 1. Generate Credentials
        const tempPassword = Math.random().toString(36).slice(-8); // Random 8 chars
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        // Username base
        let baseUsername = `patient_${firstName.toLowerCase()}${lastName.toLowerCase()}`.replace(/[^a-z0-9]/g, '');
        // Append random num ensure uniqueness
        const username = `${baseUsername}${Math.floor(Math.random() * 1000)}`;

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 2. Get RoleID for 'Patient'
            const [roles] = await connection.query("SELECT RoleID FROM Role WHERE RoleName = 'Patient'");
            if (roles.length === 0) throw new Error("Role 'Patient' not found in DB");
            const roleId = roles[0].RoleID;

            // 3. Create User
            // Note: Schema might have 'RoleID' and legacy 'Role' enum or vice versa. We insert both for maximizing compatibility.
            const [userRes] = await connection.query(
                'INSERT INTO User (Username, PasswordHash, Role, RoleID) VALUES (?, ?, ?, ?)',
                [username, hashedPassword, 'Patient', roleId]
            );
            const userId = userRes.insertId;

            if (!userId) {
                throw new Error("Failed to insert User, no ID returned.");
            }

            // 4. Create Patient linked to User
            // Ensure DOB is valid or NULL
            const birthDate = dob || null;
            const [patientRes] = await connection.query(
                'INSERT INTO Patient (UserID, FirstName, LastName, DateOfBirth) VALUES (?, ?, ?, ?)',
                [userId, firstName, lastName, birthDate]
            );

            if (patientRes.affectedRows === 0) {
                throw new Error("Failed to insert Patient record.");
            }

            await connection.commit();

            // Return credentials to Admin/Receptionist
            res.status(201).json({
                message: 'Patient registered successfully',
                credentials: { username, password: tempPassword }
            });

        } catch (err) {
            await connection.rollback();
            console.error("Patient Creation Transaction Error:", err);
            throw err;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error("createPatient Error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.createAppointment = async (req, res) => {
    try {
        await Appointment.create(req.body);
        res.status(201).json({ message: 'Appointment scheduled' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAppointments = async (req, res) => {
    try {
        const [appointments] = await Appointment.findAll();
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.admitPatient = async (req, res) => {
    try {
        const { patientId, type, bedId, assignedNurseId } = req.body;

        // Create Visit
        const [visitResult] = await Visit.create({ patientId, type });
        const visitId = visitResult.insertId;

        // If inpatient and bed provided, assign bed (requires treatment plan)
        if (type === 'Inpatient' && bedId) {
            try {
                await Bed.assign({
                    patientId,
                    bedId,
                    visitId,
                    assignedNurseId
                });
            } catch (bedError) {
                // If treatment plan is required, return helpful error
                // if (bedError.message.includes('Treatment plan is required')) {
                //     return res.status(400).json({
                //         message: 'Treatment plan required',
                //         detail: 'Please create a treatment plan before assigning a bed to an inpatient.',
                //         visitId: visitId
                //     });
                // }
                throw bedError;
            }
        }

        res.status(201).json({ message: 'Patient admitted', visitId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.assignBedWithTreatmentPlan = async (req, res) => {
    try {
        const db = require('../db');
        const [staff] = await db.query('SELECT StaffID FROM Staff WHERE UserID = ?', [req.user.id]);

        if (staff.length === 0) {
            return res.status(403).json({ message: 'Staff profile not found' });
        }

        await Bed.assignWithTreatmentPlan({
            ...req.body,
            staffId: staff[0].StaffID
        });

        res.status(201).json({
            message: 'Bed assigned with treatment plan and nurse tasks created successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAvailableBeds = async (req, res) => {
    try {
        const [beds] = await Bed.findAvailable();
        res.json(beds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllBeds = async (req, res) => {
    try {
        const [beds] = await db.query('SELECT * FROM Bed');
        res.json(beds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getDoctors = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT st.StaffID, st.FirstName, st.LastName
            FROM Staff st
            JOIN User u ON st.UserID = u.UserID
            WHERE u.Role = 'Doctor'
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getNurses = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT st.StaffID, st.FirstName, st.LastName
            FROM Staff st
            JOIN User u ON st.UserID = u.UserID
            WHERE u.Role = 'Nurse'
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getActiveVisits = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT v.VisitID, v.VisitType, v.AdmissionTime, p.FirstName, p.LastName, p.PatientID
            FROM Visit v
            JOIN Patient p ON v.PatientID = p.PatientID
            WHERE v.DischargeTime IS NULL
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
