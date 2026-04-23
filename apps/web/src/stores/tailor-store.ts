'use client';

import { create } from 'zustand';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';

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
  projectIndex?: number;
  projectName?: string;
  original: string;
  tailored: string;
  changed: boolean;
  accepted?: boolean;
}

interface TailorState {
  step: 'input' | 'matching' | 'results' | 'tailoring' | 'diff' | 'success';
  jdText: string;
  jobId: string | null;
  resumeId: string | null;
  newResumeId: string | null;
  newCoverLetterId: string | null;
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
  applyToResume: () => Promise<void>;
  reset: () => void;
}

export const useTailorStore = create<TailorState>((set, get) => ({
  step: 'input',
  jdText: '',
  jobId: null,
  resumeId: null,
  newResumeId: null,
  newCoverLetterId: null,
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

  applyToResume: async () => {
    const { resumeId, suggestions } = get();
    if (!resumeId) return;
    set({ isLoading: true });
    try {
      const { useResumeStore } = await import('@/stores/resume-store');
      await useResumeStore.getState().fetchResume(resumeId);
      const activeResume = useResumeStore.getState().activeResume;
      if (!activeResume) throw new Error("Resume not found");

      const profile = JSON.parse(JSON.stringify(activeResume.baseProfileSnapshot));
      
      suggestions.filter(s => s.accepted).forEach(s => {
        if (s.type === 'summary' && s.section === 'summary') {
          profile.summary = s.tailored;
        } else if (s.type === 'bullets' && s.section === 'experience' && s.experienceIndex !== undefined) {
          if (profile.experiences?.[s.experienceIndex]) {
            profile.experiences[s.experienceIndex].bullets = s.tailored.split('\n').map(b => b.trim().replace(/^•\s*/, '')).filter(Boolean);
            profile.experiences[s.experienceIndex].description = ''; // Prefer bullets for tailored view
          }
        } else if (s.type === 'bullets' && s.section === 'projects' && s.projectIndex !== undefined) {
          if (profile.projects?.[s.projectIndex]) {
            profile.projects[s.projectIndex].bullets = s.tailored.split('\n').map(b => b.trim().replace(/^•\s*/, '')).filter(Boolean);
            profile.projects[s.projectIndex].description = ''; // Prefer bullets for tailored view
          }
        }
      });

      const tailoredResume = await useResumeStore.getState().createTailoredResume(resumeId, profile);
      
      let createdCoverLetterId = null;
      try {
        const clRes = await api.post<any>('/api/cover-letters/generate', {
          resumeId: tailoredResume.id,
          jobId: get().jobId,
          tone: 'formal'
        });
        createdCoverLetterId = clRes.id;
        toast.success("Tailored resume and Cover Letter created!");
      } catch (e) {
        console.error("Cover letter generation failed:", e);
        toast.success("Tailored resume created, but cover letter failed.");
      }

      set({ step: 'success', newResumeId: tailoredResume.id, newCoverLetterId: createdCoverLetterId });
    } catch (err: any) {
      set({ error: err.message || 'Failed to apply changes' });
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({
    step: 'input', jdText: '', jobId: null, parsedKeywords: null,
    matchResult: null, suggestions: [], isLoading: false, error: null,
    newResumeId: null, newCoverLetterId: null
  }),
}));
