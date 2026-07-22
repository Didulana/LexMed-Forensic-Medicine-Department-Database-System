const express = require('express');
const router = express.Router();
const mlefController = require('../controllers/mlefController');

// POST /api/mlef/submit
router.post('/submit', mlefController.submitMLEF);

module.exports = router;
