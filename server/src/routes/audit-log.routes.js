import express from 'express';
import { getAuditLogsController } from '../controllers/audit-log.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getAuditLogsController);

export default router;
