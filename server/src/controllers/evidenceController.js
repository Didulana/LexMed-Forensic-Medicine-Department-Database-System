const evidenceRepo = require('../repositories/evidenceRepository');
const { sanitizeObject } = require('../utils/sanitizer');

const getEvidenceByCase = async (req, res) => {
  try {
    const caseId = req.params.case_id;
    const evidence = await evidenceRepo.getEvidenceByCase(req.dbConn, caseId);
    res.json(evidence);
  } catch (error) {
    console.error('Error fetching evidence:', error);
    res.status(500).json({ error: 'Failed to fetch evidence' });
  }
};

const createEvidenceItem = async (req, res) => {
  try {
    const sanitizedBody = sanitizeObject(req.body, ['description']);
    const itemId = await evidenceRepo.createEvidenceItem(req.dbConn, sanitizedBody);
    res.status(201).json({ message: 'Evidence created', item_id: itemId });
  } catch (error) {
    console.error('Error creating evidence:', error);
    res.status(500).json({ error: 'Failed to create evidence' });
  }
};

const getChainOfCustody = async (req, res) => {
  try {
    const itemId = req.params.item_id;
    const chain = await evidenceRepo.getChainOfCustody(req.dbConn, itemId);
    res.json(chain);
  } catch (error) {
    console.error('Error fetching chain of custody:', error);
    res.status(500).json({ error: 'Failed to fetch chain of custody' });
  }
};

const addCustodyTransfer = async (req, res) => {
  try {
    const transferData = {
      item_id: req.params.item_id,
      released_by_user: req.user.user_id,
      received_by_name: req.body.received_by_name,
      new_status: req.body.new_status
    };
    
    await evidenceRepo.addCustodyTransfer(req.dbConn, transferData);
    res.json({ message: 'Custody transfer recorded successfully' });
  } catch (error) {
    console.error('Error adding custody transfer:', error);
    if (error.sqlState === '45000') {
        return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to add custody transfer' });
  }
};

module.exports = {
  getEvidenceByCase,
  createEvidenceItem,
  getChainOfCustody,
  addCustodyTransfer
};
