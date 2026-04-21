import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(1, 'Job title is required').max(200),
  company: z.string().min(1, 'Company is required').max(200),
  location: z.string().max(200).optional(),
  url: z.string().url().optional().or(z.literal('')),
  source: z.enum(['manual', 'linkedin', 'indeed', 'glassdoor', 'extension', 'image']).optional().default('manual'),
  rawDescription: z.string().min(1, 'Job description is required'),
});

export const updateJobSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  company: z.string().min(1).max(200).optional(),
  location: z.string().max(200).optional(),
  url: z.string().url().optional().or(z.literal('')),
  parsedKeywords: z.any().optional(),
  companyTone: z.string().optional(),
  matchScore: z.number().min(0).max(100).optional(),
  matchBreakdown: z.any().optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
