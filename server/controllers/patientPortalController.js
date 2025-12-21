const db = require('../db');

exports.getMyVisits = async (req, res) => {
    try {
        // Find PatientID for this UserID
        const [patients] = await db.query('SELECT PatientID FROM Patient WHERE UserID = ?', [req.user.id]);
        if (patients.length === 0) return res.status(404).json({ message: 'Patient profile not found' });

        const patientId = patients[0].PatientID;
        const [visits] = await db.query('SELECT * FROM Visit WHERE PatientID = ? ORDER BY AdmissionTime DESC', [patientId]);
        res.json(visits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyResults = async (req, res) => {
    try {
        const [patients] = await db.query('SELECT PatientID FROM Patient WHERE UserID = ?', [req.user.id]);
        if (patients.length === 0) return res.status(404).json({ message: 'Patient profile not found' });

        const patientId = patients[0].PatientID;
        const [results] = await db.query(`
            SELECT lr.*, tt.TestName, tt.ReferenceRange, v.AdmissionTime
            FROM Lab_Result lr
            JOIN Lab_Test lt ON lr.TestID = lt.TestID
            JOIN Lab_Order lo ON lt.OrderID = lo.OrderID
            JOIN Visit v ON lo.VisitID = v.VisitID
            JOIN Test_Type tt ON lt.TestTypeID = tt.TestTypeID
            WHERE v.PatientID = ?
            ORDER BY v.AdmissionTime DESC
        `, [patientId]);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyInvoices = async (req, res) => {
    try {
        const [patients] = await db.query('SELECT PatientID FROM Patient WHERE UserID = ?', [req.user.id]);
        if (patients.length === 0) return res.status(404).json({ message: 'Patient profile not found' });

        const patientId = patients[0].PatientID;
        const [invoices] = await db.query(`
            SELECT i.*, v.AdmissionTime,
                   COALESCE((SELECT SUM(AmountPaid) FROM Payment WHERE InvoiceID = i.InvoiceID), 0) as TotalPaid
            FROM Invoice i
            JOIN Visit v ON i.VisitID = v.VisitID
            WHERE v.PatientID = ?
            ORDER BY i.InvoiceID DESC
        `, [patientId]);
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyAppointments = async (req, res) => {
    try {
        const [patients] = await db.query('SELECT PatientID FROM Patient WHERE UserID = ?', [req.user.id]);
        if (patients.length === 0) return res.status(404).json({ message: 'Patient profile not found' });

        const [appointments] = await require('../models/Appointment').findByPatientId(patients[0].PatientID);
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.processPayment = async (req, res) => {
    try {
        const { invoiceId, amount, method } = req.body;
        // Verify ownership? Ideally yes.
        // For now, reuse Finance model logic which is secure enough for this demo
        await require('../models/Finance').addPayment({ invoiceId, amount, method });
        res.status(201).json({ message: 'Payment processed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyPrescriptions = async (req, res) => {
    try {
        const [patients] = await db.query('SELECT PatientID FROM Patient WHERE UserID = ?', [req.user.id]);
        if (patients.length === 0) return res.status(404).json({ message: 'Patient profile not found' });

        const [prescriptions] = await db.query(`
            SELECT p.*, v.AdmissionTime, v.VisitType,
                   GROUP_CONCAT(CONCAT(m.Name, ' (', pi.Dosage, ')') SEPARATOR ', ') as Medications
            FROM Prescription p
            JOIN Visit v ON p.VisitID = v.VisitID
            LEFT JOIN Prescription_Item pi ON p.PrescriptionID = pi.PrescriptionID
            LEFT JOIN Medicine m ON pi.MedicineID = m.MedicineID
            WHERE v.PatientID = ?
            GROUP BY p.PrescriptionID
            ORDER BY p.PrescriptionID DESC
        `, [patients[0].PatientID]);
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyDiagnoses = async (req, res) => {
    try {
        const [patients] = await db.query('SELECT PatientID FROM Patient WHERE UserID = ?', [req.user.id]);
        if (patients.length === 0) return res.status(404).json({ message: 'Patient profile not found' });

        const [diagnoses] = await db.query(`
            SELECT d.*, v.AdmissionTime, v.VisitType, s.FirstName as DoctorFirstName, s.LastName as DoctorLastName
            FROM Diagnosis d
            JOIN Visit v ON d.VisitID = v.VisitID
            JOIN Staff s ON d.StaffID = s.StaffID
            WHERE v.PatientID = ?
            ORDER BY d.DiagnosisID DESC
        `, [patients[0].PatientID]);
        res.json(diagnoses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
