const express = require('express');
const router = express.Router();
const surgeryController = require('../controllers/surgeryController');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');

// Doctor requests surgery
router.post('/request', authMiddleware, rbacMiddleware(['Doctor', 'Admin']), surgeryController.requestSurgery);

// Admin assigns surgeon
router.put('/assign/:requestId', authMiddleware, rbacMiddleware(['Admin']), surgeryController.assignSurgeon);

// Assigned surgeon (Doctor) or Admin schedules the surgery
router.put('/schedule/:requestId', authMiddleware, rbacMiddleware(['Doctor', 'Admin']), surgeryController.scheduleSurgery);

// Complete surgery and upload report
router.put('/complete/:requestId', authMiddleware, rbacMiddleware(['Doctor', 'Admin']), surgeryController.completeSurgery);

// List requests by visit
router.get('/by-visit/:visitId', authMiddleware, surgeryController.getRequestsByVisit);

// Get assigned surgeries for logged in surgeon
router.get('/assigned', authMiddleware, rbacMiddleware(['Doctor', 'Admin']), surgeryController.getAssignedSurgeries);

// Get all pending requests (Admin)
router.get('/pending', authMiddleware, rbacMiddleware(['Admin']), surgeryController.getPendingRequests);

// List available operation rooms
router.get('/rooms/available', authMiddleware, surgeryController.getAvailableRooms);

// Surgery Reports routes
router.get('/reports', authMiddleware, rbacMiddleware(['Doctor', 'Admin', 'Nurse']), surgeryController.getAllSurgeryReports);
router.get('/reports/:requestId', authMiddleware, surgeryController.getSurgeryReport);
router.put('/reports/:requestId', authMiddleware, rbacMiddleware(['Doctor', 'Admin']), surgeryController.updateSurgeryReport);
router.get('/reports/patient/:patientId', authMiddleware, surgeryController.getSurgeryReportsByPatient);

module.exports = router;
