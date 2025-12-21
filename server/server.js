const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('Hospital Management System API is running');
});

// Setup Database Route (One-time use)
app.get('/api/setup-db', async (req, res) => {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Connect without database selected to create it
        const connection = await require('mysql2/promise').createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });

        await connection.query(schema);
        await connection.end();

        res.send('Database schema initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        res.status(500).send('Error initializing database: ' + error.message);
    }
});

const authRoutes = require('./routes/authRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes');
const clinicalRoutes = require('./routes/clinicalRoutes');
const orderRoutes = require('./routes/orderRoutes');
const nursingRoutes = require('./routes/nursingRoutes');
const financeRoutes = require('./routes/financeRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const patientPortalRoutes = require('./routes/patientPortalRoutes');
const surgeryRoutes = require('./routes/surgeryRoutes');
const insuranceRoutes = require('./routes/insuranceRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/clinical', clinicalRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/nursing', nursingRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/portal', patientPortalRoutes);
app.use('/api/surgery', surgeryRoutes);
app.use('/api/insurance', insuranceRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
