'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithGithub, loginWithLinkedin } = useAuthStore();
  const hasCalled = useRef(false);

  useEffect(() => {
    if (hasCalled.current) return;
    
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // 'github' or 'linkedin'

    if (!code || !state) {
      toast.error('Authentication failed: Missing code or state');
      router.push('/login');
      return;
    }

    hasCalled.current = true;

    const handleCallback = async () => {
      try {
        if (state === 'github') {
          await loginWithGithub(code);
        } else if (state === 'linkedin') {
          const redirectUri = `${window.location.origin}/auth/callback`;
          await loginWithLinkedin(code, redirectUri);
        }
        
        toast.success('Welcome to Scribe.ai!');
        router.push('/dashboard');
      } catch (error) {
        console.error('Auth error:', error);
        toast.error('Authentication failed. Please try again.');
        router.push('/login');
      }
    };

    handleCallback();
  }, [searchParams, router, loginWithGithub, loginWithLinkedin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[var(--gradient-1)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#a1a1aa] font-medium">Completing authentication...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--gradient-1)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#a1a1aa] font-medium">Loading...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
