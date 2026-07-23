const express = require('express');
const { z } = require('zod');
const clinicalController = require('../controllers/clinicalController');
const { validate } = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');
const { injectDbConnection } = require('../middleware/dbInjector');

const router = express.Router();

router.use(authenticate);
router.use(injectDbConnection);

// JMOs only for clinical routes (per Phase 1 rules)
router.use(requireRole('jmo_role'));

const createExamSchema = z.object({
  body: z.object({
    case_id: z.number().int().positive(),
    consent_status: z.enum(['Given', 'Refused', 'Pending', 'Not Required']),
    history_given: z.string().optional()
  }),
  query: z.object({}),
  params: z.object({})
});

const createPmSchema = z.object({
  body: z.object({
    case_id: z.number().int().positive(),
    death_category: z.string().min(1),
    pm_date: z.string().min(1) // Can be refined to datetime regex
  }),
  query: z.object({}),
  params: z.object({})
});

const recordCodSchema = z.object({
  body: z.object({
    immediate_cause: z.string().min(1),
    antecedent_cause: z.string().optional(),
    contributory: z.string().optional()
  }),
  query: z.object({}),
  params: z.object({
    pm_id: z.string().regex(/^\d+$/)
  })
});

router.post('/clinical-exams', validate(createExamSchema), clinicalController.createClinicalExam);
router.get('/clinical-exams', clinicalController.getClinicalExams);

router.post('/postmortems', validate(createPmSchema), clinicalController.createPostmortem);
router.get('/postmortems', clinicalController.getPostmortems);
router.post('/postmortems/:pm_id/cause-of-death', validate(recordCodSchema), clinicalController.recordCauseOfDeath);

module.exports = router;
