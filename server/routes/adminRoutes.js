const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Middleware to check if user is admin can be added here if needed
// For now, we rely on the frontend or general auth middleware if applied globally

router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
