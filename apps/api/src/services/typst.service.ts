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

function resolveTemplatesDir(): string {
  const candidates = [
    path.resolve(__dirname, '../../../../templates'),   // from src/services/ in dev
    path.resolve(__dirname, '../../../templates'),       // from dist/services/ in prod
    path.resolve(process.cwd(), 'templates'),            // monorepo root when cwd=project
    path.resolve(process.cwd(), '../../templates'),      // from apps/api/
    path.resolve(process.cwd(), 'apps/api/templates'),   // Vercel monorepo
  ];
  for (const dir of candidates) {
    if (require('fs').existsSync(dir)) return dir;
  }
  return candidates[0]; // fallback
}

const TEMPLATES_DIR = resolveTemplatesDir();
const TMP_DIR = path.join(os.tmpdir(), 'scribe-typst-data');

interface ResumeData {
  profile: any;
  styles: any;
  sectionOrder: string[];
  sectionVisibility: any;
  showQrCode?: boolean;
  showProfileImage?: boolean;
  qrImagePath?: string;
  profileImagePath?: string;
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

  // Ensure tmp dir exists — try inside TEMPLATES_DIR first, fall back to os.tmpdir()
  let tmpDir: string;
  let dataPathPrefix: string;
  let typstRoot: string;

  try {
    tmpDir = path.join(TEMPLATES_DIR, 'tmp');
    await fs.mkdir(tmpDir, { recursive: true });
    // Test write access
    const testFile = path.join(tmpDir, '.write-test');
    await fs.writeFile(testFile, '');
    await fs.unlink(testFile);
    dataPathPrefix = '/tmp';
    typstRoot = TEMPLATES_DIR;
  } catch {
    // TEMPLATES_DIR is read-only (serverless) — stage everything in os.tmpdir
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'scribe-typst-stage-'));
    dataPathPrefix = '/data';
    typstRoot = tmpDir;
    // Copy templates into the staging dir so Typst can find them
    const templateRelative = path.relative(TEMPLATES_DIR, templatePath);
    const stagedTemplate = path.join(tmpDir, templateRelative);
    await fs.mkdir(path.dirname(stagedTemplate), { recursive: true });
    await fs.copyFile(templatePath, stagedTemplate);
    // Also copy any shared files (like common.typ) if they exist
    try {
      const sharedDir = path.join(TEMPLATES_DIR, 'shared');
      if (require('fs').existsSync(sharedDir)) {
        await fs.cp(sharedDir, path.join(tmpDir, 'shared'), { recursive: true });
      }
    } catch {}
    templatePath = stagedTemplate;
    await fs.mkdir(path.join(tmpDir, 'data'), { recursive: true });
    tmpDir = path.join(tmpDir, 'data');
  }

  // Create temporary filenames
  const id = Math.random().toString(36).substring(7);
  const dataFileName = `data-${id}.json`;
  const dataFilePath = path.join(tmpDir, dataFileName);
  
  // Create temp directory for output
  const outputTmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'scribe-typst-'));
  const outputPath = path.join(outputTmpDir, 'output.pdf');

  try {
    // Write data to a temp file instead of passing via --input to avoid Windows CLI length/escaping limits
    await fs.writeFile(dataFilePath, JSON.stringify(data));

    // Compile using --input path=... so templates can use json("tmp/data-xxx.json")
    await execFileAsync(bin, [
      'compile',
      '--root', typstRoot,
      '--input', `dataPath=${dataPathPrefix}/${dataFileName}`,
      templatePath,
      outputPath,
    ], {
      timeout: 15000,
      cwd: typstRoot,
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
