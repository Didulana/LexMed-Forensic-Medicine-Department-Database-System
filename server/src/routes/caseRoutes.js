const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');

router.get('/officers', caseController.getOfficers);
router.post('/create', caseController.createCase);
router.get('/pending', caseController.getPendingCases);

module.exports = router;