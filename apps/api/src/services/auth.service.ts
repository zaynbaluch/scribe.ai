import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import logger from '../lib/logger';
import { createError } from '../middleware/error-handler.middleware';
import { send2FACode, sendVerificationEmail, sendPasswordResetEmail } from './email.service';

const JWT_SECRET = process.env.JWT_SECRET || 'your-dev-jwt-secret-change-in-prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '4h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

export interface OAuthUserInfo {
  email: string;
  name: string;
  avatarUrl?: string | null;
  oauthId: string;
}

/**
 * Verify a GitHub authorization code and extract user info.
 */
export async function verifyGithubCode(code: string): Promise<OAuthUserInfo> {
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('GitHub token exchange failed');

    // 2. Get user profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${tokenData.access_token}` },
    });
    const userData = await userRes.json();

    // 3. Get primary email
    const emailsRes = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `token ${tokenData.access_token}` },
    });
    const emails = await emailsRes.json();
    const primaryEmail = emails.find((e: any) => e.primary)?.email || emails[0]?.email;

    return {
      email: primaryEmail,
      name: userData.name || userData.login,
      avatarUrl: userData.avatar_url,
      oauthId: String(userData.id),
    };
  } catch (err) {
    logger.error({ err }, 'Failed to verify GitHub code');
    throw new Error('Invalid GitHub credential');
  }
}

/**
 * Verify a LinkedIn authorization code and extract user info.
 */
export async function verifyLinkedinCode(code: string, redirectUri: string): Promise<OAuthUserInfo> {
  const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
  const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: LINKEDIN_CLIENT_ID!,
        client_secret: LINKEDIN_CLIENT_SECRET!,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('LinkedIn token exchange failed');

    // 2. Get user profile and email
    const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();

    return {
      email: userData.email,
      name: userData.name,
      avatarUrl: userData.picture,
      oauthId: userData.sub,
    };
  } catch (err) {
    logger.error({ err }, 'Failed to verify LinkedIn code');
    throw new Error('Invalid LinkedIn credential');
  }
}

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Verify a Google ID token (from the frontend Google Sign-In)
 * and extract user information.
 */
export async function verifyGoogleToken(token: string): Promise<OAuthUserInfo> {
  // ─── Dev Mode Bypass ──────────────────────────────────────────────────────
  if (process.env.NODE_ENV === 'development' && token === 'dev-mode-token') {
    return {
      email: 'dev@scribe.ai',
      name: 'Dev User',
      avatarUrl: null as any,
      oauthId: 'dev-oauth-id-123',
    };
  }

  // ─── Universal Guard: Force Access Token Flow for ya29 tokens ──────────────
  if (token.startsWith('ya29')) {
    logger.info({ token: token.substring(0, 10) + '...' }, 'SCRIBE_DEBUG: Handling Google Access Token');
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Google API responded with ${response.status}`);

      const payload = await response.json();
      return {
        oauthId: payload.sub,
        email: payload.email,
        name: payload.name || payload.given_name || payload.email.split('@')[0],
        avatarUrl: payload.picture,
      };
    } catch (error: any) {
      logger.error({ err: error }, 'Failed to verify Google access token');
      throw new Error('Invalid Google credential');
    }
  }

  // ─── ID Token Flow: Only for JWTs (starting with ey) ──────────────────────
  if (token.startsWith('ey') && token.split('.').length === 3) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) throw new Error('Invalid Google payload');

      return {
        oauthId: payload.sub,
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        avatarUrl: payload.picture,
      };
    } catch (error: any) {
      logger.error({ err: error }, 'Failed to verify Google ID token');
      throw new Error('Invalid Google credential');
    }
  }

  throw new Error('Unrecognized Google token format. Please try again.');
}

/**
 * Register a new user with email and password.
 */
export async function registerWithEmailPassword(email: string, password: string, name: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.oauthProvider) {
      throw createError(
        `This email is already linked to a ${existing.oauthProvider} account. Please sign in using ${existing.oauthProvider} or reset your password.`,
        400
      );
    }
    throw createError('Email already in use. Please sign in or reset your password.', 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      twoFactorEnabled: false,
      emailVerified: false,
      profile: { create: { name } },
    },
  });

  // Generate verification code
  const code = crypto.randomInt(100000, 999999).toString();
  await prisma.verificationCode.create({
    data: {
      email,
      code,
      type: 'email_verification',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  await sendVerificationEmail(email, code);

  return user;
}

/**
 * Verify email code for registration.
 */
export async function verifyEmailCode(email: string, code: string) {
  const verification = await prisma.verificationCode.findFirst({
    where: {
      email,
      code,
      type: 'email_verification',
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!verification) throw new Error('Invalid or expired verification code');

  await prisma.user.update({
    where: { email },
    data: { emailVerified: true },
  });

  await prisma.verificationCode.delete({ where: { id: verification.id } });

  return true;
}

/**
 * Request password reset.
 */
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Return true even if user not found for security (prevent email enumeration)
    return true;
  }

  const code = crypto.randomInt(100000, 999999).toString();
  await prisma.verificationCode.create({
    data: {
      email,
      code,
      type: 'password_reset',
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
    },
  });

  await sendPasswordResetEmail(email, code);
  return true;
}

/**
 * Reset password using verification code.
 */
export async function resetPassword(email: string, code: string, passwordNew: string) {
  const verification = await prisma.verificationCode.findFirst({
    where: {
      email,
      code,
      type: 'password_reset',
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!verification) throw new Error('Invalid or expired reset code');

  const passwordHash = await bcrypt.hash(passwordNew, 10);
  await prisma.user.update({
    where: { email },
    data: { passwordHash, emailVerified: true },
  });

  await prisma.verificationCode.delete({ where: { id: verification.id } });

  return true;
}

/**
 * Login with email and password - triggers 2FA if enabled.
 */
export async function loginWithEmailPassword(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) throw new Error('Invalid credentials');

  if (!user.emailVerified && !user.oauthProvider) {
    throw new Error('Please verify your email address before logging in');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new Error('Invalid credentials');

  if (user.twoFactorEnabled) {
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.verificationCode.create({
      data: {
        email,
        code,
        type: '2fa',
        expiresAt,
      },
    });

    await send2FACode(email, code);
    return { requires2FA: true };
  }

  return { user, tokens: generateTokenPair(user.id, user.email) };
}

/**
 * Verify a 2FA code and return tokens.
 */
export async function verify2FACode(email: string, code: string) {
  const verification = await prisma.verificationCode.findFirst({
    where: {
      email,
      code,
      type: '2fa',
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!verification) throw new Error('Invalid or expired code');

  // Delete code after use
  await prisma.verificationCode.delete({ where: { id: verification.id } });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');

  return { user, tokens: generateTokenPair(user.id, user.email) };
}

/**
 * Find or create a user from OAuth info.
 * Creates a Profile record automatically on first login.
 */
export async function findOrCreateUser(info: OAuthUserInfo, provider: string) {
  let user = await prisma.user.findUnique({
    where: { oauthId: info.oauthId },
    include: { profile: true },
  });

  if (!user) {
    // Also check by email to merge accounts if needed
    const existingByEmail = await prisma.user.findUnique({
      where: { email: info.email },
      include: { profile: true },
    });

    if (existingByEmail) {
      // Link OAuth to existing email account
      user = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: { 
          oauthId: info.oauthId, 
          oauthProvider: provider,
          // Only update name/avatar if they are currently null
          name: existingByEmail.name || info.name,
          avatarUrl: existingByEmail.avatarUrl || info.avatarUrl,
          profile: existingByEmail.profile ? {
            update: {
              name: existingByEmail.profile.name || info.name,
              imageUrl: existingByEmail.profile.imageUrl || info.avatarUrl,
            }
          } : {
            create: {
              name: info.name,
              imageUrl: info.avatarUrl,
            }
          }
        },
        include: { profile: true },
      });
      logger.info({ userId: user.id, email: user.email, provider }, 'Linked OAuth provider to existing email account');
    } else {
      user = await prisma.user.create({
        data: {
          email: info.email,
          name: info.name,
          avatarUrl: info.avatarUrl,
          oauthProvider: provider,
          oauthId: info.oauthId,
          emailVerified: true, // OAuth accounts are pre-verified
          profile: { 
            create: { 
              name: info.name, 
              imageUrl: info.avatarUrl 
            } 
          },
        },
        include: { profile: true },
      });
      logger.info({ userId: user.id, email: user.email, provider }, 'Created new user via OAuth');
    }
  } else if (!user.emailVerified) {
    // If user exists via OAuth but isn't verified (migration case), verify them now
    user = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
      include: { profile: true },
    });
  }

  return user;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Generate a JWT access token.
 */
export function generateAccessToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as string | number,
  } as jwt.SignOptions);
}

/**
 * Generate a long-lived refresh token.
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN as string | number,
  } as jwt.SignOptions);
}

/**
 * Generate a very long-lived token for the browser extension.
 */
export function generateExtensionToken(userId: string, email: string): string {
  return jwt.sign({ userId, email, isExtension: true }, JWT_SECRET, {
    expiresIn: '365d',
  } as jwt.SignOptions);
}

/**
 * Verify a refresh token and return the userId.
 */
export function verifyRefreshToken(token: string): { userId: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      type: string;
    };
    if (decoded.type !== 'refresh') {
      throw new Error('Not a refresh token');
    }
    return { userId: decoded.userId };
  } catch {
    throw new Error('Invalid refresh token');
  }
}

/**
 * Generate a full token pair for a user.
 */
export function generateTokenPair(userId: string, email: string): TokenPair {
  return {
    accessToken: generateAccessToken(userId, email),
    refreshToken: generateRefreshToken(userId),
    expiresIn: 3600,
  };
}

/**
 * Get user by ID (for /auth/me).
 * Prioritizes profile name and image over account defaults.
 */
export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: {
        select: { name: true, imageUrl: true }
      }
    }
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.profile?.name || user.name,
    avatarUrl: user.profile?.imageUrl || user.avatarUrl,
    plan: user.plan,
    vanitySlug: user.vanitySlug,
    createdAt: user.createdAt,
  };
}
