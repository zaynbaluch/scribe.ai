'use client';

import { create } from 'zustand';
import api, { setTokens, clearTokens } from '../lib/api-client';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  plan: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  loginWithGoogle: (credential: string) => Promise<void>;
  loginWithGithub: (code: string) => Promise<void>;
  loginWithLinkedin: (code: string, redirectUri: string) => Promise<void>;
  login: (email: string, password: string) => Promise<{ requires2FA: boolean }>;
  verify2FA: (email: string, code: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  loginWithGoogle: async (credential: string) => {
    set({ isLoading: true });
    try {
      const data = await api.post(
        '/api/auth/google',
        { credential },
        { skipAuth: true }
      );
      setTokens(data.accessToken, data.refreshToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loginWithGithub: async (code: string) => {
    set({ isLoading: true });
    try {
      const data = await api.post(
        '/api/auth/github',
        { code },
        { skipAuth: true }
      );
      setTokens(data.accessToken, data.refreshToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loginWithLinkedin: async (code: string, redirectUri: string) => {
    set({ isLoading: true });
    try {
      const data = await api.post(
        '/api/auth/linkedin',
        { code, redirectUri },
        { skipAuth: true }
      );
      setTokens(data.accessToken, data.refreshToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await api.post('/api/auth/login', { email, password }, { skipAuth: true });
      if (data.requires2FA) {
        set({ isLoading: false });
        return { requires2FA: true };
      }
      setTokens(data.accessToken, data.refreshToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return { requires2FA: false };
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  verify2FA: async (email, code) => {
    set({ isLoading: true });
    try {
      const data = await api.post('/api/auth/verify-2fa', { email, code }, { skipAuth: true });
      setTokens(data.accessToken, data.refreshToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false });
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  fetchUser: async () => {
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('scribe_access_token')
          : null;
      if (!token) {
        set({ isLoading: false });
        return;
      }

      const user = await api.get<User>('/api/auth/me');
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
