import prisma from '../lib/prisma';
import logger from '../lib/logger';
import { CreateResumeInput, UpdateResumeInput } from '../schemas/resume.schema';

/**
 * Create a new resume, snapshotting the user's current profile.
 */
export async function createResume(userId: string, data: CreateResumeInput) {
  // Snapshot the user's current profile
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      experiences: { orderBy: { orderIndex: 'asc' } },
      education: { orderBy: { orderIndex: 'asc' } },
      skills: { orderBy: { orderIndex: 'asc' } },
      projects: { orderBy: { orderIndex: 'asc' } },
      certifications: { orderBy: { orderIndex: 'asc' } },
      publications: { orderBy: { orderIndex: 'asc' } },
      volunteerWork: { orderBy: { orderIndex: 'asc' } },
    },
  });

  if (!profile) {
    throw new Error('Profile not found. Please create a profile first.');
  }

  // Get user info for the snapshot
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  const snapshot = {
    name: user?.name || '',
    email: user?.email || '',
    summary: profile.summary,
    headline: profile.headline,
    location: profile.location,
    phone: profile.phone,
    website: profile.website,
    linkedin: profile.linkedin,
    github: profile.github,
    experiences: profile.experiences,
    education: profile.education,
    skills: profile.skills,
    projects: profile.projects,
    certifications: profile.certifications,
    publications: profile.publications,
    volunteerWork: profile.volunteerWork,
  };

  const resume = await prisma.resume.create({
    data: {
      userId,
      name: data.name,
      templateId: data.templateId || 'modern-01',
      baseProfileSnapshot: snapshot,
      sectionOrder: data.sectionOrder || ['summary', 'experience', 'skills', 'projects', 'education'],
      sectionVisibility: data.sectionVisibility || {},
      customStyles: data.customStyles || {},
      showQrCode: data.showQrCode !== undefined ? data.showQrCode : true,
    },
  });

  logger.info({ userId, resumeId: resume.id }, 'Resume created');
  return resume;
}

/**
 * Get all resumes for a user with pagination.
 */
export async function getResumes(userId: string, page = 1, limit = 20, sort = 'updatedAt', order: 'asc' | 'desc' = 'desc') {
  const skip = (page - 1) * limit;

  const [resumes, total] = await Promise.all([
    prisma.resume.findMany({
      where: { userId },
      orderBy: { [sort]: order },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        templateId: true,
        atsScore: true,
        matchScore: true,
        jobId: true,
        isTailored: true,
        baseResumeId: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.resume.count({ where: { userId } }),
  ]);

  return {
    data: resumes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a single resume by ID (with ownership check).
 */
export async function getResumeById(userId: string, resumeId: string) {
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });

  if (!resume) {
    throw new Error('Resume not found');
  }

  return resume;
}

/**
 * Update a resume (partial).
 */
export async function updateResume(userId: string, resumeId: string, data: UpdateResumeInput) {
  // Verify ownership
  const existing = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });

  if (!existing) {
    throw new Error('Resume not found');
  }

  const updated = await prisma.resume.update({
    where: { id: resumeId },
    data: {
      name: data.name,
      templateId: data.templateId,
      sectionOrder: data.sectionOrder,
      sectionVisibility: data.sectionVisibility !== undefined ? data.sectionVisibility : undefined,
      customStyles: data.customStyles !== undefined ? data.customStyles : undefined,
      showQrCode: data.showQrCode !== undefined ? data.showQrCode : undefined,
      baseProfileSnapshot: data.baseProfileSnapshot !== undefined ? data.baseProfileSnapshot : undefined,
    },
  });

  logger.info({ userId, resumeId }, 'Resume updated');
  return updated;
}

/**
 * Duplicate a resume with " (Copy)" suffix.
 */
export async function duplicateResume(userId: string, resumeId: string) {
  const source = await getResumeById(userId, resumeId);

  const duplicate = await prisma.resume.create({
    data: {
      userId,
      name: `${source.name} (Copy)`,
      templateId: source.templateId,
      baseProfileSnapshot: source.baseProfileSnapshot || undefined,
      tailoredContent: source.tailoredContent || undefined,
      sectionOrder: source.sectionOrder,
      sectionVisibility: source.sectionVisibility || undefined,
      customStyles: source.customStyles || undefined,
    },
  });

  logger.info({ userId, sourceId: resumeId, newId: duplicate.id }, 'Resume duplicated');
  return duplicate;
}

/**
 * Create a tailored resume copy from a base resume.
 */
export async function createTailoredResume(userId: string, data: { baseResumeId: string; profileSnapshot: any }) {
  const source = await getResumeById(userId, data.baseResumeId);

  const tailored = await prisma.resume.create({
    data: {
      userId,
      name: `${source.name} (Tailored)`,
      templateId: source.templateId,
      baseProfileSnapshot: data.profileSnapshot,
      sectionOrder: source.sectionOrder,
      sectionVisibility: source.sectionVisibility || undefined,
      customStyles: source.customStyles || undefined,
      isTailored: true,
      baseResumeId: data.baseResumeId,
    },
  });

  logger.info({ userId, sourceId: data.baseResumeId, newId: tailored.id }, 'Tailored resume created');
  return tailored;
}

/**
 * Delete a resume.
 */
export async function deleteResume(userId: string, resumeId: string) {
  const existing = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });

  if (!existing) {
    throw new Error('Resume not found');
  }

  await prisma.resume.delete({ where: { id: resumeId } });
  logger.info({ userId, resumeId }, 'Resume deleted');
}
