const db = require('../db');

class Bed {
    static async findAvailable() {
        return db.query('SELECT * FROM Bed WHERE IsAvailable = TRUE');
    }

    static async assign(data) {
        const { patientId, bedId, visitId, treatmentPlanId, assignedNurseId } = data;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Check if treatment plan exists for this visit (Optional now)
            // const [treatmentPlans] = await connection.query(
            //     'SELECT PlanID FROM Treatment_Plan WHERE VisitID = ?',
            //     [visitId]
            // );

            // if (treatmentPlans.length === 0 && !treatmentPlanId) {
            //     throw new Error('Treatment plan is required before assigning a bed. Please create a treatment plan first.');
            // }

            // Create bed assignment
            const [assignmentResult] = await connection.query(
                'INSERT INTO Bed_Assignment (PatientID, BedID, VisitID) VALUES (?, ?, ?)',
                [patientId, bedId, visitId]
            );

            // Update Bed status
            await connection.query(
                'UPDATE Bed SET IsAvailable = FALSE WHERE BedID = ?',
                [bedId]
            );

            // Automatically create basic nurse tasks for inpatient care
            if (assignedNurseId) {
                const basicTasks = [
                    'Check vital signs every 4 hours',
                    'Administer prescribed medications',
                    'Monitor patient comfort and needs',
                    'Update patient care records'
                ];

                for (const taskDescription of basicTasks) {
                    await connection.query(
                        'INSERT INTO Nurse_Task (VisitID, AssignedStaffID, Description) VALUES (?, ?, ?)',
                        [visitId, assignedNurseId, taskDescription]
                    );
                }
            }

            await connection.commit();
            return assignmentResult.insertId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async assignWithTreatmentPlan(data) {
        const { patientId, bedId, visitId, staffId, treatmentPlanDetails, assignedNurseId } = data;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Create treatment plan if provided
            if (treatmentPlanDetails) {
                await connection.query(
                    'INSERT INTO Treatment_Plan (VisitID, StaffID, PlanDetails) VALUES (?, ?, ?)',
                    [visitId, staffId, treatmentPlanDetails]
                );
            }

            // Create bed assignment
            const [assignmentResult] = await connection.query(
                'INSERT INTO Bed_Assignment (PatientID, BedID, VisitID) VALUES (?, ?, ?)',
                [patientId, bedId, visitId]
            );

            // Update Bed status
            await connection.query(
                'UPDATE Bed SET IsAvailable = FALSE WHERE BedID = ?',
                [bedId]
            );

            // Automatically create basic nurse tasks
            if (assignedNurseId) {
                const basicTasks = [
                    'Check vital signs every 4 hours',
                    'Administer prescribed medications',
                    'Monitor patient comfort and needs',
                    'Update patient care records',
                    'Follow treatment plan instructions'
                ];

                for (const taskDescription of basicTasks) {
                    await connection.query(
                        'INSERT INTO Nurse_Task (VisitID, AssignedStaffID, Description) VALUES (?, ?, ?)',
                        [visitId, assignedNurseId, taskDescription]
                    );
                }
            }

            await connection.commit();
            return assignmentResult.insertId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = Bed;
