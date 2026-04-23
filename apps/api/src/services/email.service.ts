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

export async function sendEmail(to: string, subject: string, html: string, attachments: any[] = []) {
  try {
    const info = await transporter.sendMail({ 
      from: FROM, 
      to, 
      subject, 
      html,
      attachments: [
        {
          filename: 'logo.png',
          path: '../../apps/web/public/logo.png', 
          cid: 'scribe-logo'
        },
        ...attachments
      ]
    });
    logger.info({ to, subject, messageId: info.messageId }, 'Email sent');
    return info;
  } catch (err) {
    logger.error({ err, to, subject }, 'Failed to send email');
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
        <img src="cid:scribe-logo" alt="Scribe.ai" width="56" height="56" class="logo-img" style="margin-bottom: 40px; filter: invert(1) brightness(2); -webkit-filter: invert(1) brightness(2);">
        
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
        <img src="cid:scribe-logo" alt="Scribe.ai" width="56" height="56" class="logo-img" style="margin-bottom: 40px; filter: invert(1) brightness(2); -webkit-filter: invert(1) brightness(2);">
        
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
        <img src="cid:scribe-logo" alt="Scribe.ai" width="56" height="56" class="logo-img" style="margin-bottom: 40px; filter: invert(1) brightness(2); -webkit-filter: invert(1) brightness(2);">
        
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
        <img src="cid:scribe-logo" alt="Scribe.ai" width="48" height="48" class="logo-img" style="margin-bottom: 40px; filter: invert(1) brightness(2); -webkit-filter: invert(1) brightness(2);">
        
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
        <img src="cid:scribe-logo" alt="Scribe.ai" width="48" height="48" class="logo-img" style="margin-bottom: 40px; filter: invert(1) brightness(2); -webkit-filter: invert(1) brightness(2);">
        
        <div style="font-size: 14px; font-weight: 600; color: #818cf8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Stay Ahead</div>
        <h1 class="hero-title" style="font-size: 28px; font-weight: 700; color: #ffffff; margin: 0 0 16px; letter-spacing: -0.02em;">Time to Follow Up?</h1>
        <p style="color: #a1a1aa; font-size: 16px; margin: 0 0 40px; line-height: 1.6; max-width: 380px;">
          Hi {{name}}, it's been <strong style="color: #f59e0b;">{{daysAgo}} days</strong> since you applied for <strong style="color: #818cf8;">{{jobTitle}}</strong> at <strong>{{company}}</strong>.
        </p>
        
        <a href="http://localhost:3000/applications" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #6366f1, #818cf8); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px; margin-bottom: 60px; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);">Check Status →</a>
        
        <div style="border-top: 1px solid #18181b; padding-top: 40px; color: #3f3f46; font-size: 12px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase;">
          Scribe.ai &copy; 2026 &bull; Intelligent Career Growth
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;
