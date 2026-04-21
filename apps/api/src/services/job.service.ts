import prisma from '../lib/prisma';
import logger from '../lib/logger';
import { CreateJobInput, UpdateJobInput } from '../schemas/job.schema';

export async function createJob(userId: string, data: CreateJobInput) {
  const job = await prisma.job.create({
    data: {
      userId,
      title: data.title,
      company: data.company,
      location: data.location || null,
      url: data.url || null,
      source: data.source || 'manual',
      rawDescription: data.rawDescription,
    },
  });
  logger.info({ userId, jobId: job.id }, 'Job created');
  return job;
}

export async function getJobs(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        url: true,
        source: true,
        matchScore: true,
        companyTone: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.job.count({ where: { userId } }),
  ]);
  return { data: jobs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getJobById(userId: string, jobId: string) {
  const job = await prisma.job.findFirst({ where: { id: jobId, userId } });
  if (!job) throw new Error('Job not found');
  return job;
}

export async function updateJob(userId: string, jobId: string, data: UpdateJobInput) {
  const existing = await prisma.job.findFirst({ where: { id: jobId, userId } });
  if (!existing) throw new Error('Job not found');

  const updated = await prisma.job.update({
    where: { id: jobId },
    data: {
      title: data.title,
      company: data.company,
      location: data.location,
      url: data.url,
      parsedKeywords: data.parsedKeywords !== undefined ? data.parsedKeywords : undefined,
      companyTone: data.companyTone,
      matchScore: data.matchScore,
      matchBreakdown: data.matchBreakdown !== undefined ? data.matchBreakdown : undefined,
    },
  });
  logger.info({ userId, jobId }, 'Job updated');
  return updated;
}

export async function deleteJob(userId: string, jobId: string) {
  const existing = await prisma.job.findFirst({ where: { id: jobId, userId } });
  if (!existing) throw new Error('Job not found');
  await prisma.job.delete({ where: { id: jobId } });
  logger.info({ userId, jobId }, 'Job deleted');
}
