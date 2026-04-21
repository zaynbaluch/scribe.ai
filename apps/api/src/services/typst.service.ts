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

/**
 * Compile a Typst template to PDF.
 * 1. Write resume data as JSON to a temp file next to the template
 * 2. Run `typst compile template.typ output.pdf`
 * 3. Read the PDF buffer
 * 4. Clean up temp files
 */
export async function compilePdf(templateId: string, data: ResumeData): Promise<Buffer> {
  const templatePath = path.join(TEMPLATES_DIR, 'resume', `${templateId}.typ`);

  // Verify template exists
  try {
    await fs.access(templatePath);
  } catch {
    throw new Error(`Template "${templateId}" not found at ${templatePath}`);
  }

  // Create temp directory for this compilation
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'scribe-typst-'));
  const dataPath = path.join(TEMPLATES_DIR, 'resume', 'data.json');
  const outputPath = path.join(tmpDir, 'output.pdf');

  try {
    // Write data JSON (placed next to templates so they can import it)
    const jsonData = {
      profile: data.profile,
      styles: data.styles || {},
      sectionOrder: data.sectionOrder || ['summary', 'experience', 'skills', 'projects', 'education'],
      sectionVisibility: data.sectionVisibility || {},
    };

    await fs.writeFile(dataPath, JSON.stringify(jsonData, null, 2), 'utf-8');

    // Compile
    logger.info({ templateId, outputPath }, 'Compiling Typst template');

    const { stdout, stderr } = await execFileAsync(TYPST_BIN, [
      'compile',
      '--root', TEMPLATES_DIR,
      templatePath,
      outputPath,
    ], {
      timeout: 15000, // 15s timeout
      cwd: TEMPLATES_DIR,
    });

    if (stderr) {
      logger.warn({ stderr }, 'Typst compilation warnings');
    }

    // Read the output PDF
    const pdfBuffer = await fs.readFile(outputPath);

    logger.info({ templateId, size: pdfBuffer.length }, 'PDF compiled successfully');
    return pdfBuffer;
  } finally {
    // Clean up
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
      await fs.unlink(dataPath).catch(() => {}); // Clean up data.json
    } catch {
      // Ignore cleanup errors
    }
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
