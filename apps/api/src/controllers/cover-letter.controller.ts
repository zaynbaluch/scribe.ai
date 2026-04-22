import { Request, Response } from 'express';
import { CoverLetterService } from '../services/cover-letter.service';
import * as tailorService from '../services/tailor.service';

export const generateCoverLetter = async (req: Request, res: Response) => {
  try {
    const { resumeId, jobId, tone } = req.body;
    const userId = req.user!.userId;
    const cl = await tailorService.generateCoverLetter(userId, { resumeId, jobId, tone });
    res.status(201).json({ success: true, data: cl });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getCoverLetters = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const cls = await CoverLetterService.getCoverLettersByUser(userId);
    res.json({ success: true, data: cls });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getCoverLetter = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const cl = await CoverLetterService.getCoverLetter(req.params.id, userId);
    res.json({ success: true, data: cl });
  } catch (error: any) {
    res.status(404).json({ success: false, error: { message: error.message } });
  }
};

export const updateCoverLetter = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const cl = await CoverLetterService.updateCoverLetter(req.params.id, userId, req.body);
    res.json({ success: true, data: cl });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const deleteCoverLetter = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    await CoverLetterService.deleteCoverLetter(req.params.id, userId);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
