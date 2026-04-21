import { Request, Response } from 'express';
import * as exportService from '../services/export.service';
import { asyncHandler, createError } from '../middleware/error-handler.middleware';
import * as typstService from '../services/typst.service';

/**
 * GET /api/resumes/:id/export/:format
 */
export const exportResume = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const id = req.params.id as string;
  const format = req.params.format as string;

  switch (format) {
    case 'pdf': {
      const pdfBuffer = await exportService.exportPdf(userId, id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="resume.pdf"`);
      res.send(pdfBuffer);
      break;
    }
    case 'docx': {
      const docxBuffer = await exportService.exportDocx(userId, id);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="resume.docx"`);
      res.send(docxBuffer);
      break;
    }
    case 'txt': {
      const text = await exportService.exportTxt(userId, id);
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="resume.txt"`);
      res.send(text);
      break;
    }
    case 'json': {
      const data = await exportService.exportJson(userId, id);
      res.json({ success: true, data });
      break;
    }
    default:
      throw createError(`Unsupported format: ${format}`, 400, 'INVALID_FORMAT');
  }
});

/**
 * GET /api/templates
 */
export const getTemplates = asyncHandler(async (_req: Request, res: Response) => {
  const templates = await typstService.getAvailableTemplates();
  res.json({ success: true, data: templates });
});
