const express = require('express');
const { z } = require('zod');
const adminController = require('../controllers/adminController');
const { validate } = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');
const { injectDbConnection } = require('../middleware/dbInjector');

const router = express.Router();

router.use(authenticate);
router.use(injectDbConnection);

const deactivateSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    user_id: z.string().regex(/^\d+$/)
  })
});

const getLogsSchema = z.object({
  body: z.object({}),
  query: z.object({
    user_id: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    limit: z.string().optional(),
    offset: z.string().optional()
  }),
  params: z.object({})
});

// Admin only
router.post('/users/:user_id/deactivate', requireRole('db_admin_role'), validate(deactivateSchema), adminController.deactivateUser);

// Admin or Auditor
router.get('/audit-log', requireRole('db_admin_role', 'auditor_role'), validate(getLogsSchema), adminController.getAuditLogs);

module.exports = router;
