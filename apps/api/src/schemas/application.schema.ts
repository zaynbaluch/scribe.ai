import { z } from 'zod';

export const applicationStatusEnum = z.enum([
  'saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn',
]);

export const createApplicationSchema = z.object({
  jobId: z.string().uuid(),
  resumeId: z.string().uuid().optional().nullable(),
  coverLetterId: z.string().uuid().optional().nullable(),
  status: applicationStatusEnum.optional().default('saved'),
  appliedAt: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
  contactName: z.string().max(200).optional().nullable(),
  contactEmail: z.string().email().optional().or(z.literal('')).nullable(),
  salaryRange: z.string().max(100).optional().nullable(),
  nextDeadline: z.string().datetime().optional().nullable(),
});

export const updateApplicationSchema = z.object({
  status: applicationStatusEnum.optional(),
  resumeId: z.string().uuid().optional().nullable(),
  coverLetterId: z.string().uuid().optional().nullable(),
  appliedAt: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
  contactName: z.string().max(200).optional().nullable(),
  contactEmail: z.string().email().optional().or(z.literal('')).nullable(),
  salaryRange: z.string().max(100).optional().nullable(),
  nextDeadline: z.string().datetime().optional().nullable(),
  reminderSent: z.boolean().optional(),
});

export const updateStatusSchema = z.object({
  status: applicationStatusEnum,
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type ApplicationStatus = z.infer<typeof applicationStatusEnum>;
