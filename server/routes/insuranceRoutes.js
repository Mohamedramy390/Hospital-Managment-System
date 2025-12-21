const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insuranceController');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');

router.get('/providers', authMiddleware, insuranceController.getProviders);
router.post('/providers', authMiddleware, rbacMiddleware(['Admin']), insuranceController.addProvider);

router.get('/claims', authMiddleware, rbacMiddleware(['Admin', 'Receptionist']), insuranceController.getAllClaims);
router.get('/claims/pending', authMiddleware, rbacMiddleware(['Admin', 'Receptionist']), insuranceController.getPendingClaims);
router.get('/claims/:claimId', authMiddleware, insuranceController.getClaimDetails);
router.get('/claims/:claimId/history', authMiddleware, insuranceController.getClaimHistory);

router.post('/claims', authMiddleware, rbacMiddleware(['Admin', 'Receptionist']), insuranceController.createClaim);
router.post('/claims/status', authMiddleware, rbacMiddleware(['Admin', 'Receptionist']), insuranceController.updateClaimStatus);
router.post('/claims/process-approved', authMiddleware, rbacMiddleware(['Admin', 'Receptionist']), insuranceController.processApprovedClaim);

router.get('/my-claims', authMiddleware, rbacMiddleware(['Patient']), insuranceController.getMyInsuranceClaims);

module.exports = router;
