import { z } from 'zod';

const customStylesSchema = z.object({
  font: z.string().optional().default('Inter'),
  fontSize: z.number().min(8).max(16).optional().default(11),
  lineSpacing: z.number().min(0.8).max(2.0).optional().default(1.15),
  accentColor: z.string().optional().default('#7C3AED'),
  marginTop: z.number().min(0.3).max(1.5).optional().default(0.5),
  marginBottom: z.number().min(0.3).max(1.5).optional().default(0.5),
  marginLeft: z.number().min(0.3).max(1.5).optional().default(0.6),
  marginRight: z.number().min(0.3).max(1.5).optional().default(0.6),
  showProfileImage: z.boolean().optional().default(true),
}).passthrough();

const sectionVisibilitySchema = z.object({
  summary: z.boolean().optional().default(true),
  experience: z.boolean().optional().default(true),
  education: z.boolean().optional().default(true),
  skills: z.boolean().optional().default(true),
  projects: z.boolean().optional().default(true),
  certifications: z.boolean().optional().default(false),
  publications: z.boolean().optional().default(false),
  volunteerWork: z.boolean().optional().default(false),
});

export const createResumeSchema = z.object({
  name: z.string().min(1, 'Resume name is required').max(100),
  templateId: z.string().optional().default('modern-01'),
  sectionOrder: z
    .array(z.string())
    .optional()
    .default(['summary', 'experience', 'skills', 'projects', 'education']),
  sectionVisibility: sectionVisibilitySchema.optional(),
  customStyles: customStylesSchema.optional(),
  showQrCode: z.boolean().optional().default(true),
});

export const updateResumeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  templateId: z.string().optional(),
  sectionOrder: z.array(z.string()).optional(),
  sectionVisibility: sectionVisibilitySchema.optional(),
  customStyles: customStylesSchema.optional(),
  showQrCode: z.boolean().optional(),
  baseProfileSnapshot: z.any().optional(),
});

export const createTailoredResumeSchema = z.object({
  baseResumeId: z.string(),
  profileSnapshot: z.any(),
});

export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
export type CreateTailoredResumeInput = z.infer<typeof createTailoredResumeSchema>;
