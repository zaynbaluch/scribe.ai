import { Router } from 'express';
import * as appController from '../controllers/application.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createApplicationSchema, updateApplicationSchema, updateStatusSchema } from '../schemas/application.schema';

const router = Router();
router.use(requireAuth);

router.get('/stats', appController.getStats);
router.get('/', appController.getApplications);
router.post('/', validate(createApplicationSchema), appController.createApplication);
router.get('/:id', appController.getApplicationById);
router.put('/:id', validate(updateApplicationSchema), appController.updateApplication);
router.patch('/:id/status', validate(updateStatusSchema), appController.updateStatus);
router.delete('/:id', appController.deleteApplication);

export default router;
