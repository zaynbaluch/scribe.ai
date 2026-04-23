import prisma from '../lib/prisma';
import logger from '../lib/logger';
import { compilePdf, compileCoverLetterPdf } from './typst.service';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr || '';
  }
}

/**
 * Export a resume as PDF via Typst compilation.
 */
export async function exportPdf(userId: string, resumeId: string): Promise<Buffer> {
  const resume = await getResumeWithValidation(userId, resumeId);

  const snapshot = { ...resume.baseProfileSnapshot as any };
  if (!snapshot) {
    throw new Error('Resume has no profile snapshot. Please recreate it.');
  }

  // Filter invisible items
  if (snapshot.experiences) snapshot.experiences = snapshot.experiences.filter((e: any) => e.visible !== false);
  if (snapshot.education) snapshot.education = snapshot.education.filter((e: any) => e.visible !== false);
  if (snapshot.projects) snapshot.projects = snapshot.projects.filter((p: any) => p.visible !== false);

  const pdfBuffer = await compilePdf(resume.templateId, {
    profile: snapshot,
    styles: resume.customStyles || {},
    sectionOrder: resume.sectionOrder,
    sectionVisibility: (resume.sectionVisibility as any) || {},
  });

  return pdfBuffer;
}

/**
 * Export a resume as DOCX.
 */
export async function exportDocx(userId: string, resumeId: string): Promise<Buffer> {
  const resume = await getResumeWithValidation(userId, resumeId);
  const profile = { ...resume.baseProfileSnapshot as any };
  if (!profile) throw new Error('Resume has no profile snapshot.');

  // Filter invisible items
  if (profile.experiences) profile.experiences = profile.experiences.filter((e: any) => e.visible !== false);
  if (profile.education) profile.education = profile.education.filter((e: any) => e.visible !== false);
  if (profile.projects) profile.projects = profile.projects.filter((p: any) => p.visible !== false);

  const vis = (resume.sectionVisibility as any) || {};
  const sections: any[] = [];

  // Header
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: profile.name || 'Your Name', bold: true, size: 32, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
    })
  );
  if (profile.headline) {
    sections.push(new Paragraph({
      children: [new TextRun({ text: profile.headline, italics: true, size: 22, color: '666666', font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
    }));
  }

  // Contact row
  const contactParts = [profile.email, profile.phone, profile.location, profile.website].filter(Boolean);
  if (contactParts.length > 0) {
    sections.push(new Paragraph({
      children: [new TextRun({ text: contactParts.join(' | '), size: 18, color: '888888', font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }));
  }

  // Sections based on sectionOrder
  for (const section of resume.sectionOrder) {
    if (vis[section] === false) continue;

    if (section === 'summary' && profile.summary) {
      sections.push(createDocxHeading('Summary'));
      sections.push(new Paragraph({ children: [new TextRun({ text: profile.summary, size: 20, font: 'Calibri' })], spacing: { after: 100 } }));
    }

    if (section === 'experience' && profile.experiences?.length > 0) {
      sections.push(createDocxHeading('Experience'));
      for (const exp of profile.experiences) {
        sections.push(new Paragraph({
          children: [
            new TextRun({ text: exp.title || '', bold: true, size: 21, font: 'Calibri' }),
            new TextRun({ text: ` — ${exp.company || ''}`, size: 21, font: 'Calibri' }),
          ],
        }));
        const dateStr = [formatDate(exp.startDate), exp.current ? 'Present' : formatDate(exp.endDate)].filter(Boolean).join(' - ');
        if (dateStr) {
          sections.push(new Paragraph({
            children: [new TextRun({ text: dateStr, size: 18, color: '888888', font: 'Calibri' })],
          }));
        }
        for (const bullet of (exp.bullets || [])) {
          if (bullet) {
            sections.push(new Paragraph({
              children: [new TextRun({ text: bullet, size: 20, font: 'Calibri' })],
              bullet: { level: 0 },
            }));
          }
        }
        sections.push(new Paragraph({ spacing: { after: 100 } }));
      }
    }

    if (section === 'education' && profile.education?.length > 0) {
      sections.push(createDocxHeading('Education'));
      for (const edu of profile.education) {
        const degree = [edu.degree, edu.field].filter(Boolean).join(' in ');
        sections.push(new Paragraph({
          children: [
            new TextRun({ text: degree, bold: true, size: 21, font: 'Calibri' }),
            new TextRun({ text: ` — ${edu.institution || ''}`, size: 21, font: 'Calibri' }),
            new TextRun({ text: ` (${formatDate(edu.startDate)}${edu.endDate ? ' - ' + formatDate(edu.endDate) : ''})`, size: 18, color: '888888', font: 'Calibri' }),
          ],
        }));
        sections.push(new Paragraph({ spacing: { after: 80 } }));
      }
    }

    if (section === 'skills' && profile.skills?.length > 0) {
      sections.push(createDocxHeading('Skills'));
      const skillText = profile.skills.map((s: any) => s.name).join(', ');
      sections.push(new Paragraph({
        children: [new TextRun({ text: skillText, size: 20, font: 'Calibri' })],
        spacing: { after: 100 },
      }));
    }

    if (section === 'projects' && profile.projects?.length > 0) {
      sections.push(createDocxHeading('Projects'));
      for (const proj of profile.projects) {
        sections.push(new Paragraph({
          children: [new TextRun({ text: proj.name || '', bold: true, size: 21, font: 'Calibri' })],
        }));
        if (proj.description) {
          sections.push(new Paragraph({
            children: [new TextRun({ text: proj.description, size: 20, font: 'Calibri' })],
          }));
        }
        for (const bullet of (proj.bullets || [])) {
          if (bullet) {
            sections.push(new Paragraph({
              children: [new TextRun({ text: bullet, size: 20, font: 'Calibri' })],
              bullet: { level: 0 },
            }));
          }
        }
        sections.push(new Paragraph({ spacing: { after: 80 } }));
      }
    }
  }

  const doc = new Document({ sections: [{ children: sections }] });
  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}

/**
 * Export a resume as plain text.
 */
export async function exportTxt(userId: string, resumeId: string): Promise<string> {
  const resume = await getResumeWithValidation(userId, resumeId);
  const profile = { ...resume.baseProfileSnapshot as any };
  if (!profile) throw new Error('Resume has no profile snapshot.');

  // Filter invisible items
  if (profile.experiences) profile.experiences = profile.experiences.filter((e: any) => e.visible !== false);
  if (profile.education) profile.education = profile.education.filter((e: any) => e.visible !== false);
  if (profile.projects) profile.projects = profile.projects.filter((p: any) => p.visible !== false);

  const vis = (resume.sectionVisibility as any) || {};
  const lines: string[] = [];

  lines.push(profile.name || 'Your Name');
  if (profile.headline) lines.push(profile.headline);
  const contact = [profile.email, profile.phone, profile.location, profile.website].filter(Boolean);
  if (contact.length) lines.push(contact.join(' | '));
  lines.push('');

  for (const section of resume.sectionOrder) {
    if (vis[section] === false) continue;

    if (section === 'summary' && profile.summary) {
      lines.push('SUMMARY');
      lines.push('-'.repeat(40));
      lines.push(profile.summary);
      lines.push('');
    }

    if (section === 'experience' && profile.experiences?.length > 0) {
      lines.push('EXPERIENCE');
      lines.push('-'.repeat(40));
      for (const exp of profile.experiences) {
        lines.push(`${exp.title} — ${exp.company}`);
        const dateStr = [formatDate(exp.startDate), exp.current ? 'Present' : formatDate(exp.endDate)].filter(Boolean).join(' - ');
        if (dateStr) lines.push(dateStr);
        for (const bullet of (exp.bullets || [])) { if (bullet) lines.push(`  * ${bullet}`); }
        lines.push('');
      }
    }

    if (section === 'education' && profile.education?.length > 0) {
      lines.push('EDUCATION');
      lines.push('-'.repeat(40));
      for (const edu of profile.education) {
        lines.push(`${edu.degree}${edu.field ? ' in ' + edu.field : ''} — ${edu.institution} (${formatDate(edu.startDate)}${edu.endDate ? ' - ' + formatDate(edu.endDate) : ''})`);
      }
      lines.push('');
    }

    if (section === 'skills' && profile.skills?.length > 0) {
      lines.push('SKILLS');
      lines.push('-'.repeat(40));
      lines.push(profile.skills.map((s: any) => s.name).join(', '));
      lines.push('');
    }

    if (section === 'projects' && profile.projects?.length > 0) {
      lines.push('PROJECTS');
      lines.push('-'.repeat(40));
      for (const proj of profile.projects) {
        lines.push(proj.name);
        if (proj.description) lines.push(proj.description);
        lines.push('');
      }
    }
  }

  return lines.join('\n');
}

/**
 * Export resume as raw JSON.
 */
export async function exportJson(userId: string, resumeId: string): Promise<any> {
  return getResumeWithValidation(userId, resumeId);
}

/**
 * Export cover letter as PDF.
 */
export async function exportCoverLetterPdf(userId: string, id: string): Promise<Buffer> {
  const cl = await getCoverLetterWithValidation(userId, id);
  const resume = await prisma.resume.findUnique({ where: { id: cl.resumeId } });
  const profile = (resume?.baseProfileSnapshot as any) || {};

  return compileCoverLetterPdf('default', {
    profile,
    content: cl.content
  });
}

/**
 * Export cover letter as DOCX.
 */
export async function exportCoverLetterDocx(userId: string, id: string): Promise<Buffer> {
  const cl = await getCoverLetterWithValidation(userId, id);
  const resume = await prisma.resume.findUnique({ where: { id: cl.resumeId } });
  const profile = (resume?.baseProfileSnapshot as any) || {};

  const sections: any[] = [];
  
  // Header (similar to resume)
  sections.push(new Paragraph({
    children: [new TextRun({ text: profile.name || 'Your Name', bold: true, size: 28, font: 'Calibri' })],
    alignment: AlignmentType.RIGHT,
  }));
  sections.push(new Paragraph({
    children: [new TextRun({ text: `${profile.email} | ${profile.phone}`, size: 18, color: '666666', font: 'Calibri' })],
    alignment: AlignmentType.RIGHT,
    spacing: { after: 400 },
  }));

  // Date
  sections.push(new Paragraph({
    children: [new TextRun({ text: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), size: 20, font: 'Calibri' })],
    spacing: { after: 200 },
  }));

  sections.push(new Paragraph({
    children: [new TextRun({ text: "Dear Hiring Manager,", size: 20, font: 'Calibri' })],
    spacing: { after: 200 },
  }));

  // Body - Strip basic HTML if any
  const cleanContent = cl.content.replace(/<[^>]*>/g, '\n').replace(/\n\n+/g, '\n\n');
  const paragraphs = cleanContent.split('\n');
  for (const p of paragraphs) {
    if (p.trim()) {
      sections.push(new Paragraph({
        children: [new TextRun({ text: p.trim(), size: 20, font: 'Calibri' })],
        spacing: { after: 150 },
      }));
    }
  }

  sections.push(new Paragraph({
    children: [new TextRun({ text: "Sincerely,", size: 20, font: 'Calibri' })],
    spacing: { before: 200, after: 100 },
  }));
  sections.push(new Paragraph({
    children: [new TextRun({ text: profile.name || 'Your Name', size: 20, bold: true, font: 'Calibri' })],
  }));

  const doc = new Document({ sections: [{ children: sections }] });
  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}

/**
 * Export cover letter as plain text.
 */
export async function exportCoverLetterTxt(userId: string, id: string): Promise<string> {
  const cl = await getCoverLetterWithValidation(userId, id);
  const resume = await prisma.resume.findUnique({ where: { id: cl.resumeId } });
  const profile = (resume?.baseProfileSnapshot as any) || {};

  const lines: string[] = [];
  lines.push(profile.name || 'Your Name');
  lines.push(`${profile.email} | ${profile.phone}`);
  lines.push('');
  lines.push(new Date().toLocaleDateString());
  lines.push('');
  lines.push("Dear Hiring Manager,");
  lines.push('');
  lines.push(cl.content.replace(/<[^>]*>/g, ''));
  lines.push('');
  lines.push("Sincerely,");
  lines.push(profile.name || 'Your Name');

  return lines.join('\n');
}

// ─── Helper ─────────────────────────────────────────────────────────────────

function createDocxHeading(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 24, font: 'Calibri' })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
  });
}

async function getResumeWithValidation(userId: string, resumeId: string) {
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });
  if (!resume) throw new Error('Resume not found');
  return resume;
}

async function getCoverLetterWithValidation(userId: string, id: string) {
  const cl = await prisma.coverLetter.findFirst({
    where: { id, userId },
  });
  if (!cl) throw new Error('Cover letter not found');
  return cl;
}
