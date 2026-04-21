import { Request, Response } from 'express';
import * as resumeService from '../services/resume.service';
import { asyncHandler, createError } from '../middleware/error-handler.middleware';

export const createResume = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const resume = await resumeService.createResume(userId, req.body);
  res.status(201).json({ success: true, data: resume });
});

export const getResumes = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const sort = (req.query.sort as string) || 'updatedAt';
  const order = (req.query.order as string) === 'asc' ? 'asc' : 'desc';
  const result = await resumeService.getResumes(userId, page, limit, sort, order as 'asc' | 'desc');
  res.json({ success: true, ...result });
});

export const getResumeById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const resume = await resumeService.getResumeById(userId, req.params.id as string);
  res.json({ success: true, data: resume });
});

export const updateResume = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const updated = await resumeService.updateResume(userId, req.params.id as string, req.body);
  res.json({ success: true, data: updated });
});

export const duplicateResume = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const duplicate = await resumeService.duplicateResume(userId, req.params.id as string);
  res.status(201).json({ success: true, data: duplicate });
});

export const deleteResume = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  await resumeService.deleteResume(userId, req.params.id as string);
  res.json({ success: true, data: null });
});
