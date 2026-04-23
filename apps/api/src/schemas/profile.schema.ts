import { z } from 'zod';

// ─── Sub-item schemas ────────────────────────────────────────────────────────

const experienceSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(), // ISO date string
  endDate: z.string().optional().nullable(),
  current: z.boolean().optional().default(false),
  description: z.string().optional().nullable(),
  bullets: z.array(z.string()).optional().default([]),
  orderIndex: z.number().int().optional().default(0),
});

const educationSchema = z.object({
  id: z.string().uuid().optional(),
  institution: z.string().optional().nullable(),
  degree: z.string().optional().nullable(),
  field: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  gpa: z.string().optional().nullable(),
  honors: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  orderIndex: z.number().int().optional().default(0),
});

const skillSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  category: z.string().optional().nullable(),
  proficiency: z.string().optional().nullable(),
  orderIndex: z.number().int().optional().default(0),
});

const projectSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  techStack: z.array(z.string()).optional().default([]),
  bullets: z.array(z.string()).optional().default([]),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  orderIndex: z.number().int().optional().default(0),
});

const certificationSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional().nullable(),
  issuer: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  orderIndex: z.number().int().optional().default(0),
});

const publicationSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  venue: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  orderIndex: z.number().int().optional().default(0),
});

const volunteerWorkSchema = z.object({
  id: z.string().uuid().optional(),
  role: z.string().min(1),
  organization: z.string().min(1),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  bullets: z.array(z.string()).optional().default([]),
  orderIndex: z.number().int().optional().default(0),
});

// ─── Profile update schema (partial) ────────────────────────────────────────

export const updateProfileSchema = z.object({
  summary: z.string().optional().nullable(),
  headline: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable(),
  github: z.string().optional().nullable(),
  experiences: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  skills: z.array(skillSchema).optional(),
  projects: z.array(projectSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  publications: z.array(publicationSchema).optional(),
  volunteerWork: z.array(volunteerWorkSchema).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type CertificationInput = z.infer<typeof certificationSchema>;
export type PublicationInput = z.infer<typeof publicationSchema>;
export type VolunteerWorkInput = z.infer<typeof volunteerWorkSchema>;
