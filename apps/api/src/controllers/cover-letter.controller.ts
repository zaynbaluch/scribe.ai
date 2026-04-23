import { Request, Response } from 'express';
import { CoverLetterService } from '../services/cover-letter.service';
import * as tailorService from '../services/tailor.service';
import * as exportService from '../services/export.service';

export const generateCoverLetter = async (req: Request, res: Response) => {
  try {
    const { resumeId, jobId, tone, jdText, jobTitle } = req.body;
    const userId = req.user!.userId;
    const cl = await tailorService.generateCoverLetter(userId, { resumeId, jobId, tone, jdText, jobTitle });
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
    const cl = await CoverLetterService.getCoverLetter(req.params.id as string, userId);
    res.json({ success: true, data: cl });
  } catch (error: any) {
    res.status(404).json({ success: false, error: { message: error.message } });
  }
};

export const updateCoverLetter = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const cl = await CoverLetterService.updateCoverLetter(req.params.id as string, userId, req.body);
    res.json({ success: true, data: cl });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const deleteCoverLetter = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    await CoverLetterService.deleteCoverLetter(req.params.id as string, userId);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const exportCoverLetter = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id, format } = req.params;

    switch (format) {
      case 'pdf': {
        const buffer = await exportService.exportCoverLetterPdf(userId, id as string);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="cover-letter.pdf"`);
        res.send(buffer);
        break;
      }
      case 'docx': {
        const buffer = await exportService.exportCoverLetterDocx(userId, id as string);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="cover-letter.docx"`);
        res.send(buffer);
        break;
      }
      case 'txt': {
        const text = await exportService.exportCoverLetterTxt(userId, id as string);
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="cover-letter.txt"`);
        res.send(text);
        break;
      }
      default:
        res.status(400).json({ success: false, error: { message: `Unsupported format: ${format}` } });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
