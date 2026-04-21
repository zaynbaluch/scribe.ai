import { Router } from 'express';
import * as resumeController from '../controllers/resume.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createResumeSchema, updateResumeSchema } from '../schemas/resume.schema';

const router = Router();

router.use(requireAuth);

router.get('/', resumeController.getResumes);
router.post('/', validate(createResumeSchema), resumeController.createResume);
router.get('/:id', resumeController.getResumeById);
router.put('/:id', validate(updateResumeSchema), resumeController.updateResume);
router.post('/:id/duplicate', resumeController.duplicateResume);
router.delete('/:id', resumeController.deleteResume);

export default router;
