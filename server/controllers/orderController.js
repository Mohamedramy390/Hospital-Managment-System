const db = require('../db'); // Added db import
const Lab = require('../models/Lab');
const Prescription = require('../models/Prescription');

exports.createLabOrder = async (req, res) => {
    try {
        // Get StaffID from UserID
        const [staff] = await db.query('SELECT StaffID FROM Staff WHERE UserID = ?', [req.user.id]);
        if (staff.length === 0) {
            return res.status(403).json({ message: 'User is not a staff member' });
        }
        const staffId = staff[0].StaffID;

        const orderId = await Lab.createOrder({
            ...req.body,
            requestingStaffId: staffId
        });
        res.status(201).json({ message: 'Lab order created', orderId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getLabOrders = async (req, res) => {
    try {
        const [orders] = await Lab.getOrdersByVisit(req.params.visitId);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addLabResult = async (req, res) => {
    try {
        const resultId = await Lab.addResult({
            ...req.body,
            files: req.files
        });
        res.status(201).json({ message: 'Lab result added', resultId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createPrescription = async (req, res) => {
    try {
        // Get StaffID from UserID
        const [staff] = await db.query('SELECT StaffID FROM Staff WHERE UserID = ?', [req.user.id]);
        if (staff.length === 0) {
            return res.status(403).json({ message: 'User is not a staff member' });
        }
        const staffId = staff[0].StaffID;

        const prescriptionId = await Prescription.create({
            ...req.body,
            staffId: staffId
        });
        res.status(201).json({ message: 'Prescription created', prescriptionId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTestTypes = async (req, res) => {
    try {
        const [types] = await Lab.getTestTypes();
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPendingLabTests = async (req, res) => {
    try {
        const [rows] = await Lab.getPendingTests();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getLabDevices = async (req, res) => {
    try {
        const [devices] = await Lab.getDevices();
        res.json(devices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
