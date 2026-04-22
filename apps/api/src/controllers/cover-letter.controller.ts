import { Request, Response } from 'express';
import { CoverLetterService } from '../services/cover-letter.service';
import * as tailorService from '../services/tailor.service';

export const generateCoverLetter = async (req: Request, res: Response) => {
  try {
    const { resumeId, jobId, tone } = req.body;
    const userId = req.user!.id;
    const cl = await tailorService.generateCoverLetter(userId, { resumeId, jobId, tone });
    res.status(201).json(cl);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCoverLetters = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const cls = await CoverLetterService.getCoverLettersByUser(userId);
    res.json(cls);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCoverLetter = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const cl = await CoverLetterService.getCoverLetter(req.params.id, userId);
    res.json(cl);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const updateCoverLetter = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const cl = await CoverLetterService.updateCoverLetter(req.params.id, userId, req.body);
    res.json(cl);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCoverLetter = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    await CoverLetterService.deleteCoverLetter(req.params.id, userId);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
