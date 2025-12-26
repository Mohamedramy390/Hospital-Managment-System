const db = require('../db');

class AuditLog {
    static async create(userId, action) {
        try {
            const [result] = await db.query(
                'INSERT INTO Audit_Log (UserID, ActionDescription) VALUES (?, ?)',
                [userId, action]
            );
            return result.insertId;
        } catch (error) {
            console.error('Audit Log Error:', error);
            // Don't throw, we don't want to break the app if logging fails, but maybe log to file
        }
    }

    static async getAll() {
        const [rows] = await db.query(`
            SELECT 
                a.LogID, 
                a.ActionDescription, 
                a.Timestamp, 
                u.Username, 
                u.Role 
            FROM Audit_Log a
            LEFT JOIN User u ON a.UserID = u.UserID
            ORDER BY a.Timestamp DESC;
        `);
        return rows;
    }
}

module.exports = AuditLog;
