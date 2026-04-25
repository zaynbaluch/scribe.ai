import { prisma } from '../lib/prisma';
import * as aiClient from './ai-client.service';

export class CoverLetterService {
  static async generateCoverLetter(userId: string, resumeId: string, jobId: string, tone: string = 'formal') {
    // 1. Fetch Resume & Job
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      select: { baseProfileSnapshot: true, tailoredContent: true }
    });

    if (!resume) throw new Error('Resume not found');

    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) throw new Error('Job not found');

    const profileToUse = resume.tailoredContent || resume.baseProfileSnapshot;

    // 2. Call AI Service to generate cover letter content
    const response = await aiClient.callAI<any>({
      url: '/ai/cover-letter/generate',
      method: 'POST',
      data: {
        profile: profileToUse,
        jd_keywords: job.parsedKeywords || {},
        jd_text: job.rawDescription,
        tone: tone
      }
    });

    const content = response.content;

    // 3. Save to database
    const coverLetter = await prisma.coverLetter.create({
      data: {
        userId,
        resumeId,
        jobId,
        title: `Cover Letter - ${job.title} at ${job.company}`,
        content,
        tone
      }
    });

    return coverLetter;
  }

  static async getCoverLettersByUser(userId: string) {
    return prisma.coverLetter.findMany({
      where: { userId },
      include: {
        job: { select: { title: true, company: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  static async getCoverLetter(id: string, userId: string) {
    const cl = await prisma.coverLetter.findUnique({ where: { id } });
    if (!cl || cl.userId !== userId) throw new Error('Cover letter not found');
    return cl;
  }

  static async updateCoverLetter(id: string, userId: string, data: any) {
    return prisma.coverLetter.update({
      where: { id, userId }, // Ensure user owns it
      data
    });
  }

  static async deleteCoverLetter(id: string, userId: string) {
    return prisma.coverLetter.delete({
      where: { id, userId }
    });
  }
}
