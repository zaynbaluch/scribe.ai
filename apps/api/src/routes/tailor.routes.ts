import { Router } from 'express';
import * as tailorController from '../controllers/tailor.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
router.use(requireAuth);

router.post('/analyze', tailorController.analyzeJob);
router.post('/tailor', tailorController.tailorResume);
router.post('/cover-letter', tailorController.generateCoverLetter);
router.post('/send-email', tailorController.sendTailoredEmail);

export default router;
