const db = require('../db');

class Appointment {
    static async findAll() {
        return db.query(`
            SELECT a.*, p.FirstName as PatientName, s.LastName as DoctorName 
            FROM Appointment a
            JOIN Patient p ON a.PatientID = p.PatientID
            JOIN Staff s ON a.StaffID = s.StaffID
        `);
    }

    static async create(data) {
        const { patientId, staffId, time, status } = data;
        return db.query(
            'INSERT INTO Appointment (PatientID, StaffID, AppointmentTime, Status) VALUES (?, ?, ?, ?)',
            [patientId, staffId, time, status || 'Scheduled']
        );
    }
    static async findByPatientId(patientId) {
        return db.query(`
            SELECT a.*, s.FirstName as DoctorFirstName, s.LastName as DoctorLastName 
            FROM Appointment a
            JOIN Staff s ON a.StaffID = s.StaffID
            WHERE a.PatientID = ?
            ORDER BY a.AppointmentTime DESC
        `, [patientId]);
    }
}

module.exports = Appointment;
