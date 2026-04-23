import { Request, Response } from 'express';
import * as tailorService from '../services/tailor.service';
import { asyncHandler } from '../middleware/error-handler.middleware';

export const analyzeJob = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { resumeId, text, url, title, company } = req.body;

  if (!resumeId) {
    res.status(400).json({ success: false, error: { message: 'resumeId is required' } });
    return;
  }

  const result = await tailorService.analyzeJob(userId, resumeId, { text, url, title, company });
  res.json({ success: true, data: result });
});

export const tailorResume = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { resumeId, jobId } = req.body;

  if (!resumeId || !jobId) {
    res.status(400).json({ success: false, error: { message: 'resumeId and jobId are required' } });
    return;
  }

  const result = await tailorService.tailorResume(userId, resumeId, jobId);
  res.json({ success: true, data: result });
});

export const generateCoverLetter = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { resumeId, jobId, tone } = req.body;

  if (!resumeId || !jobId) {
    res.status(400).json({ success: false, error: { message: 'resumeId and jobId are required' } });
    return;
  }

  const result = await tailorService.generateCoverLetter(userId, { resumeId, jobId, tone });
  res.json({ success: true, data: result });
});

export const sendTailoredEmail = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { resumeId, jobId } = req.body;

  if (!resumeId || !jobId) {
    res.status(400).json({ success: false, error: { message: 'resumeId and jobId are required' } });
    return;
  }

  await tailorService.sendTailoredEmail(userId, resumeId, jobId);
  res.json({ success: true, message: 'Tailored application sent to your email' });
});
