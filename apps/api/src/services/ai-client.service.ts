import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import logger from '../lib/logger';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Robust HTTP client for the AI service.
 * Handles Render's cold starts, 429 (Too Many Requests), and 503 (Service Unavailable).
 */
export async function callAI<T>(config: AxiosRequestConfig, retries = 5, backoff = 2000): Promise<T> {
  let lastError: any;

  for (let i = 0; i < retries; i++) {
    try {
      const response: AxiosResponse<T> = await axios({
        baseURL: AI_SERVICE_URL,
        timeout: 60000, // 60s timeout for cold starts
        ...config,
      });

      // Check if response is JSON
      const contentType = String(response.headers['content-type'] || '');
      if (!contentType.includes('application/json')) {
        const snippet = typeof response.data === 'string' ? response.data.substring(0, 100) : 'Non-string data';
        throw new Error(`AI service returned non-JSON response (${contentType}): ${snippet}`);
      }

      return response.data;
    } catch (err: any) {
      lastError = err;
      const status = err.response?.status;
      const isRetryable = !status || status === 429 || status === 503 || status >= 500;

      if (isRetryable && i < retries - 1) {
        const delay = backoff * Math.pow(2, i);
        logger.warn(
          { status, attempt: i + 1, delay, url: config.url },
          'AI service call failed, retrying...'
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // If not retryable or out of retries
      logger.error(
        { 
          err: err.message, 
          status, 
          url: config.url,
          responseData: err.response?.data 
        }, 
        'AI service call failed permanently'
      );
      break;
    }
  }

  throw new Error(`AI Service error: ${lastError.message}`);
}

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

    return await callAI({
      url: '/ai/parse-resume',
      method: 'POST',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
      const data = await (pdfParse as any)(fileBuffer, { pagerender: (pageData: any) => pageData.text });
      rawText = data.text || '';
    } catch (err) {
      logger.error({ err }, 'Fallback PDF parsing failed, using empty text');
      rawText = '';
    }
  } else {
    rawText = fileBuffer.toString('utf-8');
  }

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
    confidence: 0.3,
  };
}

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
    const response = await axios.get(`${AI_SERVICE_URL}/ai/health`, { timeout: 5000 });
    return response.status === 200;
  } catch {
    return false;
  }
}

