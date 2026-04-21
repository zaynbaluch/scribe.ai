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
  logout: () => void;
  fetchUser: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
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
