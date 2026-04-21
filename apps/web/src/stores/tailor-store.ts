'use client';

import { create } from 'zustand';
import { api } from '@/lib/api-client';

interface MatchResult {
  score: number;
  strong: string[];
  partial: string[];
  gaps: string[];
  breakdown: any;
}

interface TailorSuggestion {
  section: string;
  type: string;
  index?: number;
  experienceIndex?: number;
  bulletIndex?: number;
  experienceTitle?: string;
  company?: string;
  original: string;
  tailored: string;
  changed: boolean;
  accepted?: boolean;
}

interface TailorState {
  step: 'input' | 'matching' | 'results' | 'tailoring' | 'diff';
  jdText: string;
  jobId: string | null;
  resumeId: string | null;
  parsedKeywords: any;
  matchResult: MatchResult | null;
  suggestions: TailorSuggestion[];
  isLoading: boolean;
  error: string | null;

  setStep: (step: TailorState['step']) => void;
  setJdText: (text: string) => void;
  setResumeId: (id: string) => void;
  analyzeJob: (resumeId: string, input: { text?: string; url?: string }) => Promise<void>;
  tailorResume: (resumeId: string, jobId: string) => Promise<void>;
  acceptSuggestion: (index: number) => void;
  rejectSuggestion: (index: number) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  reset: () => void;
}

export const useTailorStore = create<TailorState>((set, get) => ({
  step: 'input',
  jdText: '',
  jobId: null,
  resumeId: null,
  parsedKeywords: null,
  matchResult: null,
  suggestions: [],
  isLoading: false,
  error: null,

  setStep: (step) => set({ step }),
  setJdText: (text) => set({ jdText: text }),
  setResumeId: (id) => set({ resumeId: id }),

  analyzeJob: async (resumeId, input) => {
    set({ isLoading: true, error: null, step: 'matching' });
    try {
      const data = await api.post<any>('/api/tailor/analyze', { resumeId, ...input });
      set({
        jobId: data.jobId,
        parsedKeywords: data.parsedKeywords,
        matchResult: data.matchResult,
        jdText: data.jdText || input.text || '',
        step: 'results',
      });
    } catch (err: any) {
      set({ error: err.message || 'Analysis failed', step: 'input' });
    } finally {
      set({ isLoading: false });
    }
  },

  tailorResume: async (resumeId, jobId) => {
    set({ isLoading: true, error: null, step: 'tailoring' });
    try {
      const data = await api.post<any>('/api/tailor/tailor', { resumeId, jobId });
      const suggestions = (data.suggestions || []).map((s: any) => ({ ...s, accepted: undefined }));
      set({ suggestions, step: 'diff' });
    } catch (err: any) {
      set({ error: err.message || 'Tailoring failed', step: 'results' });
    } finally {
      set({ isLoading: false });
    }
  },

  acceptSuggestion: (index) => set((s) => ({
    suggestions: s.suggestions.map((sg, i) => i === index ? { ...sg, accepted: true } : sg),
  })),

  rejectSuggestion: (index) => set((s) => ({
    suggestions: s.suggestions.map((sg, i) => i === index ? { ...sg, accepted: false } : sg),
  })),

  acceptAll: () => set((s) => ({
    suggestions: s.suggestions.map((sg) => sg.changed ? { ...sg, accepted: true } : sg),
  })),

  rejectAll: () => set((s) => ({
    suggestions: s.suggestions.map((sg) => sg.changed ? { ...sg, accepted: false } : sg),
  })),

  reset: () => set({
    step: 'input', jdText: '', jobId: null, parsedKeywords: null,
    matchResult: null, suggestions: [], isLoading: false, error: null,
  }),
}));
