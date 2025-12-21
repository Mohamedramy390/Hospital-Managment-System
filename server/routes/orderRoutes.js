const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');

router.post('/lab/order', authMiddleware, rbacMiddleware(['Doctor', 'Admin']), orderController.createLabOrder);
router.get('/lab/orders/:visitId', authMiddleware, orderController.getLabOrders);
router.post('/lab/result', authMiddleware, rbacMiddleware(['LabTech', 'Lab Technician', 'Admin']), upload.array('files'), orderController.addLabResult);
router.get('/lab/test-types', authMiddleware, orderController.getTestTypes);
router.get('/lab/tests/pending', authMiddleware, rbacMiddleware(['LabTech', 'Lab Technician', 'Admin']), orderController.getPendingLabTests);
router.get('/lab/devices', authMiddleware, orderController.getLabDevices);

router.post('/prescription', authMiddleware, orderController.createPrescription);

module.exports = router;
