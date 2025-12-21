const db = require('../db');

class Visit {
    static async create(data) {
        const { patientId, type } = data;
        return db.query(
            'INSERT INTO Visit (PatientID, VisitType) VALUES (?, ?)',
            [patientId, type]
        );
    }

    static async findActiveByPatient(patientId) {
        return db.query(`
            SELECT v.*, ba.BedID 
            FROM Visit v
            LEFT JOIN Bed_Assignment ba ON v.VisitID = ba.VisitID
            WHERE v.PatientID = ? 
            ORDER BY v.AdmissionTime DESC 
            LIMIT 1
        `, [patientId]);
    }
}

module.exports = Visit;
