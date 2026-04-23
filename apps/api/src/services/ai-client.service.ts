import logger from '../lib/logger';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * HTTP client for communicating with the Python AI service.
 * Falls back gracefully if the AI service is unavailable.
 */

export async function parseResume(fileBuffer: Buffer, mimeType: string): Promise<any> {
  try {
    const formData = new FormData();
    const uint8 = new Uint8Array(fileBuffer);
    const blob = new Blob([uint8], { type: mimeType });
    formData.append('file', blob, 'resume.' + (mimeType.includes('pdf') ? 'pdf' : 'docx'));

    const response = await fetch(`${AI_SERVICE_URL}/ai/parse-resume`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`AI service returned ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    logger.warn({ err }, 'AI service unavailable, using basic fallback parsing');
    return basicFallbackParse(fileBuffer, mimeType);
  }
}

/**
 * Basic fallback parser for when AI service is down.
 * Uses pdf-parse for PDFs and basic text extraction.
 */
async function basicFallbackParse(fileBuffer: Buffer, mimeType: string): Promise<any> {
  let rawText = '';

  if (mimeType === 'application/pdf') {
    try {
      const pdfParseModule = await import('pdf-parse');
      const pdfParse = pdfParseModule.default || pdfParseModule;
      // Provide an empty options object to avoid some pdf-parse bugs
      const data = await (pdfParse as any)(fileBuffer, { pagerender: (pageData: any) => pageData.text });
      rawText = data.text || '';
    } catch (err) {
      logger.error({ err }, 'Fallback PDF parsing failed, using empty text');
      rawText = '';
    }
  } else {
    // For DOCX, just extract as text (basic)
    rawText = fileBuffer.toString('utf-8');
  }

  // Very basic extraction using regex patterns
  const emailMatch = rawText.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = rawText.match(/[\+]?\d[\d\s()-]{7,}/);

  return {
    summary: null,
    headline: null,
    phone: phoneMatch ? phoneMatch[0].trim() : null,
    experiences: [],
    education: [],
    skills: extractSkillsFromText(rawText),
    projects: [],
    certifications: [],
    rawText,
    confidence: 0.3, // Low confidence for basic parsing
  };
}

/**
 * Extract potential skills from raw text by matching against common tech skills.
 */
function extractSkillsFromText(text: string): Array<{ name: string; category: string }> {
  const knownSkills: Record<string, string> = {
    'javascript': 'language', 'typescript': 'language', 'python': 'language',
    'java': 'language', 'c++': 'language', 'c#': 'language', 'go': 'language',
    'rust': 'language', 'ruby': 'language', 'php': 'language', 'swift': 'language',
    'kotlin': 'language', 'scala': 'language', 'r': 'language',
    'react': 'framework', 'angular': 'framework', 'vue': 'framework',
    'next.js': 'framework', 'express': 'framework', 'django': 'framework',
    'flask': 'framework', 'fastapi': 'framework', 'spring': 'framework',
    'node.js': 'framework', 'nest.js': 'framework', 'svelte': 'framework',
    'postgresql': 'database', 'mysql': 'database', 'mongodb': 'database',
    'redis': 'database', 'sqlite': 'database', 'dynamodb': 'database',
    'docker': 'tool', 'kubernetes': 'tool', 'git': 'tool', 'aws': 'cloud',
    'azure': 'cloud', 'gcp': 'cloud', 'terraform': 'tool', 'jenkins': 'tool',
    'figma': 'tool', 'linux': 'tool', 'nginx': 'tool', 'graphql': 'tool',
    'prisma': 'tool', 'tailwind': 'framework', 'sass': 'tool',
  };

  const lowerText = text.toLowerCase();
  const found: Array<{ name: string; category: string }> = [];

  for (const [skill, category] of Object.entries(knownSkills)) {
    if (lowerText.includes(skill)) {
      found.push({ name: skill.charAt(0).toUpperCase() + skill.slice(1), category });
    }
  }

  return found;
}

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/ai/health`);
    return response.ok;
  } catch {
    return false;
  }
}
