const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacyController');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');

router.get('/medicine', authMiddleware, pharmacyController.getMedicine);
router.get('/inventory', authMiddleware, rbacMiddleware(['Admin', 'Pharmacist']), pharmacyController.getInventory);
router.get('/inventory/warnings', authMiddleware, rbacMiddleware(['Admin', 'Pharmacist']), pharmacyController.getInventoryWithWarnings);
router.get('/low-stock', authMiddleware, rbacMiddleware(['Admin', 'Pharmacist']), pharmacyController.getLowStockMedicines);
router.get('/expiring', authMiddleware, rbacMiddleware(['Admin', 'Pharmacist']), pharmacyController.getExpiringMedicines);
router.post('/medicine', authMiddleware, rbacMiddleware(['Admin', 'Pharmacist']), pharmacyController.addMedicine);
router.post('/batch', authMiddleware, rbacMiddleware(['Admin', 'Pharmacist']), pharmacyController.addBatch);
router.put('/inventory/:inventoryId', authMiddleware, rbacMiddleware(['Admin', 'Pharmacist']), pharmacyController.updateInventory);
router.post('/dispense', authMiddleware, rbacMiddleware(['Admin', 'Pharmacist']), pharmacyController.dispense);

module.exports = router;
