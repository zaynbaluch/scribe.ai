import { Resend } from 'resend';
import logger from '../lib/logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Email service — Resend SDK.
 * Templates are pre-compiled HTML stored in /templates/emails/
 */

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

// Robust logo loading for production environments
const logoSearchPaths = [
  path.resolve(__dirname, '../../../apps/web/public/logo.png'), // Monorepo dist relative
  path.resolve(process.cwd(), '../web/public/logo.png'),       // CWD sibling
  path.resolve(process.cwd(), 'public/logo.png'),              // CWD local
];

let logoBuffer: Buffer | null = null;
for (const p of logoSearchPaths) {
  try {
    if (fs.existsSync(p)) {
      logoBuffer = fs.readFileSync(p);
      logger.info({ path: p }, 'Scribe logo loaded for email');
      break;
    }
  } catch (err) {
    // Continue to next path
  }
}
if (!logoBuffer) {
  logger.warn('Could not find Scribe logo at any search path, using remote fallback for emails');
}

export async function sendEmail(to: string, subject: string, html: string, attachments: any[] = []) {
  try {
    // We only pass the provided attachments (e.g. PDFs) and no longer attach the logo since we use a remote URL
    const resendAttachments = (attachments || []).map(att => ({
      filename: att.filename,
      content: att.content,
    }));
      from: FROM,
      to,
      subject,
      html,
      attachments,
    });

    if (error) {
      throw error;
    }

    logger.info({ to, subject, id: data?.id }, 'Email sent via Resend');
    return data;
  } catch (err) {
    logger.error({ err, to, subject }, 'Failed to send email via Resend');
    throw err;
  }
}

/**
 * Send a 2FA Verification Code email.
 */
export async function send2FACode(to: string, code: string) {
  const html = TWO_FACTOR_HTML.replace(/{{code}}/g, code);
  return sendEmail(to, `🔒 ${code} is your Scribe.ai verification code`, html);
}

/**
 * Send an Account Verification email for first-time signups.
 */
export async function sendVerificationEmail(to: string, code: string) {
  const html = VERIFICATION_HTML.replace(/{{code}}/g, code);
  return sendEmail(to, `🚀 Verify your Scribe.ai account — ${code}`, html);
}

/**
 * Send a Password Reset email.
 */
export async function sendPasswordResetEmail(to: string, code: string) {
  const html = RESET_PASSWORD_HTML.replace(/{{code}}/g, code);
  return sendEmail(to, `🔑 Reset your Scribe.ai password — ${code}`, html);
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

/**
 * Send AI-tailored documents (CV & Cover Letter).
 */
export async function sendTailoredDocs(to: string, name: string, jobTitle: string, company: string, attachments: { filename: string, content: Buffer | string }[]) {
  const html = TAILORED_DOCS_HTML
    .replace(/{{name}}/g, name)
    .replace(/{{jobTitle}}/g, jobTitle)
    .replace(/{{company}}/g, company);
  return sendEmail(to, `✨ Your tailored application for ${jobTitle} at ${company} is ready!`, html, attachments);
}

// ─── Pre-compiled Email Templates (inline for simplicity) ───────────────────

const TWO_FACTOR_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
    body { margin: 0; padding: 0; background-color: #050508; -webkit-text-size-adjust: 100%; }
    @media only screen and (max-width: 480px) {
      .hero-title { font-size: 28px !important; }
      .code-display { font-size: 36px !important; }
    }
  </style>
</head>
<body style="font-family: 'Outfit', Arial, sans-serif; background-color: #050508; color: #e4e4e7; margin: 0; padding: 0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050508;">
    <tr>
      <td align="center" style="padding: 80px 24px;">
        <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 40px;">
          <tr>
            <td align="center" style="background-color: #09090b; border-radius: 16px; padding: 16px;">
              <img src="https://raw.githubusercontent.com/zaynbaluch/scribe.ai/main/apps/web/public/logo.png" alt="Scribe" width="56" height="56" style="border:0; display:block;">
            </td>
          </tr>
        </table>
        
        <h1 class="hero-title" style="font-size: 32px; font-weight: 700; color: #ffffff; margin: 0 0 16px; letter-spacing: -0.03em;">Security Pin</h1>
        <p style="color: #a1a1aa; font-size: 16px; margin: 0 0 48px; line-height: 1.6; max-width: 320px;">Use the code below to securely sign in to your Scribe.ai account.</p>
        
        <div style="margin-bottom: 48px;">
          <span class="code-display" style="font-size: 48px; font-weight: 700; color: #818cf8; letter-spacing: 0.2em; font-family: 'Courier New', Courier, monospace;">{{code}}</span>
        </div>
        
        <p style="color: #52525b; font-size: 14px; line-height: 1.6; max-width: 380px; margin: 0 auto 60px; padding: 0 20px;">
          This verification code was requested for your account. If you didn't request this, please secure your account immediately.
        </p>
        
        <div style="border-top: 1px solid #18181b; padding-top: 40px; color: #3f3f46; font-size: 12px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase;">
          Scribe.ai &copy; 2026 &bull; Intelligent Career Growth
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const VERIFICATION_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
    body { margin: 0; padding: 0; background-color: #050508; -webkit-text-size-adjust: 100%; }
  </style>
</head>
<body style="font-family: 'Outfit', Arial, sans-serif; background-color: #050508; color: #e4e4e7; margin: 0; padding: 0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050508;">
    <tr>
      <td align="center" style="padding: 80px 24px;">
        <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 40px;">
          <tr>
            <td align="center" style="background-color: #09090b; border-radius: 16px; padding: 16px;">
              <img src="https://raw.githubusercontent.com/zaynbaluch/scribe.ai/main/apps/web/public/logo.png" alt="Scribe" width="56" height="56" style="border:0; display:block;">
            </td>
          </tr>
        </table>
        
        <div style="font-size: 14px; font-weight: 600; color: #10b981; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Welcome to the future</div>
        <h1 class="hero-title" style="font-size: 32px; font-weight: 700; color: #ffffff; margin: 0 0 16px; letter-spacing: -0.03em;">Verify your account</h1>
        <p style="color: #a1a1aa; font-size: 16px; margin: 0 0 48px; line-height: 1.6; max-width: 320px; padding: 0 20px;">Use the code below to verify your email and start your journey.</p>
        
        <div style="margin-bottom: 48px;">
          <span class="code-display" style="font-size: 48px; font-weight: 700; color: #10b981; letter-spacing: 0.2em; font-family: 'Courier New', Courier, monospace;">{{code}}</span>
        </div>
        
        <p style="color: #52525b; font-size: 14px; line-height: 1.6; max-width: 380px; margin: 0 auto 60px; padding: 0 20px;">
          We're excited to have you on board. Scribe.ai is here to help you tell your career story intelligently.
        </p>
        
        <div style="border-top: 1px solid #18181b; padding-top: 40px; color: #3f3f46; font-size: 12px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase;">
          Scribe.ai &copy; 2026 &bull; Intelligent Career Growth
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const RESET_PASSWORD_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
    body { margin: 0; padding: 0; background-color: #050508; }
  </style>
</head>
<body style="font-family: 'Outfit', Arial, sans-serif; background-color: #050508; color: #e4e4e7; margin: 0; padding: 0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050508;">
    <tr>
      <td align="center" style="padding: 80px 24px;">
        <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 40px;">
          <tr>
            <td align="center" style="background-color: #09090b; border-radius: 16px; padding: 16px;">
              <img src="https://raw.githubusercontent.com/zaynbaluch/scribe.ai/main/apps/web/public/logo.png" alt="Scribe" width="56" height="56" style="border:0; display:block;">
            </td>
          </tr>
        </table>
        
        <div style="font-size: 14px; font-weight: 600; color: #818cf8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Documents Ready</div>
        <h1 class="hero-title" style="font-size: 30px; font-weight: 700; color: #ffffff; margin: 0 0 16px; letter-spacing: -0.02em;">Tailored for Success</h1>
        <p style="color: #a1a1aa; font-size: 16px; margin: 0 0 40px; line-height: 1.6; max-width: 420px; padding: 0 20px;">
          Hi {{name}}, your AI-optimized application for <strong style="color: #ffffff;">{{jobTitle}}</strong> at <strong>{{company}}</strong> has been generated and is attached to this email.
        </p>
        
        <div style="background-color: #09090b; border: 1px solid #18181b; border-radius: 16px; padding: 24px; margin-bottom: 40px; display: block; text-align: left; width: 100%; max-width: 420px; box-sizing: border-box;">
          <div style="color: #ffffff; font-weight: 600; margin-bottom: 12px; font-size: 14px;">Included Files:</div>
          <div style="color: #a1a1aa; font-size: 13px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">📄</span> Tailored Resume.pdf
          </div>
          <div style="color: #a1a1aa; font-size: 13px; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">✉️</span> Targeted Cover Letter.pdf
          </div>
        </div>
        
        <p style="color: #52525b; font-size: 14px; line-height: 1.6; max-width: 380px; margin: 0 auto 60px; padding: 0 20px;">
          Go ahead and review them. If they look good, you're ready to apply! Good luck with your application.
        </p>
        
        <div style="border-top: 1px solid #18181b; padding-top: 40px; color: #3f3f46; font-size: 12px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase;">
          Scribe.ai &copy; 2026 &bull; Intelligent Career Growth
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const DEADLINE_REMINDER_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
    body { margin: 0; padding: 0; background-color: #050508; }
  </style>
</head>
<body style="font-family: 'Outfit', Arial, sans-serif; background-color: #050508; color: #e4e4e7; margin: 0; padding: 0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050508;">
    <tr>
      <td align="center" style="padding: 80px 24px;">
        <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 40px;">
          <tr>
            <td align="center" style="background-color: #09090b; border-radius: 16px; padding: 16px;">
              <img src="https://raw.githubusercontent.com/zaynbaluch/scribe.ai/main/apps/web/public/logo.png" alt="Scribe" width="56" height="56" style="border:0; display:block;">
            </td>
          </tr>
        </table>
        
        <div style="font-size: 14px; font-weight: 600; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Action Required</div>
        <h1 class="hero-title" style="font-size: 28px; font-weight: 700; color: #ffffff; margin: 0 0 16px; letter-spacing: -0.02em;">Deadline Approaching</h1>
        <p style="color: #a1a1aa; font-size: 16px; margin: 0 0 40px; line-height: 1.6; max-width: 380px; padding: 0 20px;">
          Hi {{name}}, your application for <strong style="color: #818cf8;">{{jobTitle}}</strong> at <strong>{{company}}</strong> is due on <strong style="color: #f59e0b;">{{deadline}}</strong>.
        </p>
        
        <a href="https://scribe.ai/applications" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #6366f1, #818cf8); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px; margin-bottom: 60px; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);">Finish Application →</a>
        
        <div style="border-top: 1px solid #18181b; padding-top: 40px; color: #3f3f46; font-size: 12px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase;">
          Scribe.ai &copy; 2026 &bull; Intelligent Career Growth
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const FOLLOW_UP_HTML = `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background-color: #050508; color: #fff;">
  <center>
    <img src="https://raw.githubusercontent.com/zaynbaluch/scribe.ai/main/apps/web/public/logo.png" alt="Scribe" width="56" height="56" style="margin: 40px 0;">
    <h1>Follow up?</h1>
    <p>Hi {{name}}, checking in on {{jobTitle}} at {{company}}.</p>
  </center>
</body>
</html>
`;

const TAILORED_DOCS_HTML = `
<!DOCTYPE html>
<html>
<head>
      </td>
    </tr>
  </table>
</body>
</html>
`;
