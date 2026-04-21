import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../lib/prisma';
import logger from '../lib/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-dev-jwt-secret-change-in-prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface GoogleUserInfo {
  email: string;
  name: string;
  avatarUrl?: string;
  oauthId: string;
}

/**
 * Verify a Google ID token (from the frontend Google Sign-In)
 * and extract user information.
 */
export async function verifyGoogleToken(credential: string): Promise<GoogleUserInfo> {
  // ─── Dev Mode Bypass ──────────────────────────────────────────────────────
  if (process.env.NODE_ENV === 'development' && credential === 'dev-mode-token') {
    return {
      email: 'dev@scribe.ai',
      name: 'Dev User',
      avatarUrl: null as any,
      oauthId: 'dev-oauth-id-123',
    };
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
      throw new Error('Invalid Google token payload');
    }
    return {
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      avatarUrl: payload.picture,
      oauthId: payload.sub,
    };
  } catch (err) {
    logger.error({ err }, 'Failed to verify Google token');
    throw new Error('Invalid Google credential');
  }
}

/**
 * Find or create a user from OAuth info.
 * Creates a Profile record automatically on first login.
 */
export async function findOrCreateUser(info: GoogleUserInfo, provider: string) {
  let user = await prisma.user.findUnique({
    where: { oauthId: info.oauthId },
    include: { profile: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: info.email,
        name: info.name,
        avatarUrl: info.avatarUrl,
        oauthProvider: provider,
        oauthId: info.oauthId,
        profile: {
          create: {}, // Create empty profile on signup
        },
      },
      include: { profile: true },
    });
    logger.info({ userId: user.id, email: user.email }, 'New user created via OAuth');
  }

  return user;
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
 */
export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      plan: true,
      vanitySlug: true,
      createdAt: true,
    },
  });
}
