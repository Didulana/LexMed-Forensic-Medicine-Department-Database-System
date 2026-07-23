const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({ origin: true, credentials: true })); // Adjust origin for prod
app.use(express.json());
app.use(cookieParser());

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per `window`
  message: 'Too many requests from this IP, please try again after a minute',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Routes
const authRoutes = require('./routes/authRoutes');
const caseRoutes = require('./routes/caseRoutes');
const clinicalRoutes = require('./routes/clinicalRoutes');
const evidenceRoutes = require('./routes/evidenceRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/auth', authRoutes);
app.use('/cases', caseRoutes);
app.use('/clinical', clinicalRoutes); // /clinical/clinical-exams, /clinical/postmortems
app.use('/evidence', evidenceRoutes); 
app.use('/admin', adminRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
