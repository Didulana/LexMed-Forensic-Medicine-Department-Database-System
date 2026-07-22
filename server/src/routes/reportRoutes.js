const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/daily', reportController.getDailyCases);
router.get('/monthly', reportController.getMonthlyStats);
router.get('/pending', reportController.getPendingCases);

module.exports = router;
