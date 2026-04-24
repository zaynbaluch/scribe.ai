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
    const resendAttachments = [];
    
    // Add logo if available
    if (logoBuffer) {
      resendAttachments.push({
        filename: 'logo.png',
        content: logoBuffer,
        cid: 'scribe-logo', // Resend supports cid for inline images
      });
    }

    // Add other attachments
    for (const att of attachments) {
      resendAttachments.push({
        filename: att.filename,
        content: att.content, // Should be Buffer or string
      });
    }

    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      attachments: resendAttachments,
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
    .logo-img { filter: invert(1) brightness(2); -webkit-filter: invert(1) brightness(2); }
    @media only screen and (max-width: 480px) {
      .hero-title { font-size: 28px !important; }
      .code-display { font-size: 36px !important; }
    }
  </style>
</head>
<body style="font-family: 'Outfit', Arial, sans-serif; background-color: #050508; color: #e4e4e7; margin: 0; padding: 0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050508;">
    <tr>
      <td align="center" style="padding: 60px 24px;">
        <img src="cid:scribe-logo" alt="Scribe.ai" width="56" height="56" style="margin-bottom: 40px; border:0; display:block;">
        
        <h1 class="hero-title" style="font-size: 32px; font-weight: 700; color: #ffffff; margin: 0 0 16px; letter-spacing: -0.03em;">Security Pin</h1>
        <p style="color: #a1a1aa; font-size: 16px; margin: 0 0 48px; line-height: 1.6; max-width: 320px;">Use the code below to securely sign in to your Scribe.ai account.</p>
        
        <div style="margin-bottom: 48px;">
          <span class="code-display" style="font-size: 48px; font-weight: 700; color: #818cf8; letter-spacing: 0.2em; font-family: 'Courier New', Courier, monospace; text-shadow: 0 0 20px rgba(129, 140, 248, 0.3);">{{code}}</span>
        </div>
        
        <p style="color: #52525b; font-size: 14px; line-height: 1.6; max-width: 380px; margin: 0 auto 60px;">
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
    .logo-img { filter: invert(1) brightness(2); -webkit-filter: invert(1) brightness(2); }
    @media only screen and (max-width: 480px) {
      .hero-title { font-size: 28px !important; }
      .code-display { font-size: 36px !important; }
    }
  </style>
</head>
<body style="font-family: 'Outfit', Arial, sans-serif; background-color: #050508; color: #e4e4e7; margin: 0; padding: 0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050508;">
    <tr>
      <td align="center" style="padding: 60px 24px;">
        <img src="cid:scribe-logo" alt="Scribe.ai" width="56" height="56" style="margin-bottom: 40px; border:0; display:block;">
        
        <div style="font-size: 14px; font-weight: 600; color: #10b981; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Welcome to the future</div>
        <h1 class="hero-title" style="font-size: 32px; font-weight: 700; color: #ffffff; margin: 0 0 16px; letter-spacing: -0.03em;">Verify your account</h1>
        <p style="color: #a1a1aa; font-size: 16px; margin: 0 0 48px; line-height: 1.6; max-width: 320px;">Use the code below to verify your email and start your journey.</p>
        
        <div style="margin-bottom: 48px;">
          <span class="code-display" style="font-size: 48px; font-weight: 700; color: #10b981; letter-spacing: 0.2em; font-family: 'Courier New', Courier, monospace; text-shadow: 0 0 20px rgba(16, 185, 129, 0.3);">{{code}}</span>
        </div>
        
        <p style="color: #52525b; font-size: 14px; line-height: 1.6; max-width: 380px; margin: 0 auto 60px;">
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
    body { margin: 0; padding: 0; background-color: #050508; -webkit-text-size-adjust: 100%; }
    .logo-img { filter: invert(1) brightness(2); -webkit-filter: invert(1) brightness(2); }
    @media only screen and (max-width: 480px) {
      .hero-title { font-size: 28px !important; }
      .code-display { font-size: 36px !important; }
    }
  </style>
</head>
<body style="font-family: 'Outfit', Arial, sans-serif; background-color: #050508; color: #e4e4e7; margin: 0; padding: 0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050508;">
    <tr>
      <td align="center" style="padding: 60px 24px;">
        <img src="cid:scribe-logo" alt="Scribe.ai" width="56" height="56" style="margin-bottom: 40px; border:0; display:block;">
        
        <h1 class="hero-title" style="font-size: 32px; font-weight: 700; color: #ffffff; margin: 0 0 16px; letter-spacing: -0.03em;">Reset Password</h1>
        <p style="color: #a1a1aa; font-size: 16px; margin: 0 0 48px; line-height: 1.6; max-width: 320px;">Lost your access? No worries. Use the recovery code below to set a new password.</p>
        
        <div style="margin-bottom: 48px;">
          <span class="code-display" style="font-size: 48px; font-weight: 700; color: #f59e0b; letter-spacing: 0.2em; font-family: 'Courier New', Courier, monospace; text-shadow: 0 0 20px rgba(245, 158, 11, 0.3);">{{code}}</span>
        </div>
        
        <p style="color: #52525b; font-size: 14px; line-height: 1.6; max-width: 380px; margin: 0 auto 60px;">
          If you didn't request a password reset, you can safely ignore this email. Your account security is our priority.
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
    body { margin: 0; padding: 0; background-color: #050508; -webkit-text-size-adjust: 100%; }
    .logo-img { filter: invert(1) brightness(2); -webkit-filter: invert(1) brightness(2); }
    @media only screen and (max-width: 480px) {
      .hero-title { font-size: 24px !important; }
    }
  </style>
</head>
<body style="font-family: 'Outfit', Arial, sans-serif; background-color: #050508; color: #e4e4e7; margin: 0; padding: 0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050508;">
    <tr>
      <td align="center" style="padding: 60px 24px;">
        <img src="cid:scribe-logo" alt="Scribe.ai" width="48" height="48" style="margin-bottom: 40px; border:0; display:block;">
        
        <div style="font-size: 14px; font-weight: 600; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Action Required</div>
        <h1 class="hero-title" style="font-size: 28px; font-weight: 700; color: #ffffff; margin: 0 0 16px; letter-spacing: -0.02em;">Deadline Approaching</h1>
        <p style="color: #a1a1aa; font-size: 16px; margin: 0 0 40px; line-height: 1.6; max-width: 380px;">
          Hi {{name}}, your application for <strong style="color: #818cf8;">{{jobTitle}}</strong> at <strong>{{company}}</strong> is due on <strong style="color: #f59e0b;">{{deadline}}</strong>.
        </p>
        
        <a href="http://localhost:3000/applications" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #6366f1, #818cf8); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px; margin-bottom: 60px; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);">Finish Application →</a>
        
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
... (rest of FOLLOW_UP_HTML) ...
`;

const TAILORED_DOCS_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
    body { margin: 0; padding: 0; background-color: #050508; -webkit-text-size-adjust: 100%; }
    .logo-img { filter: invert(1) brightness(2); -webkit-filter: invert(1) brightness(2); }
    @media only screen and (max-width: 480px) {
      .hero-title { font-size: 26px !important; }
    }
  </style>
</head>
<body style="font-family: 'Outfit', Arial, sans-serif; background-color: #050508; color: #e4e4e7; margin: 0; padding: 0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050508;">
    <tr>
      <td align="center" style="padding: 60px 24px;">
        <img src="cid:scribe-logo" alt="Scribe.ai" width="56" height="56" style="margin-bottom: 40px; border:0; display:block;">
        
        <div style="font-size: 14px; font-weight: 600; color: #818cf8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Documents Ready</div>
        <h1 class="hero-title" style="font-size: 30px; font-weight: 700; color: #ffffff; margin: 0 0 16px; letter-spacing: -0.02em;">Tailored for Success</h1>
        <p style="color: #a1a1aa; font-size: 16px; margin: 0 0 40px; line-height: 1.6; max-width: 420px;">
          Hi {{name}}, your AI-optimized application for <strong style="color: #ffffff;">{{jobTitle}}</strong> at <strong>{{company}}</strong> has been generated and is attached to this email.
        </p>
        
        <div style="background-color: #09090b; border: 1px solid #18181b; border-radius: 16px; padding: 24px; margin-bottom: 40px; display: block; text-align: left; width: 100%; box-sizing: border-box;">
          <div style="color: #ffffff; font-weight: 600; margin-bottom: 12px; font-size: 14px;">Included Files:</div>
          <div style="color: #a1a1aa; font-size: 13px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">📄</span> Tailored Resume.pdf
          </div>
          <div style="color: #a1a1aa; font-size: 13px; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">✉️</span> Targeted Cover Letter.pdf
          </div>
        </div>
        
        <p style="color: #52525b; font-size: 14px; line-height: 1.6; max-width: 380px; margin: 0 auto 60px;">
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
