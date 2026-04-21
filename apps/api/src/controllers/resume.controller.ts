import { Request, Response } from 'express';
import * as resumeService from '../services/resume.service';
import { asyncHandler, createError } from '../middleware/error-handler.middleware';
import prisma from '../lib/prisma';
import logger from '../lib/logger';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

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

export const getAtsScore = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const resumeId = req.params.id as string;

  const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
  if (!resume) throw createError('Resume not found', 404);

  const profileData = resume.baseProfileSnapshot as any;
  if (!profileData) throw createError('Resume has no profile data', 400);

  // Get JD keywords if resume is linked to a job
  let jdKeywords: any = null;
  if (resume.jobId) {
    const job = await prisma.job.findUnique({ where: { id: resume.jobId } });
    if (job?.parsedKeywords) {
      jdKeywords = job.parsedKeywords;
    }
  }

  try {
    const aiRes = await fetch(`${AI_SERVICE_URL}/ai/ats-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeData: profileData, jdKeywords }),
    });
    const aiData = await aiRes.json();

    if (!aiData.success) throw new Error('ATS scoring failed');

    // Persist score and report
    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        atsScore: aiData.data.score,
        atsReport: aiData.data,
      },
    });

    res.json({ success: true, data: aiData.data });
  } catch (err: any) {
    logger.error({ err }, 'ATS scoring failed');
    throw createError(`ATS check failed: ${err.message}`, 500);
  }
});

