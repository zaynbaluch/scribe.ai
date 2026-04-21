'use client';

import { create } from 'zustand';
import { api } from '@/lib/api-client';

interface ResumeSummary {
  id: string;
  name: string;
  templateId: string;
  atsScore: number | null;
  matchScore: number | null;
  jobId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ResumeDetail {
  id: string;
  name: string;
  templateId: string;
  baseProfileSnapshot: any;
  tailoredContent: any;
  sectionOrder: string[];
  sectionVisibility: Record<string, boolean>;
  customStyles: Record<string, any>;
  atsScore: number | null;
  matchScore: number | null;
  createdAt: string;
  updatedAt: string;
}

interface TemplateInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  isPremium: boolean;
}

interface ResumeState {
  resumes: ResumeSummary[];
  activeResume: ResumeDetail | null;
  templates: TemplateInfo[];
  isLoading: boolean;
  isSaving: boolean;

  fetchResumes: () => Promise<void>;
  fetchResume: (id: string) => Promise<void>;
  fetchTemplates: () => Promise<void>;
  createResume: (data: { name: string; templateId?: string }) => Promise<ResumeSummary>;
  updateResume: (id: string, data: Partial<ResumeDetail>) => Promise<void>;
  duplicateResume: (id: string) => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
  setActiveResume: (resume: ResumeDetail | null) => void;
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  resumes: [],
  activeResume: null,
  templates: [],
  isLoading: false,
  isSaving: false,

  fetchResumes: async () => {
    set({ isLoading: true });
    try {
      const data = await api.get<ResumeSummary[]>('/api/resumes');
      // The api client returns data.data automatically — but the list endpoint returns { data, pagination }
      // We need to handle both shapes
      if (Array.isArray(data)) {
        set({ resumes: data });
      } else if ((data as any)?.data) {
        set({ resumes: (data as any).data });
      }
    } catch {
      // Silent fail on fetch
    } finally {
      set({ isLoading: false });
    }
  },

  fetchResume: async (id: string) => {
    set({ isLoading: true });
    try {
      const data = await api.get<ResumeDetail>(`/api/resumes/${id}`);
      set({ activeResume: data });
    } catch {
      // Silent fail
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTemplates: async () => {
    try {
      const data = await api.get<TemplateInfo[]>('/api/templates', { skipAuth: true });
      set({ templates: Array.isArray(data) ? data : [] });
    } catch {
      // Templates might fail if API is down
    }
  },

  createResume: async (data) => {
    const resume = await api.post<ResumeSummary>('/api/resumes', data);
    await get().fetchResumes();
    return resume;
  },

  updateResume: async (id, data) => {
    set({ isSaving: true });
    try {
      const updated = await api.put<ResumeDetail>(`/api/resumes/${id}`, data);
      set({ activeResume: updated });
    } finally {
      set({ isSaving: false });
    }
  },

  duplicateResume: async (id) => {
    await api.post(`/api/resumes/${id}/duplicate`);
    await get().fetchResumes();
  },

  deleteResume: async (id) => {
    await api.delete(`/api/resumes/${id}`);
    set((s) => ({ resumes: s.resumes.filter((r) => r.id !== id) }));
  },

  setActiveResume: (resume) => set({ activeResume: resume }),
}));
