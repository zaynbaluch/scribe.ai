import { Request, Response } from 'express';
import * as portfolioService from '../services/portfolio.service';
import { asyncHandler, createError } from '../middleware/error-handler.middleware';
import prisma from '../lib/prisma';

export const getConfig = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const config = await portfolioService.getPortfolioConfig(userId);
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { vanitySlug: true } });
  res.json({ success: true, data: { ...config, slug: user?.vanitySlug || null } });
});

export const updateConfig = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const updated = await portfolioService.updatePortfolioConfig(userId, req.body);
  res.json({ success: true, data: updated });
});

export const updateSlug = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { slug } = req.body;
  if (!slug) throw createError('Slug is required', 400);
  const newSlug = await portfolioService.updateSlug(userId, slug);
  res.json({ success: true, data: { slug: newSlug } });
});

export const getPublicPortfolio = asyncHandler(async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const portfolio = await portfolioService.getPublicPortfolio(slug);

  // Check if password-protected
  if (portfolio.portfolio.hasPassword) {
    const password = req.headers['x-portfolio-password'] as string;
    if (!password) {
      res.status(401).json({ success: false, error: { message: 'Password required' }, data: { requiresPassword: true } });
      return;
    }
    const valid = await portfolioService.verifyPortfolioPassword(slug, password);
    if (!valid) {
      res.status(401).json({ success: false, error: { message: 'Invalid password' } });
      return;
    }
  }

  res.json({ success: true, data: portfolio });
});
