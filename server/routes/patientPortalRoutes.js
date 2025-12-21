const express = require('express');
const router = express.Router();
const patientPortalController = require('../controllers/patientPortalController');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');

router.get('/visits', authMiddleware, rbacMiddleware(['Patient', 'Admin']), patientPortalController.getMyVisits);
router.get('/results', authMiddleware, rbacMiddleware(['Patient', 'Admin']), patientPortalController.getMyResults);
router.get('/invoices', authMiddleware, rbacMiddleware(['Patient', 'Admin']), patientPortalController.getMyInvoices);
router.get('/appointments', authMiddleware, rbacMiddleware(['Patient']), patientPortalController.getMyAppointments);
router.get('/prescriptions', authMiddleware, rbacMiddleware(['Patient']), patientPortalController.getMyPrescriptions);
router.get('/diagnoses', authMiddleware, rbacMiddleware(['Patient']), patientPortalController.getMyDiagnoses);
router.post('/pay', authMiddleware, rbacMiddleware(['Patient']), patientPortalController.processPayment);

module.exports = router;
