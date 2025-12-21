const db = require('../db');

class Nursing {
    static async assignNurse(data) {
        const { visitId, staffId } = data;
        return db.query(
            'INSERT INTO Nurse_Assignment (VisitID, StaffID) VALUES (?, ?)',
            [visitId, staffId]
        );
    }

    static async createTask(data) {
        const { visitId, assignedStaffId, description } = data;
        return db.query(
            'INSERT INTO Nurse_Task (VisitID, AssignedStaffID, Description) VALUES (?, ?, ?)',
            [visitId, assignedStaffId, description]
        );
    }

    static async getTasksByStaff(staffId) {
        return db.query(`
            SELECT nt.*, p.FirstName as PatientName, p.LastName as PatientLastName
            FROM Nurse_Task nt
            JOIN Visit v ON nt.VisitID = v.VisitID
            JOIN Patient p ON v.PatientID = p.PatientID
            WHERE nt.AssignedStaffID = ? AND nt.Status = 'Pending'
        `, [staffId]);
    }

    static async updateTaskStatus(taskId, status) {
        return db.query('UPDATE Nurse_Task SET Status = ? WHERE TaskID = ?', [status, taskId]);
    }

    static async getAssignmentsByStaff(staffId) {
        return db.query(`
            SELECT na.*, v.*, p.FirstName, p.LastName, p.DateOfBirth
            FROM Nurse_Assignment na
            JOIN Visit v ON na.VisitID = v.VisitID
            JOIN Patient p ON v.PatientID = p.PatientID
            WHERE na.StaffID = ?
        `, [staffId]);
    }

    static async getAllShifts() {
        return db.query('SELECT * FROM Shift');
    }

    static async getMyAttendance(staffId) {
        return db.query(`
            SELECT a.*, s.ShiftName 
            FROM Attendance a
            JOIN Shift s ON a.ShiftID = s.ShiftID
            WHERE a.StaffID = ?
            ORDER BY a.ClockInTime DESC
        `, [staffId]);
    }

    static async clockIn(data) {
        const { staffId, shiftId } = data;
        return db.query(
            'INSERT INTO Attendance (StaffID, ShiftID, ClockInTime) VALUES (?, ?, NOW())',
            [staffId, shiftId]
        );
    }

    static async clockOut(attendanceId) {
        return db.query(
            'UPDATE Attendance SET ClockOutTime = NOW() WHERE AttendanceID = ?',
            [attendanceId]
        );
    }

    static async getAllTasks() {
        return db.query(`
            SELECT nt.*, 
                   p.FirstName as PatientFirstName, p.LastName as PatientLastName,
                   s.FirstName as NurseFirstName, s.LastName as NurseLastName,
                   v.VisitType, v.AdmissionTime
            FROM Nurse_Task nt
            JOIN Visit v ON nt.VisitID = v.VisitID
            JOIN Patient p ON v.PatientID = p.PatientID
            JOIN Staff s ON nt.AssignedStaffID = s.StaffID
            ORDER BY nt.Status ASC, nt.TaskID DESC
        `);
    }

    static async getTasksByVisit(visitId) {
        return db.query(`
            SELECT nt.*, 
                   s.FirstName as NurseFirstName, s.LastName as NurseLastName
            FROM Nurse_Task nt
            JOIN Staff s ON nt.AssignedStaffID = s.StaffID
            WHERE nt.VisitID = ?
            ORDER BY nt.Status ASC, nt.TaskID DESC
        `, [visitId]);
    }

    static async updateTask(taskId, data) {
        const { description, status } = data;
        if (description && status) {
            return db.query(
                'UPDATE Nurse_Task SET Description = ?, Status = ? WHERE TaskID = ?',
                [description, status, taskId]
            );
        } else if (description) {
            return db.query(
                'UPDATE Nurse_Task SET Description = ? WHERE TaskID = ?',
                [description, taskId]
            );
        } else if (status) {
            return db.query(
                'UPDATE Nurse_Task SET Status = ? WHERE TaskID = ?',
                [status, taskId]
            );
        }
    }

    static async deleteTask(taskId) {
        return db.query('DELETE FROM Nurse_Task WHERE TaskID = ?', [taskId]);
    }

    static async getTaskById(taskId) {
        return db.query(`
            SELECT nt.*, 
                   p.FirstName as PatientFirstName, p.LastName as PatientLastName,
                   s.FirstName as NurseFirstName, s.LastName as NurseLastName,
                   v.VisitType, v.AdmissionTime
            FROM Nurse_Task nt
            JOIN Visit v ON nt.VisitID = v.VisitID
            JOIN Patient p ON v.PatientID = p.PatientID
            JOIN Staff s ON nt.AssignedStaffID = s.StaffID
            WHERE nt.TaskID = ?
        `, [taskId]);
    }
}

module.exports = Nursing;
