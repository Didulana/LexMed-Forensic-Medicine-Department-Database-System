const express = require('express');
const { z } = require('zod');
const caseController = require('../controllers/caseController');
const { validate } = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');
const { injectDbConnection } = require('../middleware/dbInjector');

const router = express.Router();

// All case routes require authentication and proper DB injection
router.use(authenticate);
router.use(injectDbConnection);

const createCaseSchema = z.object({
  body: z.object({
    case_number: z.string().min(1),
    patient_nic_encrypted: z.any(), // In a real app this would be binary data/buffer string
    patient_nic_hash: z.string(),
    patient_name_encrypted: z.any(),
    case_type: z.enum(['Clinical', 'Postmortem', 'Mixed'])
  }),
  query: z.object({}),
  params: z.object({})
});

// GET /cases (Clerks, Police, JMOs can list depending on views in repo, we'll restrict police at the app level if needed, but db views already restrict)
router.get('/', requireRole('jmo_role', 'department_clerk_role', 'police_officer_role', 'auditor_role'), caseController.getAllCases);

// POST /cases (Clerks and JMOs can create cases)
router.post('/', requireRole('jmo_role', 'department_clerk_role'), validate(createCaseSchema), caseController.createCase);

// GET /cases/:id
router.get('/:id', requireRole('jmo_role', 'department_clerk_role', 'police_officer_role'), caseController.getCaseById);

// GET /cases/:id/timeline
router.get('/:id/timeline', requireRole('jmo_role', 'department_clerk_role'), caseController.getCaseTimeline);

module.exports = router;