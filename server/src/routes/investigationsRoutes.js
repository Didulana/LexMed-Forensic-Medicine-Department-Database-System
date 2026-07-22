const express = require('express');
const router = express.Router();
const investigationsController = require('../controllers/investigationsController');

router.post('/radiology', investigationsController.submitRadiology);
router.post('/toxicology', investigationsController.submitToxicology);

module.exports = router;
