import logger from '../lib/logger';
import prisma from '../lib/prisma';
import * as jobService from './job.service';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

interface AnalyzeInput {
  text?: string;
  url?: string;
  title?: string;
  company?: string;
}

/**
 * Full analysis flow: parse JD → create job → compute match score.
 */
export async function analyzeJob(userId: string, resumeId: string, input: AnalyzeInput) {
  let jdText = input.text || '';

  // If URL provided, fetch text first
  if (input.url && !jdText) {
    try {
      const fetchRes = await fetch(`${AI_SERVICE_URL}/ai/fetch-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: input.url }),
      });
      const fetchData = await fetchRes.json();
      if (fetchData.success && fetchData.data?.text) {
        jdText = fetchData.data.text;
      } else {
        throw new Error(fetchData.detail || 'Failed to fetch URL');
      }
    } catch (err: any) {
      logger.error({ err }, 'URL fetch failed');
      throw new Error(`Could not fetch job from URL: ${err.message}`);
    }
  }

  if (!jdText) throw new Error('No job description text provided');

  // Parse JD keywords
  let parsedKeywords: any;
  try {
    const parseRes = await fetch(`${AI_SERVICE_URL}/ai/parse-jd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: jdText }),
    });
    const parseData = await parseRes.json();
    if (parseData.success) {
      parsedKeywords = parseData.data;
    } else {
      throw new Error('JD parsing failed');
    }
  } catch (err: any) {
    logger.error({ err }, 'JD parsing failed');
    throw new Error(`JD parsing error: ${err.message}`);
  }

  // Get resume profile snapshot for matching
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });
  if (!resume) throw new Error('Resume not found');

  const profile = resume.baseProfileSnapshot as any;
  if (!profile) throw new Error('Resume has no profile data');

  // Compute match score
  let matchResult: any = { score: 0, strong: [], partial: [], gaps: [] };
  try {
    const matchRes = await fetch(`${AI_SERVICE_URL}/ai/match-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, jdKeywords: parsedKeywords }),
    });
    const matchData = await matchRes.json();
    if (matchData.success) {
      matchResult = matchData.data;
    }
  } catch (err: any) {
    logger.warn({ err }, 'Match scoring failed, using default');
  }

  // Create/update job record
  const job = await jobService.createJob(userId, {
    title: input.title || parsedKeywords.title || 'Untitled Position',
    company: input.company || parsedKeywords.company || 'Unknown Company',
    rawDescription: jdText,
    url: input.url || '',
    source: input.url ? 'linkedin' : 'manual',
  });

  // Update job with parsed data
  await jobService.updateJob(userId, job.id, {
    parsedKeywords,
    companyTone: parsedKeywords.tone,
    matchScore: matchResult.score,
    matchBreakdown: matchResult,
  });

  // Update resume match score
  await prisma.resume.update({
    where: { id: resumeId },
    data: { matchScore: matchResult.score, jobId: job.id },
  });

  return {
    jobId: job.id,
    jdText,
    parsedKeywords,
    matchResult,
  };
}

/**
 * Tailor a resume using the AI service.
 */
export async function tailorResume(userId: string, resumeId: string, jobId: string) {
  const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
  if (!resume) throw new Error('Resume not found');

  const job = await prisma.job.findFirst({ where: { id: jobId, userId } });
  if (!job) throw new Error('Job not found');

  const profile = resume.baseProfileSnapshot as any;
  const jdKeywords = job.parsedKeywords as any;

  if (!profile || !jdKeywords) throw new Error('Missing profile or JD data');

  try {
    const res = await fetch(`${AI_SERVICE_URL}/ai/tailor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile,
        jdKeywords,
        jdText: job.rawDescription,
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error('Tailoring failed');

    // Store tailored content on the resume
    await prisma.resume.update({
      where: { id: resumeId },
      data: { tailoredContent: data.data },
    });

    return data.data;
  } catch (err: any) {
    logger.error({ err }, 'Resume tailoring failed');
    throw new Error(`Tailoring error: ${err.message}`);
  }
}

/**
 * Generate a cover letter via the AI service.
 */
export async function generateCoverLetter(userId: string, data: {
  resumeId: string;
  jobId?: string;
  tone?: string;
  jdText?: string;
  jobTitle?: string;
}) {
  const resume = await prisma.resume.findFirst({ where: { id: data.resumeId, userId } });
  if (!resume) throw new Error('Resume not found');

  let jobDescription = data.jdText || '';
  let jobKeywords = {};
  let clTitle = data.jobTitle || 'Custom Cover Letter';

  if (data.jobId) {
    const job = await prisma.job.findFirst({ where: { id: data.jobId, userId } });
    if (job) {
      jobDescription = job.rawDescription;
      jobKeywords = job.parsedKeywords as any;
      clTitle = `Cover Letter - ${job.title} at ${job.company}`;
    }
  }

  if (!jobDescription) throw new Error('Job description is required');

  const profile = resume.baseProfileSnapshot as any;

  try {
    const res = await fetch(`${AI_SERVICE_URL}/ai/cover-letter/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile,
        jd_text: jobDescription,
        jd_keywords: jobKeywords || {},
        tone: data.tone || 'formal',
        stream: false,
      }),
    });
    const result = await res.json();
    if (!result.content) throw new Error('Cover letter generation failed');

    // Save to DB
    const coverLetter = await prisma.coverLetter.create({
      data: {
        userId,
        resumeId: data.resumeId,
        jobId: data.jobId || null,
        title: clTitle,
        content: result.content,
        tone: data.tone || 'formal',
      },
    });

    return coverLetter;
  } catch (err: any) {
    logger.error({ err }, 'Cover letter generation failed');
    throw new Error(`Cover letter error: ${err.message}`);
  }
}
