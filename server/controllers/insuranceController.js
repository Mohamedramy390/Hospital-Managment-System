const Insurance = require('../models/Insurance');

exports.getProviders = async (req, res) => {
    try {
        const [providers] = await Insurance.getProviders();
        res.json(providers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addProvider = async (req, res) => {
    try {
        const [result] = await Insurance.addProvider(req.body.name);
        res.status(201).json({ message: 'Provider added', providerId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createClaim = async (req, res) => {
    try {
        const claimId = await Insurance.createClaim(req.body);
        res.status(201).json({ message: 'Claim created successfully', claimId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateClaimStatus = async (req, res) => {
    try {
        await Insurance.updateClaimStatus(req.body);
        res.json({ message: 'Claim status updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getClaimHistory = async (req, res) => {
    try {
        const [history] = await Insurance.getClaimHistory(req.params.claimId);
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllClaims = async (req, res) => {
    try {
        const [claims] = await Insurance.getAllClaims();
        res.json(claims);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getClaimDetails = async (req, res) => {
    try {
        const [claim] = await Insurance.getClaimDetails(req.params.claimId);
        if (claim.length === 0) {
            return res.status(404).json({ message: 'Claim not found' });
        }
        res.json(claim[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPendingClaims = async (req, res) => {
    try {
        const [claims] = await Insurance.getPendingClaims();
        res.json(claims);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyInsuranceClaims = async (req, res) => {
    try {
        const db = require('../db');
        const [patients] = await db.query('SELECT PatientID FROM Patient WHERE UserID = ?', [req.user.id]);
        if (patients.length === 0) {
            return res.status(404).json({ message: 'Patient profile not found' });
        }

        const [claims] = await Insurance.getClaimsByPatient(patients[0].PatientID);
        res.json(claims);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.processApprovedClaim = async (req, res) => {
    try {
        const result = await Insurance.processApprovedClaim(req.body);
        res.json({
            message: 'Insurance claim processed successfully',
            ...result
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
