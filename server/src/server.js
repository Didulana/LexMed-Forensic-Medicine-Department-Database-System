const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // Added DB import
require('dotenv').config();
const patientRoutes = require('./routes/patientRoutes');
const caseRoutes = require('./routes/caseRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const mlefRoutes = require('./routes/mlefRoutes');
const pmrRoutes = require('./routes/pmrRoutes');
const investigationsRoutes = require('./routes/investigationsRoutes');
const legalRoutes = require('./routes/legalRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/mlef', mlefRoutes);
app.use('/api/pmr', pmrRoutes);
app.use('/api/investigations', investigationsRoutes);
app.use('/api/legal', legalRoutes);

// Start Server on Port 5005
const PORT = process.env.PORT || 5005;

app.listen(PORT, async () => {
    console.log(`LexMed Server running on http://localhost:${PORT}`);
    
    // Check if the database is actually connected
    try {
        await db.query('SELECT 1');
        console.log('✅ Successfully connected to the MySQL Database!');
    } catch (error) {
        console.error('❌ Database connection failed. Please ensure MySQL is running.', error.message);
    }
});