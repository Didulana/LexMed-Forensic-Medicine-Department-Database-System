const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// POST request to /api/patients/register
router.post('/register', patientController.registerPatient);

module.exports = router;