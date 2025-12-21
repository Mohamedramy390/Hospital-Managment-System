const express = require('express');
const router = express.Router();
const nursingController = require('../controllers/nursingController');
const authMiddleware = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');

router.post('/assign', authMiddleware, rbacMiddleware(['Admin', 'Doctor']), nursingController.assignNurse);
router.post('/task', authMiddleware, rbacMiddleware(['Admin', 'Doctor', 'Nurse']), nursingController.createTask);
router.get('/tasks', authMiddleware, rbacMiddleware(['Nurse', 'Admin']), nursingController.getStaffTasks);
router.get('/assignments', authMiddleware, rbacMiddleware(['Nurse', 'Admin']), nursingController.getAssignedVisits);
router.put('/task/:taskId/complete', authMiddleware, rbacMiddleware(['Nurse', 'Admin']), nursingController.completeTask);
router.get('/shifts', authMiddleware, rbacMiddleware(['Nurse', 'Admin']), nursingController.getShifts);
router.get('/attendance', authMiddleware, rbacMiddleware(['Nurse', 'Admin']), nursingController.getMyAttendance);
router.post('/clock-in', authMiddleware, rbacMiddleware(['Nurse', 'Admin']), nursingController.clockIn);
router.put('/clock-out/:attendanceId', authMiddleware, rbacMiddleware(['Nurse', 'Admin']), nursingController.clockOut);

// Additional task management routes
router.get('/tasks/all', authMiddleware, rbacMiddleware(['Admin', 'Doctor', 'Nurse']), nursingController.getAllTasks);
router.get('/tasks/visit/:visitId', authMiddleware, nursingController.getTasksByVisit);
router.get('/tasks/:taskId', authMiddleware, nursingController.getTaskById);
router.put('/tasks/:taskId', authMiddleware, rbacMiddleware(['Admin', 'Doctor', 'Nurse']), nursingController.updateTask);
router.delete('/tasks/:taskId', authMiddleware, rbacMiddleware(['Admin', 'Doctor', 'Nurse']), nursingController.deleteTask);

module.exports = router;
