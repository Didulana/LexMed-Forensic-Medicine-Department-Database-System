const express = require('express');
const { z } = require('zod');
const evidenceController = require('../controllers/evidenceController');
const { validate } = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');
const { injectDbConnection } = require('../middleware/dbInjector');

const router = express.Router();

router.use(authenticate);
router.use(injectDbConnection);

// Clerks only for evidence routes (per Phase 1 rules)
router.use(requireRole('department_clerk_role'));

const createEvidenceSchema = z.object({
  body: z.object({
    case_id: z.number().int().positive(),
    item_type: z.string().min(1),
    description: z.string().min(1),
    current_status: z.enum(['Available', 'In Transit', 'At Court', 'Disposed'])
  }),
  query: z.object({}),
  params: z.object({})
});

const transferCustodySchema = z.object({
  body: z.object({
    received_by_name: z.string().min(1),
    new_status: z.enum(['Available', 'In Transit', 'At Court', 'Disposed'])
  }),
  query: z.object({}),
  params: z.object({
    item_id: z.string().regex(/^\d+$/)
  })
});

const caseParamSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    case_id: z.string().regex(/^\d+$/)
  })
});

router.post('/', validate(createEvidenceSchema), evidenceController.createEvidenceItem);
router.get('/case/:case_id', validate(caseParamSchema), evidenceController.getEvidenceByCase);

router.get('/:item_id/chain-of-custody', evidenceController.getChainOfCustody);
router.post('/:item_id/transfer', validate(transferCustodySchema), evidenceController.addCustodyTransfer);

module.exports = router;
