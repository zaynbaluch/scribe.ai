import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { googleLoginSchema, githubLoginSchema, linkedinLoginSchema, refreshTokenSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/register', authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/login', authController.login);
router.post('/verify-2fa', authController.verify2FA);
router.post('/google', validate(googleLoginSchema), authController.googleLogin);
router.post('/github', validate(githubLoginSchema), authController.githubLogin);
router.post('/linkedin', validate(linkedinLoginSchema), authController.linkedinLogin);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.getMe);

export default router;
