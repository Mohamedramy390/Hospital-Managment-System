const db = require('../db');

class Pharmacy {
    static async getMedicine() {
        return db.query('SELECT * FROM Medicine ORDER BY Name');
    }

    static async getInventory() {
        return db.query(`
            SELECT i.*, m.Name as MedicineName, m.MedicineID, mb.ExpiryDate, mb.BatchID
            FROM Inventory i
            JOIN Medicine_Batch mb ON i.BatchID = mb.BatchID
            JOIN Medicine m ON mb.MedicineID = m.MedicineID
            ORDER BY m.Name, mb.ExpiryDate
        `);
    }

    static async getInventoryWithWarnings(lowStockThreshold = 10) {
        return db.query(`
            SELECT 
                m.MedicineID,
                m.Name as MedicineName,
                SUM(i.Quantity) as TotalQuantity,
                COUNT(DISTINCT mb.BatchID) as BatchCount,
                MIN(mb.ExpiryDate) as NearestExpiry,
                CASE 
                    WHEN SUM(i.Quantity) <= ? THEN 'LOW'
                    WHEN SUM(i.Quantity) <= ? * 2 THEN 'MEDIUM'
                    ELSE 'GOOD'
                END as StockStatus
            FROM Medicine m
            LEFT JOIN Medicine_Batch mb ON m.MedicineID = mb.MedicineID
            LEFT JOIN Inventory i ON mb.BatchID = i.BatchID
            GROUP BY m.MedicineID, m.Name
            ORDER BY StockStatus DESC, TotalQuantity ASC
        `, [lowStockThreshold, lowStockThreshold]);
    }

    static async getLowStockMedicines(threshold = 10) {
        return db.query(`
            SELECT 
                m.MedicineID,
                m.Name as MedicineName,
                SUM(i.Quantity) as TotalQuantity
            FROM Medicine m
            LEFT JOIN Medicine_Batch mb ON m.MedicineID = mb.MedicineID
            LEFT JOIN Inventory i ON mb.BatchID = i.BatchID
            GROUP BY m.MedicineID, m.Name
            HAVING SUM(COALESCE(i.Quantity, 0)) <= ?
            ORDER BY TotalQuantity ASC
        `, [threshold]);
    }

    static async addMedicine(name) {
        return db.query('INSERT INTO Medicine (Name) VALUES (?)', [name]);
    }

    static async addBatch(data) {
        const { medicineId, expiryDate, quantity } = data;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Create batch
            const [batchRes] = await connection.query(
                'INSERT INTO Medicine_Batch (MedicineID, ExpiryDate) VALUES (?, ?)',
                [medicineId, expiryDate]
            );
            const batchId = batchRes.insertId;

            // Create inventory entry
            await connection.query(
                'INSERT INTO Inventory (BatchID, Quantity) VALUES (?, ?)',
                [batchId, quantity]
            );

            await connection.commit();
            return batchId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async updateInventoryQuantity(inventoryId, quantity) {
        return db.query(
            'UPDATE Inventory SET Quantity = ? WHERE InventoryID = ?',
            [quantity, inventoryId]
        );
    }

    static async dispenseMedicine(data) {
        const { prescriptionItemId, quantity } = data;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Find oldest batch (FIFO)
            const [batches] = await connection.query(`
                SELECT i.* 
                FROM Inventory i
                JOIN Medicine_Batch mb ON i.BatchID = mb.BatchID
                JOIN Prescription_Item pi ON mb.MedicineID = pi.MedicineID
                WHERE pi.PrescriptionItemID = ? AND i.Quantity >= ?
                ORDER BY mb.ExpiryDate ASC LIMIT 1
            `, [prescriptionItemId, quantity]);

            if (batches.length === 0) throw new Error('Insufficient stock');

            await connection.query(
                'UPDATE Inventory SET Quantity = Quantity - ? WHERE InventoryID = ?',
                [quantity, batches[0].InventoryID]
            );

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getExpiringMedicines(daysAhead = 30) {
        return db.query(`
            SELECT 
                m.Name as MedicineName,
                mb.ExpiryDate,
                i.Quantity,
                DATEDIFF(mb.ExpiryDate, CURDATE()) as DaysUntilExpiry
            FROM Medicine_Batch mb
            JOIN Medicine m ON mb.MedicineID = m.MedicineID
            JOIN Inventory i ON mb.BatchID = i.BatchID
            WHERE mb.ExpiryDate <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
                AND i.Quantity > 0
            ORDER BY mb.ExpiryDate ASC
        `, [daysAhead]);
    }
}

module.exports = Pharmacy;
