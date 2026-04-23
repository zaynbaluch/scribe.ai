import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import * as controller from '../controllers/cover-letter.controller';

const router = Router();

router.use(requireAuth);

router.post('/generate', controller.generateCoverLetter);
router.get('/', controller.getCoverLetters);
router.get('/:id', controller.getCoverLetter);
router.patch('/:id', controller.updateCoverLetter);
router.delete('/:id', controller.deleteCoverLetter);
router.get('/:id/export/:format', controller.exportCoverLetter);

export default router;
