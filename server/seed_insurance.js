const db = require('./db');

const seedInsurance = async () => {
    try {
        console.log('Seeding insurance providers...');

        const providers = [
            'Blue Cross Blue Shield',
            'Aetna',
            'UnitedHealthcare',
            'Cigna',
            'Humana',
            'Kaiser Permanente'
        ];

        for (const provider of providers) {
            await db.query(
                'INSERT INTO Insurance_Provider (ProviderName) VALUES (?) ON DUPLICATE KEY UPDATE ProviderName = ProviderName',
                [provider]
            );
        }

        console.log('Insurance providers seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding insurance:', err);
        process.exit(1);
    }
};

seedInsurance();
