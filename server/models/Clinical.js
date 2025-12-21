const db = require('../db');

class Clinical {
    static async addDiagnosis(data) {
        const { visitId, staffId, notes } = data;
        return db.query(
            'INSERT INTO Diagnosis (VisitID, StaffID, DiagnosisNotes) VALUES (?, ?, ?)',
            [visitId, staffId, notes]
        );
    }

    static async addDiagnosisWithNotes(data) {
        const { visitId, staffId, diagnosisNotes, doctorNotes } = data;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Add diagnosis
            await connection.query(
                'INSERT INTO Diagnosis (VisitID, StaffID, DiagnosisNotes) VALUES (?, ?, ?)',
                [visitId, staffId, diagnosisNotes]
            );

            // Add doctor notes if provided
            if (doctorNotes) {
                await connection.query(
                    'INSERT INTO Doctor_Notes (VisitID, StaffID, NoteText) VALUES (?, ?, ?)',
                    [visitId, staffId, doctorNotes]
                );
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getHistory(patientId) {
        return db.query(`
            SELECT d.*, v.AdmissionTime
            FROM Diagnosis d
            JOIN Visit v ON d.VisitID = v.VisitID
            WHERE v.PatientID = ?
            ORDER BY d.Date DESC
        `, [patientId]);
    }

    static async addTreatmentPlan(data) {
        const { visitId, staffId, details } = data;
        return db.query(
            'INSERT INTO Treatment_Plan (VisitID, StaffID, PlanDetails) VALUES (?, ?, ?)',
            [visitId, staffId, details]
        );
    }

    static async addTreatmentPlanWithTasks(data) {
        const { visitId, staffId, details, assignedNurseId, customTasks } = data;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Create treatment plan
            await connection.query(
                'INSERT INTO Treatment_Plan (VisitID, StaffID, PlanDetails) VALUES (?, ?, ?)',
                [visitId, staffId, details]
            );

            // Create nurse tasks if nurse is assigned
            if (assignedNurseId) {
                // Default tasks based on treatment plan
                const defaultTasks = [
                    'Monitor patient response to treatment',
                    'Document treatment progress',
                    'Report any adverse reactions immediately'
                ];

                // Add custom tasks if provided
                const allTasks = customTasks && customTasks.length > 0
                    ? [...defaultTasks, ...customTasks]
                    : defaultTasks;

                for (const taskDescription of allTasks) {
                    await connection.query(
                        'INSERT INTO Nurse_Task (VisitID, AssignedStaffID, Description) VALUES (?, ?, ?)',
                        [visitId, assignedNurseId, taskDescription]
                    );
                }
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async addDoctorNote(data) {
        const { visitId, staffId, noteText } = data;
        return db.query(
            'INSERT INTO Doctor_Notes (VisitID, StaffID, NoteText) VALUES (?, ?, ?)',
            [visitId, staffId, noteText]
        );
    }

    static async getDoctorNotesByVisit(visitId) {
        return db.query(`
            SELECT dn.*, s.FirstName, s.LastName
            FROM Doctor_Notes dn
            JOIN Staff s ON dn.StaffID = s.StaffID
            WHERE dn.VisitID = ?
            ORDER BY dn.Date DESC
        `, [visitId]);
    }

    static async getDoctorNotesByPatient(patientId) {
        return db.query(`
            SELECT dn.*, s.FirstName, s.LastName, v.AdmissionTime, v.VisitType
            FROM Doctor_Notes dn
            JOIN Staff s ON dn.StaffID = s.StaffID
            JOIN Visit v ON dn.VisitID = v.VisitID
            WHERE v.PatientID = ?
            ORDER BY dn.Date DESC
        `, [patientId]);
    }

    static async updateDoctorNote(noteId, noteText) {
        return db.query(
            'UPDATE Doctor_Notes SET NoteText = ? WHERE NoteID = ?',
            [noteText, noteId]
        );
    }

    static async deleteDoctorNote(noteId) {
        return db.query('DELETE FROM Doctor_Notes WHERE NoteID = ?', [noteId]);
    }

    static async getTreatmentPlansByVisit(visitId) {
        return db.query(`
            SELECT tp.*, s.FirstName, s.LastName
            FROM Treatment_Plan tp
            JOIN Staff s ON tp.StaffID = s.StaffID
            WHERE tp.VisitID = ?
            ORDER BY tp.Date DESC
        `, [visitId]);
    }

    static async getTreatmentPlansByPatient(patientId) {
        return db.query(`
            SELECT tp.*, s.FirstName, s.LastName, v.AdmissionTime, v.VisitType
            FROM Treatment_Plan tp
            JOIN Staff s ON tp.StaffID = s.StaffID
            JOIN Visit v ON tp.VisitID = v.VisitID
            WHERE v.PatientID = ?
            ORDER BY tp.Date DESC
        `, [patientId]);
    }
}

module.exports = Clinical;
