import express from 'express';
import { getAuditLogsController } from '../controllers/audit-log.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.get('/', authenticate, authorize('AUDIT_VIEW'), getAuditLogsController);

export default router;
