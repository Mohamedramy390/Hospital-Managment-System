const db = require('../db');

class Surgery {
    static async createRequest(data) {
        const { visitId, requestingStaffId } = data;
        return db.query(
            'INSERT INTO Surgery_Request (VisitID, RequestingStaffID) VALUES (?, ?)',
            [visitId, requestingStaffId]
        );
    }

    static async assignSurgeon(requestId, surgeonStaffId) {
        return db.query(
            'UPDATE Surgery_Request SET SurgeonStaffID = ? WHERE RequestID = ?',
            [surgeonStaffId, requestId]
        );
    }

    static async schedule(data) {
        const { requestId, opRoomId, scheduledTime, nurseStaffId } = data;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            await connection.query(
                'UPDATE Surgery_Request SET OpRoomID = ?, Status = "In Progress", ScheduledTime = ? WHERE RequestID = ?',
                [opRoomId, scheduledTime, requestId]
            );

            if (nurseStaffId) {
                await connection.query(
                    'INSERT INTO Operation_Assignment (RequestID, StaffID, Role) VALUES (?, ?, ?)',
                    [requestId, nurseStaffId, 'Nurse']
                );
            }

            await connection.query(
                'UPDATE Operation_Room SET IsAvailable = FALSE WHERE OpRoomID = ?',
                [opRoomId]
            );

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async completeSurgery(data) {
        const { requestId, reportText } = data;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            await connection.query(
                'INSERT INTO Surgery_Report (RequestID, ReportText) VALUES (?, ?)',
                [requestId, reportText]
            );

            // Free up the operating room and mark as completed
            const [reqRows] = await connection.query('SELECT OpRoomID FROM Surgery_Request WHERE RequestID = ?', [requestId]);
            const opRoomId = reqRows[0]?.OpRoomID || null;

            await connection.query(
                'UPDATE Surgery_Request SET Status = "Completed" WHERE RequestID = ?',
                [requestId]
            );

            if (opRoomId) {
                await connection.query('UPDATE Operation_Room SET IsAvailable = TRUE WHERE OpRoomID = ?', [opRoomId]);
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getRequestsByVisit(visitId) {
        return db.query(
            `SELECT sr.*, s.FirstName AS RequestingDoctorFirstName, s.LastName AS RequestingDoctorLastName
             FROM Surgery_Request sr
             JOIN Staff s ON sr.RequestingStaffID = s.StaffID
             WHERE sr.VisitID = ?`,
            [visitId]
        );
    }

    static async getRequestById(requestId) {
        return db.query('SELECT * FROM Surgery_Request WHERE RequestID = ?', [requestId]);
    }

    static async getAvailableOpRooms() {
        return db.query('SELECT * FROM Operation_Room WHERE IsAvailable = TRUE');
    }

    static async getAssignedToStaff(staffId) {
        return db.query(`
            SELECT sr.*, p.FirstName, p.LastName, p.PatientID
            FROM Surgery_Request sr
            JOIN Visit v ON sr.VisitID = v.VisitID
            JOIN Patient p ON v.PatientID = p.PatientID
            WHERE sr.SurgeonStaffID = ?
        `, [staffId]);
    }

    static async getPendingRequests() {
        return db.query(`
            SELECT sr.*, p.FirstName AS PatientFirstName, p.LastName AS PatientLastName,
                   s.FirstName AS DocFirstName, s.LastName AS DocLastName
            FROM Surgery_Request sr
            JOIN Visit v ON sr.VisitID = v.VisitID
            JOIN Patient p ON v.PatientID = p.PatientID
            JOIN Staff s ON sr.RequestingStaffID = s.StaffID
            WHERE sr.Status = 'Pending'
        `);
    }

    static async getSurgeryReport(requestId) {
        return db.query(`
            SELECT sr.*, req.VisitID, req.Status as SurgeryStatus, 
                   p.FirstName, p.LastName, p.PatientID,
                   s.FirstName as SurgeonFirstName, s.LastName as SurgeonLastName
            FROM Surgery_Report sr
            JOIN Surgery_Request req ON sr.RequestID = req.RequestID
            JOIN Visit v ON req.VisitID = v.VisitID
            JOIN Patient p ON v.PatientID = p.PatientID
            LEFT JOIN Staff s ON req.SurgeonStaffID = s.StaffID
            WHERE sr.RequestID = ?
        `, [requestId]);
    }

    static async getAllSurgeryReports() {
        return db.query(`
            SELECT sr.*, req.VisitID, req.Status as SurgeryStatus, req.ScheduledTime,
                   p.FirstName, p.LastName, p.PatientID,
                   s.FirstName as SurgeonFirstName, s.LastName as SurgeonLastName
            FROM Surgery_Report sr
            JOIN Surgery_Request req ON sr.RequestID = req.RequestID
            JOIN Visit v ON req.VisitID = v.VisitID
            JOIN Patient p ON v.PatientID = p.PatientID
            LEFT JOIN Staff s ON req.SurgeonStaffID = s.StaffID
            ORDER BY sr.ReportID DESC
        `);
    }

    static async updateSurgeryReport(requestId, reportText) {
        return db.query(
            'UPDATE Surgery_Report SET ReportText = ? WHERE RequestID = ?',
            [reportText, requestId]
        );
    }

    static async getSurgeryReportsByPatient(patientId) {
        return db.query(`
            SELECT sr.*, req.VisitID, req.Status as SurgeryStatus, req.ScheduledTime,
                   s.FirstName as SurgeonFirstName, s.LastName as SurgeonLastName,
                   v.AdmissionTime, v.VisitType
            FROM Surgery_Report sr
            JOIN Surgery_Request req ON sr.RequestID = req.RequestID
            JOIN Visit v ON req.VisitID = v.VisitID
            LEFT JOIN Staff s ON req.SurgeonStaffID = s.StaffID
            WHERE v.PatientID = ?
            ORDER BY sr.ReportID DESC
        `, [patientId]);
    }
}

module.exports = Surgery;
