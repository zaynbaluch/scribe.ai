'use client';

import { create } from 'zustand';
import api from '../lib/api-client';

interface ProfileState {
  profile: any | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  update: (data: any) => Promise<void>;
  setProfile: (profile: any) => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetch: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get('/api/profile');
      set({ profile: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  update: async (data: any) => {
    set({ isSaving: true });
    try {
      const updated = await api.put('/api/profile', data);
      set({ profile: updated, isSaving: false });
    } catch (err: any) {
      set({ error: err.message, isSaving: false });
      throw err;
    }
  },

  setProfile: (profile) => set({ profile }),
}));
