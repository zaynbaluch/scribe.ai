import { z } from 'zod';

export const googleLoginSchema = z.object({
  credential: z.string().min(1, 'Google credential is required'),
});

export const githubLoginSchema = z.object({
  code: z.string().min(1, 'GitHub code is required'),
});

export const linkedinLoginSchema = z.object({
  code: z.string().min(1, 'LinkedIn code is required'),
  redirectUri: z.string().url('Valid redirect URI is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;
export type GithubLoginInput = z.infer<typeof githubLoginSchema>;
export type LinkedinLoginInput = z.infer<typeof linkedinLoginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
