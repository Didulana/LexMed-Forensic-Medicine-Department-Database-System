const clinicalRepo = require('../repositories/clinicalRepository');
const { sanitizeObject } = require('../utils/sanitizer');

const createClinicalExam = async (req, res) => {
  try {
    // Sanitize user inputs to prevent stored XSS
    const sanitizedBody = sanitizeObject(req.body, ['history_given']);
    
    // Ensure the JMO can only create an exam for themselves
    sanitizedBody.jmo_id = req.user.user_id;

    const examId = await clinicalRepo.createClinicalExam(req.dbConn, sanitizedBody);
    res.status(201).json({ message: 'Clinical exam created', exam_id: examId });
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ error: 'Failed to create clinical exam' });
  }
};

const getClinicalExams = async (req, res) => {
  try {
    // Scoped strictly to their own cases in the query layer
    const exams = await clinicalRepo.getClinicalExamsByJmo(req.dbConn, req.user.user_id);
    res.json(exams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
};

const createPostmortem = async (req, res) => {
  try {
    req.body.jmo_id = req.user.user_id;
    const pmId = await clinicalRepo.createPostmortem(req.dbConn, req.body);
    res.status(201).json({ message: 'Postmortem created', pm_id: pmId });
  } catch (error) {
    console.error('Error creating postmortem:', error);
    res.status(500).json({ error: 'Failed to create postmortem' });
  }
};

const getPostmortems = async (req, res) => {
  try {
    // Scoped strictly to their own cases
    const postmortems = await clinicalRepo.getPostmortemsByJmo(req.dbConn, req.user.user_id);
    res.json(postmortems);
  } catch (error) {
    console.error('Error fetching postmortems:', error);
    res.status(500).json({ error: 'Failed to fetch postmortems' });
  }
};

const recordCauseOfDeath = async (req, res) => {
  try {
    const pmId = req.params.pm_id;
    const sanitizedBody = sanitizeObject(req.body, ['immediate_cause', 'antecedent_cause', 'contributory']);
    
    // Application enforces that JMO can only record COD for their own postmortem.
    // We check this by querying first.
    const postmortems = await clinicalRepo.getPostmortemsByJmo(req.dbConn, req.user.user_id);
    const pmExists = postmortems.find(p => p.pm_id === Number(pmId));
    
    if (!pmExists) {
      return res.status(404).json({ error: 'Postmortem not found or not assigned to you' });
    }

    await clinicalRepo.recordCauseOfDeath(req.dbConn, pmId, sanitizedBody);
    res.json({ message: 'Cause of death recorded successfully' });
  } catch (error) {
    console.error('Error recording COD:', error);
    if (error.sqlState === '45000') {
        return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to record cause of death' });
  }
};

module.exports = {
  createClinicalExam,
  getClinicalExams,
  createPostmortem,
  getPostmortems,
  recordCauseOfDeath
};
