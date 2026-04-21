import { Request, Response } from 'express';
import * as profileService from '../services/profile.service';
import * as aiClient from '../services/ai-client.service';
import { asyncHandler, createError } from '../middleware/error-handler.middleware';
import logger from '../lib/logger';

/**
 * GET /api/profile
 * Get the authenticated user's full profile.
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const profile = await profileService.getFullProfile(userId);

  if (!profile) {
    throw createError('Profile not found', 404, 'PROFILE_NOT_FOUND');
  }

  res.json({ success: true, data: profile });
});

/**
 * PUT /api/profile
 * Update profile (partial update — only send changed fields/sections).
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const updatedProfile = await profileService.updateProfile(userId, req.body);

  res.json({ success: true, data: updatedProfile });
});

/**
 * POST /api/profile/import
 * Import profile data from an uploaded file (PDF/DOCX).
 * Returns parsed data for user review before saving.
 */
export const importProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw createError('No file uploaded', 400, 'NO_FILE');
  }

  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!allowedTypes.includes(req.file.mimetype)) {
    throw createError('Only PDF and DOCX files are supported', 400, 'INVALID_FILE_TYPE');
  }

  logger.info(
    { userId: req.user!.userId, fileType: req.file.mimetype, size: req.file.size },
    'Processing resume import'
  );

  const parsed = await aiClient.parseResume(req.file.buffer, req.file.mimetype);

  res.json({
    success: true,
    data: {
      parsed,
      confidence: parsed.confidence || 0.5,
    },
  });
});
