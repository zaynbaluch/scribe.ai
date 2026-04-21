import { Request, Response } from 'express';
import * as appService from '../services/application.service';
import { asyncHandler } from '../middleware/error-handler.middleware';

export const createApplication = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const app = await appService.createApplication(userId, req.body);
  res.status(201).json({ success: true, data: app });
});

export const getApplications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const apps = await appService.getApplications(userId);
  res.json({ success: true, data: apps });
});

export const getApplicationById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const app = await appService.getApplicationById(userId, req.params.id as string);
  res.json({ success: true, data: app });
});

export const updateApplication = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const updated = await appService.updateApplication(userId, req.params.id as string, req.body);
  res.json({ success: true, data: updated });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { status } = req.body;
  const updated = await appService.updateStatus(userId, req.params.id as string, status);
  res.json({ success: true, data: updated });
});

export const deleteApplication = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  await appService.deleteApplication(userId, req.params.id as string);
  res.json({ success: true, data: null });
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const stats = await appService.getStats(userId);
  res.json({ success: true, data: stats });
});
