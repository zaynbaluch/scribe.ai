import nodemailer from 'nodemailer';
import logger from '../lib/logger';

/**
 * Email service — Nodemailer transport with Mailpit for dev.
 * Templates are pre-compiled HTML stored in /templates/emails/
 */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '1025'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
});

const FROM = process.env.EMAIL_FROM || 'noreply@scribe.local';

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({ from: FROM, to, subject, html });
    logger.info({ to, subject, messageId: info.messageId }, 'Email sent');
    return info;
  } catch (err) {
    logger.error({ err, to, subject }, 'Failed to send email');
    throw err;
  }
}

/**
 * Template renderer — replaces {{variables}} in HTML templates.
 */
export function renderTemplate(html: string, vars: Record<string, string>): string {
  let result = html;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

/**
 * Send a deadline reminder email.
 */
export async function sendDeadlineReminder(to: string, name: string, jobTitle: string, company: string, deadline: string) {
  const html = DEADLINE_REMINDER_HTML
    .replace(/{{name}}/g, name)
    .replace(/{{jobTitle}}/g, jobTitle)
    .replace(/{{company}}/g, company)
    .replace(/{{deadline}}/g, deadline);
  return sendEmail(to, `⏰ Deadline Approaching: ${jobTitle} at ${company}`, html);
}

/**
 * Send a follow-up nudge email.
 */
export async function sendFollowUpNudge(to: string, name: string, jobTitle: string, company: string, daysAgo: number) {
  const html = FOLLOW_UP_HTML
    .replace(/{{name}}/g, name)
    .replace(/{{jobTitle}}/g, jobTitle)
    .replace(/{{company}}/g, company)
    .replace(/{{daysAgo}}/g, String(daysAgo));
  return sendEmail(to, `👋 Follow up on ${jobTitle} at ${company}?`, html);
}

// ─── Pre-compiled Email Templates (inline for simplicity) ───────────────────

const DEADLINE_REMINDER_HTML = `
<!DOCTYPE html><html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0f; color: #e4e4e7; padding: 40px;">
<div style="max-width: 520px; margin: 0 auto; background: #18181b; border-radius: 16px; padding: 32px; border: 1px solid #27272a;">
  <h2 style="margin: 0 0 8px; color: #fafafa;">⏰ Deadline Approaching</h2>
  <p style="color: #a1a1aa; margin: 0 0 24px; font-size: 14px;">Hi {{name}},</p>
  <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6;">
    Your application for <strong style="color: #818cf8;">{{jobTitle}}</strong> at <strong>{{company}}</strong> has a deadline on <strong style="color: #f59e0b;">{{deadline}}</strong>.
  </p>
  <p style="color: #a1a1aa; font-size: 14px; margin-top: 24px;">Make sure your resume is tailored and exported before the deadline!</p>
  <a href="http://localhost:3000/applications" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: linear-gradient(135deg, #6366f1, #818cf8); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">View Application →</a>
  <p style="color: #52525b; font-size: 11px; margin-top: 32px; border-top: 1px solid #27272a; padding-top: 16px;">Scribe.ai — Your AI-powered resume assistant</p>
</div></body></html>
`;

const FOLLOW_UP_HTML = `
<!DOCTYPE html><html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0f; color: #e4e4e7; padding: 40px;">
<div style="max-width: 520px; margin: 0 auto; background: #18181b; border-radius: 16px; padding: 32px; border: 1px solid #27272a;">
  <h2 style="margin: 0 0 8px; color: #fafafa;">👋 Time to Follow Up?</h2>
  <p style="color: #a1a1aa; margin: 0 0 24px; font-size: 14px;">Hi {{name}},</p>
  <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6;">
    It's been <strong style="color: #f59e0b;">{{daysAgo}} days</strong> since you applied for <strong style="color: #818cf8;">{{jobTitle}}</strong> at <strong>{{company}}</strong>.
  </p>
  <p style="color: #a1a1aa; font-size: 14px;">A polite follow-up email can increase your response rate significantly. Consider reaching out to the hiring manager.</p>
  <a href="http://localhost:3000/applications" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: linear-gradient(135deg, #6366f1, #818cf8); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">View Application →</a>
  <p style="color: #52525b; font-size: 11px; margin-top: 32px; border-top: 1px solid #27272a; padding-top: 16px;">Scribe.ai — Your AI-powered resume assistant</p>
</div></body></html>
`;
