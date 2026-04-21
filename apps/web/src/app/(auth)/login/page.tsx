'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loginWithGoogle, isLoading } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast.success('Welcome to Scribe.ai!');
      router.push('/dashboard');
    } catch {
      toast.error('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'var(--glow-ambient)' }}
      />

      <div className="relative z-10 w-full max-w-[440px] mx-4">
        {/* Glassmorphic Card */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-transparent)] backdrop-blur-xl p-8 flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--gradient-1)] to-[var(--gradient-2)] flex items-center justify-center text-white font-display font-bold text-xl">
              S
            </div>
            <h1 className="font-display text-2xl tracking-tight mt-2">
              Welcome to Scribe.ai
            </h1>
            <p className="text-[var(--text-secondary)] text-sm text-center">
              Your career story, intelligently told.
            </p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-[var(--border-subtle)]" />

          {/* OAuth Buttons */}
          <div className="w-full flex flex-col gap-3">
            {GOOGLE_CLIENT_ID ? (
              <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <div className="w-full flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Google login failed')}
                    theme="filled_black"
                    size="large"
                    width="380"
                    text="continue_with"
                    shape="rectangular"
                  />
                </div>
              </GoogleOAuthProvider>
            ) : (
              /* Dev mode fallback when no Google client ID is configured */
              <button
                onClick={async () => {
                  try {
                    // Dev-only: create a test user directly
                    const res = await fetch(
                      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/google`,
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ credential: 'dev-mode-token' }),
                      }
                    );
                    if (!res.ok) {
                      toast.error(
                        'Dev login unavailable. Configure GOOGLE_CLIENT_ID in .env to enable OAuth, or see docs for dev setup.'
                      );
                      return;
                    }
                    const data = await res.json();
                    if (data.success) {
                      const { setTokens } = await import('@/lib/api-client');
                      setTokens(data.data.accessToken, data.data.refreshToken);
                      useAuthStore.getState().fetchUser();
                      router.push('/dashboard');
                    }
                  } catch {
                    toast.error('Dev login failed. Is the API running?');
                  }
                }}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-lg border border-[var(--border-subtle)] bg-transparent text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--bg-elevated)] hover:border-[var(--border-focus)] transition-all duration-150"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-70">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google (Dev Mode)
              </button>
            )}

            {/* Future: LinkedIn and GitHub buttons */}
            <button
              disabled
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-lg border border-[var(--border-subtle)] bg-transparent text-[var(--text-muted)] text-sm font-medium cursor-not-allowed opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="opacity-50">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Continue with LinkedIn (Coming Soon)
            </button>

            <button
              disabled
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-lg border border-[var(--border-subtle)] bg-transparent text-[var(--text-muted)] text-sm font-medium cursor-not-allowed opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="opacity-50">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              Continue with GitHub (Coming Soon)
            </button>
          </div>

          {/* Footer */}
          <p className="text-[var(--text-muted)] text-xs text-center mt-2">
            By continuing, you agree to our{' '}
            <a href="#" className="underline hover:text-[var(--text-secondary)]">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-[var(--text-secondary)]">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
