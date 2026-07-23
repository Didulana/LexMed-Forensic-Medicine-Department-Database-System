const caseRepo = require('../repositories/caseRepository');

const getAllCases = async (req, res) => {
  try {
    const cases = await caseRepo.getAllCases(req.dbConn);
    res.json(cases);
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
};

const getCaseById = async (req, res) => {
  try {
    const caseId = req.params.id;
    const caseData = await caseRepo.getCaseById(req.dbConn, caseId);
    
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    res.json(caseData);
  } catch (error) {
    console.error('Error fetching case:', error);
    res.status(500).json({ error: 'Failed to fetch case' });
  }
};

const createCase = async (req, res) => {
  try {
    // Input is already validated by zod middleware
    const caseId = await caseRepo.createCase(req.dbConn, req.body);
    res.status(201).json({ message: 'Case created successfully', case_id: caseId });
  } catch (error) {
    console.error('Error creating case:', error);
    res.status(500).json({ error: 'Failed to create case' });
  }
};

const getCaseTimeline = async (req, res) => {
  try {
    const caseId = req.params.id;
    const timeline = await caseRepo.getCaseTimeline(req.dbConn, caseId);
    res.json(timeline);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch case timeline' });
  }
};

module.exports = {
  getAllCases,
  getCaseById,
  createCase,
  getCaseTimeline
};