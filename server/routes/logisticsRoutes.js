const express = require('express');
const router = express.Router();
const logisticsController = require('../controllers/logisticsController');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');
const auditMiddleware = require('../middleware/auditMiddleware');

// Patients
router.get('/patients', authMiddleware, logisticsController.getPatients);
router.post('/patients', authMiddleware, rbacMiddleware(['Admin', 'Doctor', 'Receptionist']), auditMiddleware('Create Patient'), logisticsController.createPatient);
router.get('/doctors', authMiddleware, logisticsController.getDoctors);
router.get('/nurses', authMiddleware, logisticsController.getNurses);

// Appointments
router.get('/appointments', authMiddleware, logisticsController.getAppointments);
router.post('/appointments', authMiddleware, rbacMiddleware(['Admin', 'Receptionist', 'Doctor']), auditMiddleware('Schedule Appointment'), logisticsController.createAppointment);

// Visits/Admissions
router.post('/admit', authMiddleware, rbacMiddleware(['Admin', 'Doctor', 'Nurse', 'Receptionist']), auditMiddleware('Admit Patient'), logisticsController.admitPatient);
router.get('/visits/active', authMiddleware, logisticsController.getActiveVisits);

// Beds
router.get('/beds/available', authMiddleware, logisticsController.getAvailableBeds);
router.get('/beds/all', authMiddleware, logisticsController.getAllBeds);
router.post('/beds/assign-with-plan', authMiddleware, rbacMiddleware(['Doctor', 'Admin']), logisticsController.assignBedWithTreatmentPlan);

module.exports = router;
