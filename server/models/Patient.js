const db = require('../db');

class Patient {
    static async findAll() {
        return db.query('SELECT * FROM Patient');
    }

    static async findById(id) {
        return db.query('SELECT * FROM Patient WHERE PatientID = ?', [id]);
    }

    static async create(data) {
        const { userId, firstName, lastName, dob } = data;
        return db.query(
            'INSERT INTO Patient (UserID, FirstName, LastName, DateOfBirth) VALUES (?, ?, ?, ?)',
            [userId || null, firstName, lastName, dob]
        );
    }

    static async update(id, data) {
        const { firstName, lastName, dob } = data;
        return db.query(
            'UPDATE Patient SET FirstName = ?, LastName = ?, DateOfBirth = ? WHERE PatientID = ?',
            [firstName, lastName, dob, id]
        );
    }

    static async findForDoctor(staffId) {
        return db.query(`
            SELECT DISTINCT p.* 
            FROM Patient p
            LEFT JOIN Appointment a ON p.PatientID = a.PatientID
            LEFT JOIN Visit v ON p.PatientID = v.PatientID
            LEFT JOIN Surgery_Request sr ON v.VisitID = sr.VisitID
            LEFT JOIN Diagnosis d ON v.VisitID = d.VisitID
            LEFT JOIN Doctor_Notes dn ON v.VisitID = dn.VisitID
            WHERE 
                (a.StaffID = ? AND a.Status != 'Cancelled')
                OR (sr.SurgeonStaffID = ?)
                OR (d.StaffID = ?)
                OR (dn.StaffID = ?)
        `, [staffId, staffId, staffId, staffId]);
    }
}

module.exports = Patient;
