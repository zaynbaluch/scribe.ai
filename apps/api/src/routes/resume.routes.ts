import { Router } from 'express';
import * as resumeController from '../controllers/resume.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createResumeSchema, updateResumeSchema, createTailoredResumeSchema } from '../schemas/resume.schema';

const router = Router();

router.use(requireAuth);

router.get('/', resumeController.getResumes);
router.post('/', validate(createResumeSchema), resumeController.createResume);
router.get('/:id', resumeController.getResumeById);
router.put('/:id', validate(updateResumeSchema), resumeController.updateResume);
router.post('/tailored', validate(createTailoredResumeSchema), resumeController.createTailoredResume);
router.post('/:id/duplicate', resumeController.duplicateResume);
router.get('/:id/ats-score', resumeController.getAtsScore);
router.delete('/:id', resumeController.deleteResume);

export default router;
