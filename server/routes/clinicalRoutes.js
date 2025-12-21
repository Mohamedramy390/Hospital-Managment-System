const express = require('express');
const router = express.Router();
const clinicalController = require('../controllers/clinicalController');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');

// Only Doctors can add diagnosis
router.get('/my-patients', authMiddleware, rbacMiddleware(['Doctor', 'Admin']), clinicalController.getMyPatients);
router.post('/diagnosis', authMiddleware, rbacMiddleware(['Doctor', 'Admin']), clinicalController.addDiagnosis);
router.get('/history/:patientId', authMiddleware, clinicalController.getPatientHistory);
router.get('/visit/active/:patientId', authMiddleware, clinicalController.getActiveVisit);

// Doctor Notes routes
router.post('/notes', authMiddleware, rbacMiddleware(['Doctor', 'Admin']), clinicalController.addDoctorNote);
router.get('/notes/visit/:visitId', authMiddleware, clinicalController.getDoctorNotesByVisit);
router.get('/notes/patient/:patientId', authMiddleware, clinicalController.getDoctorNotesByPatient);
router.put('/notes/:noteId', authMiddleware, rbacMiddleware(['Doctor', 'Admin']), clinicalController.updateDoctorNote);
router.delete('/notes/:noteId', authMiddleware, rbacMiddleware(['Doctor', 'Admin']), clinicalController.deleteDoctorNote);

// Treatment Plans routes
router.post('/treatment-plans', authMiddleware, rbacMiddleware(['Doctor', 'Admin']), clinicalController.addTreatmentPlan);
router.get('/treatment-plans/visit/:visitId', authMiddleware, clinicalController.getTreatmentPlansByVisit);
router.get('/treatment-plans/patient/:patientId', authMiddleware, clinicalController.getTreatmentPlansByPatient);

// Combined operations for better workflow
router.post('/diagnosis-with-notes', authMiddleware, rbacMiddleware(['Doctor', 'Admin']), clinicalController.addDiagnosisWithNotes);
router.post('/treatment-plans-with-tasks', authMiddleware, rbacMiddleware(['Doctor', 'Admin']), clinicalController.addTreatmentPlanWithTasks);

module.exports = router;
