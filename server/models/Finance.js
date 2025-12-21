const db = require('../db');

class Finance {
    static async generateInvoice(visitId) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Calculate Bed Charges
            const [beds] = await connection.query(`
                SELECT ba.*, timestampdiff(HOUR, ba.StartTime, ifnull(ba.EndTime, now())) as Hours
                FROM Bed_Assignment ba
                WHERE ba.VisitID = ?
            `, [visitId]);

            // Assume $50 per hour for simplicity
            let totalAmount = 0;
            const items = [];

            for (const bed of beds) {
                const amount = bed.Hours * 50;
                totalAmount += amount;
                items.push({ description: `Bed Charge (${bed.Hours} hours)`, amount });
            }

            // 2. Calculate Lab Charges
            const [labs] = await connection.query(`
                SELECT lt.*, tt.TestName 
                FROM Lab_Test lt
                JOIN Lab_Order lo ON lt.OrderID = lo.OrderID
                JOIN Test_Type tt ON lt.TestTypeID = tt.TestTypeID
                WHERE lo.VisitID = ? AND lt.Status = 'Completed'
            `, [visitId]);

            // Assume $100 per test
            for (const lab of labs) {
                const amount = 100;
                totalAmount += amount;
                items.push({ description: `Lab Test: ${lab.TestName}`, amount });
            }

            // 3. Create Invoice
            const [invoiceRes] = await connection.query(
                'INSERT INTO Invoice (VisitID, TotalAmount, Status) VALUES (?, ?, ?)',
                [visitId, totalAmount, 'Pending']
            );
            const invoiceId = invoiceRes.insertId;

            // 4. Create Invoice Items
            for (const item of items) {
                await connection.query(
                    'INSERT INTO Invoice_Item (InvoiceID, Description, Amount) VALUES (?, ?, ?)',
                    [invoiceId, item.description, item.amount]
                );
            }

            await connection.commit();
            return invoiceId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getInvoice(invoiceId) {
        const [invoice] = await db.query('SELECT * FROM Invoice WHERE InvoiceID = ?', [invoiceId]);
        const [items] = await db.query('SELECT * FROM Invoice_Item WHERE InvoiceID = ?', [invoiceId]);
        return { ...invoice[0], items };
    }

    static async getInvoicesByVisit(visitId) {
        return db.query('SELECT * FROM Invoice WHERE VisitID = ?', [visitId]);
    }

    static async getAll() {
        return db.query(`
            SELECT i.*, p.FirstName, p.LastName,
                   COALESCE((SELECT SUM(AmountPaid) FROM Payment WHERE InvoiceID = i.InvoiceID), 0) as TotalPaid
            FROM Invoice i
            JOIN Visit v ON i.VisitID = v.VisitID
            JOIN Patient p ON v.PatientID = p.PatientID
        `);
    }

    static async addPayment(data) {
        const { invoiceId, amount, method } = data;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            await connection.query(
                'INSERT INTO Payment (InvoiceID, AmountPaid, PaymentMethod) VALUES (?, ?, ?)',
                [invoiceId, amount, method]
            );

            // Check if fully paid
            const [invoice] = await connection.query('SELECT TotalAmount FROM Invoice WHERE InvoiceID = ?', [invoiceId]);
            const [payments] = await connection.query('SELECT SUM(AmountPaid) as TotalPaid FROM Payment WHERE InvoiceID = ?', [invoiceId]);

            if (payments[0].TotalPaid >= invoice[0].TotalAmount) {
                await connection.query('UPDATE Invoice SET Status = "Paid" WHERE InvoiceID = ?', [invoiceId]);
            } else {
                await connection.query('UPDATE Invoice SET Status = "Partially Paid" WHERE InvoiceID = ?', [invoiceId]);
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = Finance;
