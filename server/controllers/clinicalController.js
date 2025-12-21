const Clinical = require('../models/Clinical');
const Visit = require('../models/Visit');
const Patient = require('../models/Patient');

exports.getMyPatients = async (req, res) => {
    try {
        const db = require('../db');
        const [staff] = await db.query('SELECT StaffID FROM Staff WHERE UserID = ?', [req.user.id]);

        if (staff.length === 0) {
            return res.status(403).json({ message: 'Staff profile not found' });
        }

        const [patients] = await Patient.findForDoctor(staff[0].StaffID);
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addDiagnosis = async (req, res) => {
    try {
        await Clinical.addDiagnosis({
            ...req.body,
            staffId: req.user.id // Assigning current user as Staff (Assuming UserID maps to StaffID logic handled elsewhere or direct)
        });
        res.status(201).json({ message: 'Diagnosis added' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPatientHistory = async (req, res) => {
    try {
        const [history] = await Clinical.getHistory(req.params.patientId);
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getActiveVisit = async (req, res) => {
    try {
        const [visit] = await Visit.findActiveByPatient(req.params.patientId);
        if (!visit.length) return res.status(404).json({ message: 'No active visit' });
        res.json(visit[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addDoctorNote = async (req, res) => {
    try {
        const db = require('../db');
        const [staff] = await db.query('SELECT StaffID FROM Staff WHERE UserID = ?', [req.user.id]);

        if (staff.length === 0) {
            return res.status(403).json({ message: 'Staff profile not found' });
        }

        await Clinical.addDoctorNote({
            ...req.body,
            staffId: staff[0].StaffID
        });
        res.status(201).json({ message: 'Doctor note added successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getDoctorNotesByVisit = async (req, res) => {
    try {
        const [notes] = await Clinical.getDoctorNotesByVisit(req.params.visitId);
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getDoctorNotesByPatient = async (req, res) => {
    try {
        const [notes] = await Clinical.getDoctorNotesByPatient(req.params.patientId);
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateDoctorNote = async (req, res) => {
    try {
        await Clinical.updateDoctorNote(req.params.noteId, req.body.noteText);
        res.json({ message: 'Doctor note updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteDoctorNote = async (req, res) => {
    try {
        await Clinical.deleteDoctorNote(req.params.noteId);
        res.json({ message: 'Doctor note deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addTreatmentPlan = async (req, res) => {
    try {
        const db = require('../db');
        const [staff] = await db.query('SELECT StaffID FROM Staff WHERE UserID = ?', [req.user.id]);

        if (staff.length === 0) {
            return res.status(403).json({ message: 'Staff profile not found' });
        }

        await Clinical.addTreatmentPlan({
            ...req.body,
            staffId: staff[0].StaffID
        });
        res.status(201).json({ message: 'Treatment plan added successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTreatmentPlansByVisit = async (req, res) => {
    try {
        const [plans] = await Clinical.getTreatmentPlansByVisit(req.params.visitId);
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTreatmentPlansByPatient = async (req, res) => {
    try {
        const [plans] = await Clinical.getTreatmentPlansByPatient(req.params.patientId);
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addDiagnosisWithNotes = async (req, res) => {
    try {
        const db = require('../db');
        const [staff] = await db.query('SELECT StaffID FROM Staff WHERE UserID = ?', [req.user.id]);

        if (staff.length === 0) {
            return res.status(403).json({ message: 'Staff profile not found' });
        }

        await Clinical.addDiagnosisWithNotes({
            ...req.body,
            staffId: staff[0].StaffID
        });
        res.status(201).json({ message: 'Diagnosis and notes added successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addTreatmentPlanWithTasks = async (req, res) => {
    try {
        const db = require('../db');
        const [staff] = await db.query('SELECT StaffID FROM Staff WHERE UserID = ?', [req.user.id]);

        if (staff.length === 0) {
            return res.status(403).json({ message: 'Staff profile not found' });
        }

        await Clinical.addTreatmentPlanWithTasks({
            ...req.body,
            staffId: staff[0].StaffID
        });
        res.status(201).json({ message: 'Treatment plan created and nurse tasks assigned successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
