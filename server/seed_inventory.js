const db = require('./db');

const seedInventory = async () => {
    try {
        console.log('Seeding pharmacy inventory...');

        // Get some medicines
        const [medicines] = await db.query('SELECT MedicineID FROM Medicine LIMIT 5');

        if (medicines.length === 0) {
            console.log('No medicines found. Please run seed_data.js first.');
            process.exit(1);
        }

        for (const med of medicines) {
            // Create 2 batches per medicine
            for (let i = 0; i < 2; i++) {
                // Random expiry date between 30 days and 2 years from now
                const daysAhead = Math.floor(Math.random() * 700) + 30;
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + daysAhead);

                const [batchRes] = await db.query(
                    'INSERT INTO Medicine_Batch (MedicineID, ExpiryDate) VALUES (?, ?)',
                    [med.MedicineID, expiryDate.toISOString().split('T')[0]]
                );

                // Random quantity between 5 and 100
                const quantity = Math.floor(Math.random() * 96) + 5;

                await db.query(
                    'INSERT INTO Inventory (BatchID, Quantity) VALUES (?, ?)',
                    [batchRes.insertId, quantity]
                );
            }
        }

        console.log('Pharmacy inventory seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding inventory:', err);
        process.exit(1);
    }
};

seedInventory();
