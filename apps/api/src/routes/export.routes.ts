import { Router } from 'express';
import * as exportController from '../controllers/export.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/:id/export/:format', exportController.exportResume);

export default router;
