import prisma from '../lib/prisma';
import logger from '../lib/logger';
import { CreateApplicationInput, UpdateApplicationInput } from '../schemas/application.schema';

export async function createApplication(userId: string, data: CreateApplicationInput) {
  // Verify job belongs to user
  const job = await prisma.job.findFirst({ where: { id: data.jobId, userId } });
  if (!job) throw new Error('Job not found');

  const application = await prisma.application.create({
    data: {
      userId,
      jobId: data.jobId,
      resumeId: data.resumeId || null,
      coverLetterId: data.coverLetterId || null,
      status: data.status || 'saved',
      appliedAt: data.appliedAt ? new Date(data.appliedAt) : null,
      notes: data.notes || null,
      contactName: data.contactName || null,
      contactEmail: data.contactEmail || null,
      salaryRange: data.salaryRange || null,
      nextDeadline: data.nextDeadline ? new Date(data.nextDeadline) : null,
    },
    include: { job: { select: { title: true, company: true, location: true, matchScore: true } } },
  });
  logger.info({ userId, appId: application.id }, 'Application created');
  return application;
}

export async function getApplications(userId: string) {
  const applications = await prisma.application.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      job: { select: { id: true, title: true, company: true, location: true, matchScore: true } },
      resume: { select: { id: true, name: true } },
    },
  });
  return applications;
}

export async function getApplicationById(userId: string, appId: string) {
  const application = await prisma.application.findFirst({
    where: { id: appId, userId },
    include: {
      job: { select: { id: true, title: true, company: true, location: true, url: true, matchScore: true, rawDescription: true } },
      resume: { select: { id: true, name: true, templateId: true } },
    },
  });
  if (!application) throw new Error('Application not found');
  return application;
}

export async function updateApplication(userId: string, appId: string, data: UpdateApplicationInput) {
  const existing = await prisma.application.findFirst({ where: { id: appId, userId } });
  if (!existing) throw new Error('Application not found');

  const updated = await prisma.application.update({
    where: { id: appId },
    data: {
      ...data,
      appliedAt: data.appliedAt !== undefined ? (data.appliedAt ? new Date(data.appliedAt) : null) : undefined,
      nextDeadline: data.nextDeadline !== undefined ? (data.nextDeadline ? new Date(data.nextDeadline) : null) : undefined,
    },
    include: { job: { select: { title: true, company: true, location: true, matchScore: true } } },
  });
  logger.info({ userId, appId }, 'Application updated');
  return updated;
}

export async function updateStatus(userId: string, appId: string, status: string) {
  const existing = await prisma.application.findFirst({ where: { id: appId, userId } });
  if (!existing) throw new Error('Application not found');

  const data: any = { status };
  // Auto-set appliedAt when moving to 'applied'
  if (status === 'applied' && !existing.appliedAt) {
    data.appliedAt = new Date();
  }

  const updated = await prisma.application.update({
    where: { id: appId },
    data,
    include: { job: { select: { title: true, company: true, location: true, matchScore: true } } },
  });
  logger.info({ userId, appId, status }, 'Application status updated');
  return updated;
}

export async function deleteApplication(userId: string, appId: string) {
  const existing = await prisma.application.findFirst({ where: { id: appId, userId } });
  if (!existing) throw new Error('Application not found');
  await prisma.application.delete({ where: { id: appId } });
  logger.info({ userId, appId }, 'Application deleted');
}

export async function getStats(userId: string) {
  const all = await prisma.application.findMany({
    where: { userId },
    select: { status: true, appliedAt: true, createdAt: true },
  });

  const total = all.length;
  const applied = all.filter((a) => a.status !== 'saved').length;
  const screening = all.filter((a) => a.status === 'screening').length;
  const interviews = all.filter((a) => a.status === 'interview').length;
  const offers = all.filter((a) => a.status === 'offer').length;
  const rejected = all.filter((a) => a.status === 'rejected').length;

  const responseRate = applied > 0 ? Math.round(((screening + interviews + offers + rejected) / applied) * 100) : 0;
  const interviewRate = applied > 0 ? Math.round((interviews / applied) * 100) : 0;
  const offerRate = interviews > 0 ? Math.round((offers / interviews) * 100) : 0;

  // Weekly activity for charts (last 8 weeks)
  const weeklyActivity: { week: string; count: number }[] = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const count = all.filter((a) => {
      const date = a.appliedAt || a.createdAt;
      return date >= weekStart && date < weekEnd;
    }).length;

    weeklyActivity.push({
      week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count,
    });
  }

  // Avg ATS score
  const resumes = await prisma.resume.findMany({
    where: { userId, atsScore: { not: null } },
    select: { atsScore: true },
  });
  const avgAts = resumes.length > 0 ? Math.round(resumes.reduce((sum, r) => sum + (r.atsScore || 0), 0) / resumes.length) : null;

  return {
    total,
    applied,
    screening,
    interviews,
    offers,
    rejected,
    responseRate,
    interviewRate,
    offerRate,
    avgAtsScore: avgAts,
    weeklyActivity,
    resumeCount: await prisma.resume.count({ where: { userId } }),
  };
}
