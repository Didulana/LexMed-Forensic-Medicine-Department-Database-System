const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/daily', reportController.getDailyCases);
router.get('/monthly', reportController.getMonthlyStats);
router.get('/pending', reportController.getPendingCases);
router.get('/evidence-anomalies', reportController.getEvidenceAnomalies);
router.get('/jmo-caseload', reportController.getJmoCaseload);
router.get('/turnaround-time', reportController.getTurnaroundTime);

module.exports = router;
