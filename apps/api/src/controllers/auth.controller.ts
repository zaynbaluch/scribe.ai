import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { createError, asyncHandler } from '../middleware/error-handler.middleware';
import logger from '../lib/logger';

/**
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) throw createError('Missing fields', 400);

  const user = await authService.registerWithEmailPassword(email, password, name);
  res.status(201).json({ success: true, data: { id: user.id, email: user.email } });
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) throw createError('Missing fields', 400);

  const result = await authService.loginWithEmailPassword(email, password);

  if ('requires2FA' in result) {
    return res.json({ success: true, data: { requires2FA: true, email } });
  }

  const { user, tokens } = result;
  res.json({
    success: true,
    data: {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
      },
    },
  });
});

/**
 * POST /api/auth/verify-2fa
 */
export const verify2FA = asyncHandler(async (req: Request, res: Response) => {
  const { email, code } = req.body;
  if (!email || !code) throw createError('Missing fields', 400);

  const { user, tokens } = await authService.verify2FACode(email, code);

  res.json({
    success: true,
    data: {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
      },
    },
  });
});

/**
 * POST /api/auth/google
 * Exchange a Google ID token for our JWT access + refresh tokens.
 */
export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const { credential } = req.body;

  const googleUser = await authService.verifyGoogleToken(credential);
  const user = await authService.findOrCreateUser(googleUser, 'google');
  const tokens = authService.generateTokenPair(user.id, user.email);

  logger.info({ userId: user.id, email: user.email }, 'User logged in via Google');

  res.json({
    success: true,
    data: {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
      },
    },
  });
});

/**
 * POST /api/auth/github
 */
export const githubLogin = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.body;

  const githubUser = await authService.verifyGithubCode(code);
  const user = await authService.findOrCreateUser(githubUser, 'github');
  const tokens = authService.generateTokenPair(user.id, user.email);

  res.json({
    success: true,
    data: {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
      },
    },
  });
});

/**
 * POST /api/auth/linkedin
 */
export const linkedinLogin = asyncHandler(async (req: Request, res: Response) => {
  const { code, redirectUri } = req.body;

  const linkedinUser = await authService.verifyLinkedinCode(code, redirectUri);
  const user = await authService.findOrCreateUser(linkedinUser, 'linkedin');
  const tokens = authService.generateTokenPair(user.id, user.email);

  res.json({
    success: true,
    data: {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
      },
    },
  });
});

/**
 * POST /api/auth/refresh
 * Refresh the access token using a valid refresh token.
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  try {
    const { userId } = authService.verifyRefreshToken(refreshToken);
    const user = await authService.getUserById(userId);

    if (!user) {
      throw createError('User not found', 404, 'USER_NOT_FOUND');
    }

    const accessToken = authService.generateAccessToken(user.id, user.email);

    res.json({
      success: true,
      data: {
        accessToken,
        expiresIn: 3600,
      },
    });
  } catch {
    throw createError('Invalid refresh token', 401, 'REFRESH_TOKEN_INVALID');
  }
});

/**
 * POST /api/auth/logout
 * In a stateless JWT system, logout is handled client-side.
 * This endpoint exists for future server-side token revocation.
 */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: null });
});

/**
 * GET /api/auth/me
 * Return the current authenticated user.
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Not authenticated', 401, 'UNAUTHORIZED');
  }

  const user = await authService.getUserById(req.user.userId);

  if (!user) {
    throw createError('User not found', 404, 'USER_NOT_FOUND');
  }

  res.json({ success: true, data: user });
});
