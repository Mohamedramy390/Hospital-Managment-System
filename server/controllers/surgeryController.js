const Surgery = require('../models/Surgery');
const db = require('../db');

exports.requestSurgery = async (req, res) => {
    try {
        const { visitId } = req.body;

        // Get StaffID from UserID
        const [staffRows] = await db.query('SELECT StaffID FROM Staff WHERE UserID = ?', [req.user.id]);
        if (!staffRows.length) {
            return res.status(400).json({ message: 'User is not registered as staff' });
        }

        const [result] = await Surgery.createRequest({ visitId, requestingStaffId: staffRows[0].StaffID });
        res.status(201).json({ message: 'Surgery request created', requestId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.assignSurgeon = async (req, res) => {
    try {
        const { surgeonStaffId } = req.body;
        await Surgery.assignSurgeon(req.params.requestId, surgeonStaffId);
        res.json({ message: 'Surgeon assigned' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.scheduleSurgery = async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        const { opRoomId, scheduledTime, nurseStaffId } = req.body;

        const [reqRows] = await Surgery.getRequestById(req.params.requestId);
        if (!reqRows.length) return res.status(404).json({ message: 'Request not found' });
        const request = reqRows[0];
        console.log('Surgery Request:', request);

        // Get user's StaffID
        const [staffRows] = await db.query('SELECT StaffID FROM Staff WHERE UserID = ?', [req.user.id]);
        const userStaffId = staffRows.length ? staffRows[0].StaffID : null;
        console.log('User Staff ID:', userStaffId);

        // Only assigned surgeon or admin can schedule
        if (req.user.role !== 'Admin' && userStaffId !== request.SurgeonStaffID) {
            console.log('Forbidden: ', req.user.role, userStaffId, request.SurgeonStaffID);
            return res.status(403).json({ message: 'Forbidden: Only assigned surgeon or admin can schedule' });
        }

        await Surgery.schedule({ requestId: req.params.requestId, opRoomId, scheduledTime, nurseStaffId });
        res.json({ message: 'Surgery scheduled' });
    } catch (error) {
        console.error('Schedule Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.completeSurgery = async (req, res) => {
    try {
        const { reportText } = req.body;

        // Allow surgeon or admin
        const [reqRows] = await Surgery.getRequestById(req.params.requestId);
        if (!reqRows.length) return res.status(404).json({ message: 'Request not found' });
        const request = reqRows[0];

        // Get user's StaffID
        const [staffRows] = await db.query('SELECT StaffID FROM Staff WHERE UserID = ?', [req.user.id]);
        const userStaffId = staffRows.length ? staffRows[0].StaffID : null;

        if (req.user.role !== 'Admin' && userStaffId !== request.SurgeonStaffID) {
            return res.status(403).json({ message: 'Forbidden: Only assigned surgeon or admin can complete' });
        }

        await Surgery.completeSurgery({ requestId: req.params.requestId, reportText });
        res.json({ message: 'Surgery completed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRequestsByVisit = async (req, res) => {
    try {
        const [rows] = await Surgery.getRequestsByVisit(req.params.visitId);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAvailableRooms = async (req, res) => {
    try {
        const [rooms] = await Surgery.getAvailableOpRooms();
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAssignedSurgeries = async (req, res) => {
    try {
        const [staffRows] = await db.query('SELECT StaffID FROM Staff WHERE UserID = ?', [req.user.id]);
        if (!staffRows.length) return res.status(400).json({ message: 'User not staff' });

        const [rows] = await Surgery.getAssignedToStaff(staffRows[0].StaffID);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPendingRequests = async (req, res) => {
    try {
        const [rows] = await Surgery.getPendingRequests();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSurgeryReport = async (req, res) => {
    try {
        const [report] = await Surgery.getSurgeryReport(req.params.requestId);
        if (!report || report.length === 0) {
            return res.status(404).json({ message: 'Surgery report not found' });
        }
        res.json(report[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllSurgeryReports = async (req, res) => {
    try {
        const [reports] = await Surgery.getAllSurgeryReports();
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateSurgeryReport = async (req, res) => {
    try {
        const { reportText } = req.body;
        await Surgery.updateSurgeryReport(req.params.requestId, reportText);
        res.json({ message: 'Surgery report updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSurgeryReportsByPatient = async (req, res) => {
    try {
        const [reports] = await Surgery.getSurgeryReportsByPatient(req.params.patientId);
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
