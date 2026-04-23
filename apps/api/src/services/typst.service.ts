import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import logger from '../lib/logger';

const execFileAsync = promisify(execFile);

const TYPST_BIN = process.env.TYPST_BIN || 'typst';
const TEMPLATES_DIR = path.resolve(process.cwd(), '../../templates');

interface ResumeData {
  profile: any;
  styles: any;
  sectionOrder: string[];
  sectionVisibility: any;
}

export async function compilePdf(templateId: string, data: ResumeData): Promise<Buffer> {
  const templatePath = path.join(TEMPLATES_DIR, 'resume', `${templateId}.typ`);
  const dataPath = path.join(TEMPLATES_DIR, 'resume', 'data.json');
  return runTypst(templatePath, dataPath, data);
}

export async function compileCoverLetterPdf(templateId: string, data: { profile: any; content: string }): Promise<Buffer> {
  const templatePath = path.join(TEMPLATES_DIR, 'cover-letter', `${templateId}.typ`);
  const dataPath = path.join(TEMPLATES_DIR, 'cover-letter', 'data.json');
  return runTypst(templatePath, dataPath, data);
}

async function runTypst(templatePath: string, dataPath: string, data: any): Promise<Buffer> {
  // Verify template exists
  try {
    await fs.access(templatePath);
  } catch {
    throw new Error(`Template not found at ${templatePath}`);
  }

  // Create temp directory for this compilation
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'scribe-typst-'));
  const outputPath = path.join(tmpDir, 'output.pdf');

  try {
    // Write data JSON
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8');

    // Compile
    const { stderr } = await execFileAsync(TYPST_BIN, [
      'compile',
      '--root', TEMPLATES_DIR,
      templatePath,
      outputPath,
    ], {
      timeout: 15000,
      cwd: TEMPLATES_DIR,
    });

    if (stderr) logger.warn({ stderr }, 'Typst compilation warnings');

    const pdfBuffer = await fs.readFile(outputPath);
    return pdfBuffer;
  } finally {
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
      await fs.unlink(dataPath).catch(() => {});
    } catch {}
  }
}

/**
 * Get list of available templates from templates.json.
 */
export async function getAvailableTemplates() {
  const metadataPath = path.join(TEMPLATES_DIR, 'resume', 'templates.json');
  const raw = await fs.readFile(metadataPath, 'utf-8');
  return JSON.parse(raw);
}
