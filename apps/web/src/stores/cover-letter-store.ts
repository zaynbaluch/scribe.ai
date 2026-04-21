'use client';

import { create } from 'zustand';
import { api } from '@/lib/api-client';

interface CoverLetter {
  id: string;
  title: string;
  content: string;
  tone: string;
  resumeId: string | null;
  jobId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CoverLetterState {
  coverLetters: CoverLetter[];
  activeLetter: CoverLetter | null;
  isLoading: boolean;
  isSaving: boolean;

  fetchCoverLetters: () => Promise<void>;
  fetchCoverLetter: (id: string) => Promise<void>;
  updateCoverLetter: (id: string, data: Partial<CoverLetter>) => Promise<void>;
  deleteCoverLetter: (id: string) => Promise<void>;
  setActiveLetter: (letter: CoverLetter | null) => void;
}

export const useCoverLetterStore = create<CoverLetterState>((set, get) => ({
  coverLetters: [],
  activeLetter: null,
  isLoading: false,
  isSaving: false,

  fetchCoverLetters: async () => {
    set({ isLoading: true });
    try {
      // Cover letters are stored in the DB; we'll use a dedicated endpoint or
      // fetch through the existing API structure
      // For now, placeholder until we add a dedicated CL list endpoint
      set({ isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchCoverLetter: async (id: string) => {
    set({ isLoading: true });
    try {
      // Placeholder
      set({ isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateCoverLetter: async (id, data) => {
    set({ isSaving: true });
    try {
      // Will be wired when CL CRUD endpoints are added
      if (get().activeLetter) {
        set({ activeLetter: { ...get().activeLetter!, ...data } });
      }
    } finally {
      set({ isSaving: false });
    }
  },

  deleteCoverLetter: async (id) => {
    set((s) => ({ coverLetters: s.coverLetters.filter((cl) => cl.id !== id) }));
  },

  setActiveLetter: (letter) => set({ activeLetter: letter }),
}));
