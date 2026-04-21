import { Router } from 'express';
import * as portfolioController from '../controllers/portfolio.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Authenticated routes — portfolio config
router.get('/config', requireAuth, portfolioController.getConfig);
router.put('/config', requireAuth, portfolioController.updateConfig);
router.put('/slug', requireAuth, portfolioController.updateSlug);

// Public route — view portfolio by slug
router.get('/:slug', portfolioController.getPublicPortfolio);

export default router;
