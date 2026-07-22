const express = require('express');
const router = express.Router();
const legalController = require('../controllers/legalController');

router.post('/evidence', legalController.addEvidence);
router.post('/custody', legalController.addChainOfCustody);
router.post('/summons', legalController.addCourtSummons);
router.post('/document', legalController.addLegalDocument);

module.exports = router;
