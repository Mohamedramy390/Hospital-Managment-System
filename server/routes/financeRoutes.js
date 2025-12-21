const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');

router.post('/invoice/generate/:visitId', authMiddleware, rbacMiddleware(['Admin', 'Receptionist']), financeController.generateInvoice);
router.get('/invoice/:invoiceId', authMiddleware, financeController.getInvoice);
router.get('/invoices/visit/:visitId', authMiddleware, financeController.getVisitInvoices);
router.get('/invoices/all', authMiddleware, financeController.getAllInvoices);
router.post('/payment', authMiddleware, rbacMiddleware(['Admin', 'Receptionist']), financeController.processPayment);

module.exports = router;
