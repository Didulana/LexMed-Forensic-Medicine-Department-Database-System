const express = require('express');
const router = express.Router();
const pmrController = require('../controllers/pmrController');

// POST /api/pmr/submit
router.post('/submit', pmrController.submitPMR);

module.exports = router;
