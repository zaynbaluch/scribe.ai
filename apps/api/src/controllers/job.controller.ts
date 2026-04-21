import { Request, Response } from 'express';
import * as jobService from '../services/job.service';
import { asyncHandler } from '../middleware/error-handler.middleware';

export const createJob = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const job = await jobService.createJob(userId, req.body);
  res.status(201).json({ success: true, data: job });
});

export const getJobs = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await jobService.getJobs(userId, page, limit);
  res.json({ success: true, ...result });
});

export const getJobById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const job = await jobService.getJobById(userId, req.params.id as string);
  res.json({ success: true, data: job });
});

export const updateJob = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const updated = await jobService.updateJob(userId, req.params.id as string, req.body);
  res.json({ success: true, data: updated });
});

export const deleteJob = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  await jobService.deleteJob(userId, req.params.id as string);
  res.json({ success: true, data: null });
});
