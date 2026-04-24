'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import Logo from '@/components/ui/logo';
import { ArrowRight, Mail, Lock, ShieldCheck, ChevronLeft, Loader2 } from 'lucide-react';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loginWithGoogle, login, register, verifyEmail, forgotPassword, resetPassword, verify2FA, isLoading, fetchUser } = useAuthStore();

  const [view, setView] = useState<'oauth' | 'email' | '2fa' | 'register' | 'verify-email' | 'forgot-password' | 'reset-password'>('oauth');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleGoogleSuccess = async (credential: string) => {
    try {
      await loginWithGoogle(credential);
      toast.success('Welcome to Scribe.ai!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please try again.');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const result = await login(email, password);
      if (result.requires2FA) {
        setOtp(['', '', '', '', '', '']);
        setView('2fa');
        toast.info('Verification code sent to your email');
      } else {
        toast.success('Welcome back!');
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      const result = await register(email, password, name);
      if (result.requiresVerification) {
        setOtp(['', '', '', '', '', '']);
        setView('verify-email');
        toast.info('Verification code sent to your email');
      } else {
        toast.success('Account created! Now you can sign in.');
        setView('email');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleEmailVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return;
    try {
      await verifyEmail(email, code);
      toast.success('Email verified! You can now sign in.');
      setView('email');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid verification code');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      await forgotPassword(email);
      setOtp(['', '', '', '', '', '']);
      setView('reset-password');
      toast.success('Check your inbox! If you have an account, you will receive a code.', {
        duration: 5000,
      });
    } catch (err: any) {
      toast.error('We encountered an issue. Please try again later.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    
    if (code.length < 6) {
      toast.error('Please enter the full 6-digit code');
      return;
    }

    if (password.length < 8) {
      toast.error('Your new password must be at least 8 characters');
      return;
    }

    try {
      await resetPassword(email, code, password);
      toast.success('Security update successful! You can now sign in with your new password.');
      setPassword('');
      setView('email');
    } catch (err: any) {
      toast.error(err.message || 'Invalid reset code or expired. Please try again.');
    }
  };

  const handle2FAVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return;
    try {
      await verify2FA(email, code);
      toast.success('Verified successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid verification code');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(v => v !== '') && index === 5) {
      if (view === 'verify-email') handleEmailVerify();
      else if (view === '2fa') handle2FAVerify();
      // For reset-password, we wait for the password field and explicit submit
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[#050508]">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[440px] mx-4">
        {/* Glassmorphic Card */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-transparent)] backdrop-blur-2xl p-8 shadow-2xl flex flex-col items-center gap-8 transition-all duration-300">
          
          {/* Back button for secondary views */}
          {view !== 'oauth' && (
            <button 
              onClick={() => {
                if (view === '2fa' || view === 'email' || view === 'register' || view === 'forgot-password') setView('oauth');
                else if (view === 'verify-email') setView('register');
                else if (view === 'reset-password') setView('forgot-password');
              }}
              className="absolute left-6 top-8 p-2 rounded-full hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Logo Section */}
          <div className="flex flex-col items-center gap-3">
            <Logo size={56} className="text-[var(--text-primary)]" />
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                {view === '2fa' ? 'Security Pin' : 
                 view === 'verify-email' ? 'Verify Your Email' : 
                 view === 'register' ? 'Create Account' : 
                 view === 'forgot-password' ? 'Reset Password' :
                 view === 'reset-password' ? 'Set New Password' :
                 'Welcome to Scribe.ai'}
              </h1>
              <p className="text-[var(--text-muted)] text-sm mt-1 max-w-[280px] mx-auto">
                {view === '2fa' || view === 'verify-email' || view === 'reset-password'
                  ? `We've sent a 6-digit code to ${email}`
                  : view === 'forgot-password' ? 'Enter your email to receive a recovery code'
                  : view === 'register' ? 'Join thousands of professionals using Scribe.ai' : 'Your career story, intelligently told.'}
              </p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="w-full">
            {view === 'oauth' && (
              <div className="flex flex-col gap-3 animate-in fade-in duration-300">
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                  <CustomGoogleButton 
                    onSuccess={handleGoogleSuccess} 
                    isLoading={isLoading} 
                  />
                </GoogleOAuthProvider>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
                      const redirectUri = `${window.location.origin}/auth/callback`;
                      const scope = 'openid profile email';
                      const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=linkedin`;
                      window.location.href = url;
                    }}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/30 text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--bg-elevated)] hover:border-[var(--border-focus)] transition-all duration-200 disabled:opacity-50"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </button>

                  <button
                    onClick={() => {
                      const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
                      const redirectUri = `${window.location.origin}/auth/callback`;
                      const scope = 'user:email';
                      const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=github`;
                      window.location.href = url;
                    }}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/30 text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--bg-elevated)] hover:border-[var(--border-focus)] transition-all duration-200 disabled:opacity-50"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                    GitHub
                  </button>
                </div>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[var(--border-subtle)]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[var(--bg-surface)] px-3 text-[var(--text-muted)]">Or</span>
                  </div>
                </div>

                <button
                  onClick={() => setView('email')}
                  className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98]"
                >
                  <Mail size={18} />
                  Continue with Email
                </button>
              </div>
            )}

            {view === 'email' && (
              <form onSubmit={handleEmailLogin} className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)] ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/20 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gradient-1)] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-xs font-medium text-[var(--text-secondary)]">Password</label>
                    <button 
                      type="button" 
                      onClick={() => setView('forgot-password')}
                      className="text-[10px] text-[var(--gradient-1)] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/20 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gradient-1)] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Sign In'}
                  {!isLoading && <ArrowRight size={18} />}
                </button>
                
                <p className="text-center text-xs text-[var(--text-muted)] mt-2">
                  Don't have an account? <button onClick={() => setView('register')} type="button" className="text-[var(--gradient-1)] hover:underline">Create one</button>
                </p>
              </form>
            )}

            {view === 'register' && (
              <form onSubmit={handleRegister} className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)] ml-1">Full Name</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Zayn Baluch"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/20 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gradient-1)] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)] ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/20 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gradient-1)] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)] ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/20 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gradient-1)] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Create Account'}
                  {!isLoading && <ArrowRight size={18} />}
                </button>
                
                <p className="text-center text-xs text-[var(--text-muted)] mt-2">
                  Already have an account? <button onClick={() => setView('email')} type="button" className="text-[var(--gradient-1)] hover:underline">Sign in</button>
                </p>
              </form>
            )}

            {view === 'forgot-password' && (
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)] ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/20 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gradient-1)] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Send Recovery Code'}
                  {!isLoading && <ArrowRight size={18} />}
                </button>
                
                <p className="text-center text-xs text-[var(--text-muted)] mt-2">
                  Remember your password? <button onClick={() => setView('email')} type="button" className="text-[var(--gradient-1)] hover:underline">Sign in</button>
                </p>
              </form>
            )}

            {view === 'reset-password' && (
              <form onSubmit={handleResetPassword} className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex gap-2 justify-center mb-4">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      type="text"
                      inputMode="numeric"
                      ref={el => { otpRefs.current[i] = el; }}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      className="w-12 h-14 text-center text-2xl font-bold rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/20 text-[var(--text-primary)] focus:outline-none focus:border-[var(--gradient-1)] focus:ring-1 focus:ring-[var(--gradient-1)] transition-all"
                    />
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)] ml-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/20 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gradient-1)] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.some(v => !v) || !password}
                  className="w-full flex items-center justify-center gap-2 mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Reset Password'}
                  {!isLoading && <ShieldCheck size={18} />}
                </button>
              </form>
            )}

            {(view === '2fa' || view === 'verify-email') && (
              <form onSubmit={view === 'verify-email' ? handleEmailVerify : handle2FAVerify} className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      type="text"
                      inputMode="numeric"
                      ref={el => { otpRefs.current[i] = el; }}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      className="w-12 h-14 text-center text-2xl font-bold rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/20 text-[var(--text-primary)] focus:outline-none focus:border-[var(--gradient-1)] focus:ring-1 focus:ring-[var(--gradient-1)] transition-all"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.some(v => !v)}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white text-sm font-semibold transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none hover:opacity-90"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : view === 'verify-email' ? 'Verify Account' : 'Verify & Continue'}
                  {!isLoading && (view === 'verify-email' ? <ShieldCheck size={18} /> : <ShieldCheck size={18} />)}
                </button>

                <p className="text-center text-xs text-[var(--text-muted)]">
                  Didn't receive a code? <button type="button" className="text-[var(--gradient-1)] hover:underline">Resend code</button>
                </p>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/10">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-semibold">Secure Authentication</span>
            </div>
            <p className="text-[var(--text-muted)] text-[10px] text-center opacity-50 uppercase tracking-widest">
              Scribe.ai &bull; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomGoogleButton({ onSuccess, isLoading }: { onSuccess: (credential: string) => void, isLoading: boolean }) {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => onSuccess(tokenResponse.access_token),
    onError: () => toast.error('Google login failed'),
  });

  return (
    <button
      onClick={() => {
        // If no client ID, use dev mode bypass
        if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: 'dev-mode-token' }),
          }).then(async res => {
            const data = await res.json();
            if (data.success) {
              const { setTokens } = await import('@/lib/api-client');
              setTokens(data.data.accessToken, data.data.refreshToken);
              useAuthStore.getState().fetchUser();
              window.location.href = '/dashboard';
            }
          });
          return;
        }
        login();
      }}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-lg border border-[var(--border-subtle)] bg-transparent text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--bg-elevated)] hover:border-[var(--border-focus)] transition-all duration-150 disabled:opacity-50"
    >
      <svg width="18" height="18" viewBox="0 0 24 24">
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
      Continue with Google
    </button>
  );
}
