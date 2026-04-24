import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import logger from '../lib/logger';

const execFileAsync = promisify(execFile);

function getTypstBin() {
  const localPath = path.resolve(__dirname, '../../typst-bin');
  const cwdPath = path.resolve(process.cwd(), 'typst-bin');
  const monorepoPath = path.resolve(process.cwd(), 'apps/api/typst-bin');

  if (require('fs').existsSync(localPath)) return localPath;
  if (require('fs').existsSync(cwdPath)) return cwdPath;
  if (require('fs').existsSync(monorepoPath)) return monorepoPath;
  
  return process.env.TYPST_BIN || 'typst';
}

const TEMPLATES_DIR = path.resolve(__dirname, '../../../../templates');
const TMP_DIR = path.join(TEMPLATES_DIR, 'tmp');

interface ResumeData {
  profile: any;
  styles: any;
  sectionOrder: string[];
  sectionVisibility: any;
  showQrCode?: boolean;
  qrImagePath?: string;
}

export async function compilePdf(templateId: string, data: ResumeData): Promise<Buffer> {
  const bin = getTypstBin();
  logger.info(`Compiling PDF using Typst at: ${bin}`);
  
  // Debug: list files in CWD
  try {
    const files = require('fs').readdirSync(process.cwd());
    logger.info(`CWD files: ${files.join(', ')}`);
    const appDirFiles = require('fs').readdirSync(path.resolve(process.cwd(), 'apps/api'));
    logger.info(`App dir files: ${appDirFiles.join(', ')}`);
  } catch (err) {}

  const templatePath = path.join(TEMPLATES_DIR, 'resume', `${templateId}.typ`);
  return runTypst(templatePath, data, bin);
}

export async function compileCoverLetterPdf(templateId: string, data: { profile: any; content: string }): Promise<Buffer> {
  const bin = getTypstBin();
  const templatePath = path.join(TEMPLATES_DIR, 'cover-letter', `${templateId}.typ`);
  return runTypst(templatePath, data, bin);
}

async function runTypst(templatePath: string, data: any, bin: string): Promise<Buffer> {
  // Verify template exists
  try {
    await fs.access(templatePath);
  } catch {
    throw new Error(`Template not found at ${templatePath}`);
  }

  // Ensure tmp dir exists inside TEMPLATES_DIR
  await fs.mkdir(TMP_DIR, { recursive: true });

  // Create temporary filenames
  const id = Math.random().toString(36).substring(7);
  const dataFileName = `data-${id}.json`;
  const dataFilePath = path.join(TMP_DIR, dataFileName);
  
  // Create temp directory for output (can be outside templates if we use absolute output path)
  const outputTmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'scribe-typst-'));
  const outputPath = path.join(outputTmpDir, 'output.pdf');

  try {
    // Write data to a temp file instead of passing via --input to avoid Windows CLI length/escaping limits
    await fs.writeFile(dataFilePath, JSON.stringify(data));

    // Compile using --input path=... so templates can use json("/tmp/data-xxx.json")
    await execFileAsync(bin, [
      'compile',
      '--root', TEMPLATES_DIR,
      '--input', `dataPath=/tmp/${dataFileName}`,
      templatePath,
      outputPath,
    ], {
      timeout: 15000,
      cwd: TEMPLATES_DIR,
    });

    const pdfBuffer = await fs.readFile(outputPath);
    return pdfBuffer;
  } finally {
    // Cleanup
    try {
      await fs.unlink(dataFilePath);
      await fs.rm(outputTmpDir, { recursive: true, force: true });
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
