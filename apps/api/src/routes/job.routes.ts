import { Router } from 'express';
import * as jobController from '../controllers/job.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createJobSchema, updateJobSchema } from '../schemas/job.schema';

const router = Router();
router.use(requireAuth);

router.get('/', jobController.getJobs);
router.post('/', validate(createJobSchema), jobController.createJob);
router.get('/:id', jobController.getJobById);
router.put('/:id', validate(updateJobSchema), jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

export default router;
