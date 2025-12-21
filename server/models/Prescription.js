const db = require('../db');

class Prescription {
    static async create(data) {
        const { visitId, staffId, items } = data;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [prescRes] = await connection.query(
                'INSERT INTO Prescription (VisitID, StaffID) VALUES (?, ?)',
                [visitId, staffId]
            );
            const prescriptionId = prescRes.insertId;

            for (const item of items) {
                let medicineId = item.medicineId;

                // If custom medicine name is provided, create or find it
                if (item.customMedicineName && !medicineId) {
                    // Check if medicine already exists
                    const [existing] = await connection.query(
                        'SELECT MedicineID FROM Medicine WHERE Name = ?',
                        [item.customMedicineName]
                    );

                    if (existing.length > 0) {
                        medicineId = existing[0].MedicineID;
                    } else {
                        // Create new medicine
                        const [newMed] = await connection.query(
                            'INSERT INTO Medicine (Name) VALUES (?)',
                            [item.customMedicineName]
                        );
                        medicineId = newMed.insertId;
                    }
                }

                await connection.query(
                    'INSERT INTO Prescription_Item (PrescriptionID, MedicineID, Dosage) VALUES (?, ?, ?)',
                    [prescriptionId, medicineId, item.dosage]
                );
            }

            await connection.commit();
            return prescriptionId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getByVisit(visitId) {
        return db.query(`
            SELECT p.*, s.FirstName as DoctorName
            FROM Prescription p
            JOIN Staff s ON p.StaffID = s.StaffID
            WHERE p.VisitID = ?
        `, [visitId]);
    }

    static async getItems(prescriptionId) {
        return db.query(`
            SELECT pi.*, m.Name as MedicineName
            FROM Prescription_Item pi
            JOIN Medicine m ON pi.MedicineID = m.MedicineID
            WHERE pi.PrescriptionID = ?
        `, [prescriptionId]);
    }
}

module.exports = Prescription;
