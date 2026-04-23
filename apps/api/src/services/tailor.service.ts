import logger from '../lib/logger';
import prisma from '../lib/prisma';
import * as jobService from './job.service';
import * as emailService from './email.service';
import * as exportService from './export.service';

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
    const tailoredData = sanitizeTailoredContent(data.data);
    await prisma.resume.update({
      where: { id: resumeId },
      data: { tailoredContent: tailoredData },
    });

    return tailoredData;
  } catch (err: any) {
    logger.error({ err }, 'Resume tailoring failed');
    throw new Error(`Tailoring error: ${err.message}`);
  }
}

/**
 * Sanitize AI-generated tailored content.
 */
function sanitizeTailoredContent(data: any) {
  if (!data) return data;
  const sanitized = { ...data };

  // Sanitize summary
  if (sanitized.summary) sanitized.summary = cleanAIString(sanitized.summary);

  // Sanitize experiences
  if (Array.isArray(sanitized.experiences)) {
    sanitized.experiences = sanitized.experiences.map((exp: any) => ({
      ...exp,
      bullets: Array.isArray(exp.bullets) ? exp.bullets.map(cleanAIString) : exp.bullets
    }));
  }

  // Sanitize projects
  if (Array.isArray(sanitized.projects)) {
    sanitized.projects = sanitized.projects.map((proj: any) => ({
      ...proj,
      bullets: Array.isArray(proj.bullets) ? proj.bullets.map(cleanAIString) : proj.bullets
    }));
  }

  // Sanitize suggestions array (this is what the frontend mostly sees)
  if (Array.isArray(sanitized.suggestions)) {
    sanitized.suggestions = sanitized.suggestions.map((s: any) => ({
      ...s,
      tailored: cleanAIString(s.tailored),
      original: cleanAIString(s.original)
    }));
  }

  return sanitized;
}

/**
 * Clean up strings from AI that might be wrapped in quotes or JSON-like artifacts.
 */
function cleanAIString(str: any): string {
  if (typeof str !== 'string') return String(str || '');
  let cleaned = str.trim();

  // Remove leading/trailing quotes
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  // If it looks like a JSON fragment from a bad AI response, try to extract the main text
  if (cleaned.startsWith('{') && cleaned.includes(':')) {
    try {
      const parsed = JSON.parse(cleaned);
      // If it's a simple object with one value, take that value
      const values = Object.values(parsed);
      if (values.length > 0) return String(values[0]);
    } catch {
      // Not valid JSON, just continue
    }
  }

  return cleaned;
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
        content: cleanAIString(result.content),
        tone: data.tone || 'formal',
      },
    });

    return coverLetter;
  } catch (err: any) {
    logger.error({ err }, 'Cover letter generation failed');
    throw new Error(`Cover letter error: ${err.message}`);
  }
}

/**
 * Send tailored documents via email.
 */
export async function sendTailoredEmail(userId: string, resumeId: string, jobId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.email) throw new Error('User email not found');

  const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
  if (!resume) throw new Error('Resume not found');

  const job = await prisma.job.findFirst({ where: { id: jobId, userId } });
  if (!job) throw new Error('Job not found');

  // Find latest cover letter for this job/resume
  const coverLetter = await prisma.coverLetter.findFirst({
    where: { jobId, resumeId, userId },
    orderBy: { createdAt: 'desc' },
  });

  // Generate Resume PDF
  const profile = (resume.tailoredContent || resume.baseProfileSnapshot) as any;
  if (!profile) throw new Error('No content found to send');

  const resumePdf = await exportService.exportPdf(userId, resumeId);
  
  const attachments: any[] = [
    {
      filename: `Tailored_Resume_${job.company.replace(/\s+/g, '_')}.pdf`,
      content: resumePdf,
    }
  ];

  if (coverLetter) {
    const clPdf = await exportService.exportCoverLetterPdf(userId, coverLetter.id);
    attachments.push({
      filename: `Cover_Letter_${job.company.replace(/\s+/g, '_')}.pdf`,
      content: clPdf,
    });
  }

  return emailService.sendTailoredDocs(
    user.email,
    user.name || 'there',
    job.title,
    job.company,
    attachments
  );
}
