const Nursing = require('../models/Nursing');
const db = require('../db');

exports.assignNurse = async (req, res) => {
    try {
        await Nursing.assignNurse(req.body);
        res.status(201).json({ message: 'Nurse assigned to visit' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createTask = async (req, res) => {
    try {
        await Nursing.createTask(req.body);
        res.status(201).json({ message: 'Nursing task created' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStaffTasks = async (req, res) => {
    try {
        const [staff] = await db.query('SELECT StaffID FROM Staff WHERE UserID = ?', [req.user.id]);
        if (staff.length === 0) return res.status(404).json({ message: 'Staff profile not found' });

        const [tasks] = await Nursing.getTasksByStaff(staff[0].StaffID);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAssignedVisits = async (req, res) => {
    try {
        const [staff] = await db.query('SELECT StaffID FROM Staff WHERE UserID = ?', [req.user.id]);
        if (staff.length === 0) return res.status(404).json({ message: 'Staff profile not found' });

        const [visits] = await Nursing.getAssignmentsByStaff(staff[0].StaffID);

        // Enhance with next task ?? maybe later. 
        res.json(visits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.completeTask = async (req, res) => {
    try {
        await Nursing.updateTaskStatus(req.params.taskId, 'Completed');
        res.json({ message: 'Task marked as completed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getShifts = async (req, res) => {
    try {
        const [shifts] = await Nursing.getAllShifts();
        res.json(shifts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyAttendance = async (req, res) => {
    try {
        const [staff] = await db.query('SELECT StaffID FROM Staff WHERE UserID = ?', [req.user.id]);
        if (staff.length === 0) return res.status(404).json({ message: 'Staff profile not found' });

        const [attendance] = await Nursing.getMyAttendance(staff[0].StaffID);
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.clockIn = async (req, res) => {
    try {
        const [staff] = await db.query('SELECT StaffID FROM Staff WHERE UserID = ?', [req.user.id]);
        if (staff.length === 0) return res.status(404).json({ message: 'Staff profile not found' });

        await Nursing.clockIn({ staffId: staff[0].StaffID, shiftId: req.body.shiftId });
        res.status(201).json({ message: 'Clocked in successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.clockOut = async (req, res) => {
    try {
        await Nursing.clockOut(req.params.attendanceId);
        res.json({ message: 'Clocked out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllTasks = async (req, res) => {
    try {
        const [tasks] = await Nursing.getAllTasks();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTasksByVisit = async (req, res) => {
    try {
        const [tasks] = await Nursing.getTasksByVisit(req.params.visitId);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        await Nursing.updateTask(req.params.taskId, req.body);
        res.json({ message: 'Task updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        await Nursing.deleteTask(req.params.taskId);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTaskById = async (req, res) => {
    try {
        const [task] = await Nursing.getTaskById(req.params.taskId);
        if (!task || task.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
