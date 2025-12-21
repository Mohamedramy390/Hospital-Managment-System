const db = require('../db');

class Lab {
    static async createOrder(data) {
        const { visitId, requestingStaffId, tests } = data;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [orderRes] = await connection.query(
                'INSERT INTO Lab_Order (VisitID, RequestingStaffID) VALUES (?, ?)',
                [visitId, requestingStaffId]
            );
            const orderId = orderRes.insertId;

            for (const test of tests) {
                await connection.query(
                    'INSERT INTO Lab_Test (OrderID, TestTypeID, Status) VALUES (?, ?, ?)',
                    [orderId, test.testTypeId, 'Pending']
                );
            }

            await connection.commit();
            return orderId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getOrdersByVisit(visitId) {
        return db.query(`
            SELECT lo.*, s.FirstName as DoctorName 
            FROM Lab_Order lo
            JOIN Staff s ON lo.RequestingStaffID = s.StaffID
            WHERE lo.VisitID = ?
        `, [visitId]);
    }

    static async getTestsByOrder(orderId) {
        return db.query(`
            SELECT lt.*, tt.TestName, tt.ReferenceRange
            FROM Lab_Test lt
            JOIN Test_Type tt ON lt.TestTypeID = tt.TestTypeID
            WHERE lt.OrderID = ?
        `, [orderId]);
    }

    static async addResult(data) {
        const { testId, resultValue, deviceId, files } = data;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [resultRes] = await connection.query(
                'INSERT INTO Lab_Result (TestID, ResultValue, DeviceID) VALUES (?, ?, ?)',
                [testId, resultValue, deviceId || null]
            );
            const resultId = resultRes.insertId;

            if (files) {
                for (const file of files) {
                    await connection.query(
                        'INSERT INTO Lab_Result_File (ResultID, FileName, FileURL) VALUES (?, ?, ?)',
                        [resultId, file.originalname, file.path]
                    );
                }
            }

            await connection.query(
                'UPDATE Lab_Test SET Status = "Completed" WHERE TestID = ?',
                [testId]
            );

            await connection.commit();
            return resultId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getTestTypes() {
        return db.query('SELECT * FROM Test_Type');
    }

    static async getPendingTests() {
        return db.query(`
            SELECT lt.TestID, lt.Status, tt.TestName,
                   lo.OrderID, lo.OrderDate,
                   v.VisitID, p.PatientID, p.FirstName, p.LastName
            FROM Lab_Test lt
            JOIN Test_Type tt ON lt.TestTypeID = tt.TestTypeID
            JOIN Lab_Order lo ON lt.OrderID = lo.OrderID
            JOIN Visit v ON lo.VisitID = v.VisitID
            JOIN Patient p ON v.PatientID = p.PatientID
            WHERE lt.Status = 'Pending'
            ORDER BY lo.OrderDate DESC
        `);
    }

    static async getDevices() {
        return db.query('SELECT * FROM Lab_Device');
    }
}

module.exports = Lab;
