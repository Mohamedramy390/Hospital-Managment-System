const db = require('../db');

class Insurance {
    static async getProviders() {
        return db.query('SELECT * FROM Insurance_Provider ORDER BY ProviderName');
    }

    static async addProvider(name) {
        return db.query('INSERT INTO Insurance_Provider (ProviderName) VALUES (?)', [name]);
    }

    static async createClaim(data) {
        const { invoiceId, providerId, claimAmount } = data;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Create claim
            const [claimRes] = await connection.query(
                'INSERT INTO Insurance_Claim (InvoiceID, ProviderID, ClaimAmount) VALUES (?, ?, ?)',
                [invoiceId, providerId, claimAmount]
            );
            const claimId = claimRes.insertId;

            // Create initial status
            await connection.query(
                'INSERT INTO Claim_Status (ClaimID, Status, Notes) VALUES (?, ?, ?)',
                [claimId, 'Pending', 'Claim submitted']
            );

            await connection.commit();
            return claimId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async updateClaimStatus(data) {
        const { claimId, status, notes } = data;
        return db.query(
            'INSERT INTO Claim_Status (ClaimID, Status, Notes) VALUES (?, ?, ?)',
            [claimId, status, notes]
        );
    }

    static async getClaimHistory(claimId) {
        return db.query(`
            SELECT cs.*, ic.ClaimAmount, ip.ProviderName, i.TotalAmount
            FROM Claim_Status cs
            JOIN Insurance_Claim ic ON cs.ClaimID = ic.ClaimID
            JOIN Insurance_Provider ip ON ic.ProviderID = ip.ProviderID
            JOIN Invoice i ON ic.InvoiceID = i.InvoiceID
            WHERE cs.ClaimID = ?
            ORDER BY cs.Date DESC
        `, [claimId]);
    }

    static async getAllClaims() {
        return db.query(`
            SELECT 
                ic.*,
                ip.ProviderName,
                i.TotalAmount as InvoiceAmount,
                i.Status as InvoiceStatus,
                (SELECT Status FROM Claim_Status WHERE ClaimID = ic.ClaimID ORDER BY Date DESC LIMIT 1) as CurrentStatus,
                (SELECT Date FROM Claim_Status WHERE ClaimID = ic.ClaimID ORDER BY Date DESC LIMIT 1) as LastUpdated,
                p.FirstName,
                p.LastName,
                v.VisitID,
                v.AdmissionTime
            FROM Insurance_Claim ic
            JOIN Insurance_Provider ip ON ic.ProviderID = ip.ProviderID
            JOIN Invoice i ON ic.InvoiceID = i.InvoiceID
            JOIN Visit v ON i.VisitID = v.VisitID
            JOIN Patient p ON v.PatientID = p.PatientID
            ORDER BY ic.ClaimID DESC
        `);
    }

    static async getClaimsByPatient(patientId) {
        return db.query(`
            SELECT 
                ic.*,
                ip.ProviderName,
                i.TotalAmount as InvoiceAmount,
                i.Status as InvoiceStatus,
                (SELECT Status FROM Claim_Status WHERE ClaimID = ic.ClaimID ORDER BY Date DESC LIMIT 1) as CurrentStatus,
                (SELECT Date FROM Claim_Status WHERE ClaimID = ic.ClaimID ORDER BY Date DESC LIMIT 1) as LastUpdated,
                v.AdmissionTime,
                v.VisitType
            FROM Insurance_Claim ic
            JOIN Insurance_Provider ip ON ic.ProviderID = ip.ProviderID
            JOIN Invoice i ON ic.InvoiceID = i.InvoiceID
            JOIN Visit v ON i.VisitID = v.VisitID
            WHERE v.PatientID = ?
            ORDER BY ic.ClaimID DESC
        `, [patientId]);
    }

    static async getClaimDetails(claimId) {
        return db.query(`
            SELECT 
                ic.*,
                ip.ProviderName,
                i.TotalAmount as InvoiceAmount,
                i.Status as InvoiceStatus,
                p.FirstName,
                p.LastName,
                v.VisitID,
                v.AdmissionTime,
                v.VisitType
            FROM Insurance_Claim ic
            JOIN Insurance_Provider ip ON ic.ProviderID = ip.ProviderID
            JOIN Invoice i ON ic.InvoiceID = i.InvoiceID
            JOIN Visit v ON i.VisitID = v.VisitID
            JOIN Patient p ON v.PatientID = p.PatientID
            WHERE ic.ClaimID = ?
        `, [claimId]);
    }

    static async getPendingClaims() {
        return db.query(`
            SELECT 
                ic.*,
                ip.ProviderName,
                i.TotalAmount as InvoiceAmount,
                p.FirstName,
                p.LastName,
                (SELECT Status FROM Claim_Status WHERE ClaimID = ic.ClaimID ORDER BY Date DESC LIMIT 1) as CurrentStatus
            FROM Insurance_Claim ic
            JOIN Insurance_Provider ip ON ic.ProviderID = ip.ProviderID
            JOIN Invoice i ON ic.InvoiceID = i.InvoiceID
            JOIN Visit v ON i.VisitID = v.VisitID
            JOIN Patient p ON v.PatientID = p.PatientID
            WHERE (SELECT Status FROM Claim_Status WHERE ClaimID = ic.ClaimID ORDER BY Date DESC LIMIT 1) 
                IN ('Pending', 'Submitted', 'Under Review')
            ORDER BY ic.ClaimID DESC
        `);
    }

    static async processApprovedClaim(data) {
        const { claimId, approvedAmount, notes } = data;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Get claim details
            const [claimDetails] = await connection.query(`
                SELECT ic.InvoiceID, ic.ClaimAmount, i.TotalAmount
                FROM Insurance_Claim ic
                JOIN Invoice i ON ic.InvoiceID = i.InvoiceID
                WHERE ic.ClaimID = ?
            `, [claimId]);

            if (!claimDetails || claimDetails.length === 0) {
                throw new Error('Claim not found');
            }

            const { InvoiceID, ClaimAmount, TotalAmount } = claimDetails[0];
            const paymentAmount = approvedAmount || ClaimAmount;

            // Update claim status to Approved
            await connection.query(
                'INSERT INTO Claim_Status (ClaimID, Status, Notes) VALUES (?, ?, ?)',
                [claimId, 'Approved', notes || `Claim approved for $${paymentAmount}`]
            );

            // Create payment record from insurance
            await connection.query(
                'INSERT INTO Payment (InvoiceID, AmountPaid, PaymentMethod) VALUES (?, ?, ?)',
                [InvoiceID, paymentAmount, 'Insurance']
            );

            // Check if invoice is fully paid
            const [payments] = await connection.query(
                'SELECT SUM(AmountPaid) as TotalPaid FROM Payment WHERE InvoiceID = ?',
                [InvoiceID]
            );

            const totalPaid = payments[0].TotalPaid || 0;

            if (totalPaid >= TotalAmount) {
                await connection.query(
                    'UPDATE Invoice SET Status = "Paid" WHERE InvoiceID = ?',
                    [InvoiceID]
                );
            } else {
                await connection.query(
                    'UPDATE Invoice SET Status = "Partially Paid" WHERE InvoiceID = ?',
                    [InvoiceID]
                );
            }

            await connection.commit();
            return { success: true, totalPaid, remainingBalance: TotalAmount - totalPaid };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = Insurance;
