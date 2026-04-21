'use client';

import { create } from 'zustand';
import { api } from '@/lib/api-client';

export type AppStatus = 'saved' | 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'withdrawn';

interface Application {
  id: string;
  jobId: string;
  resumeId: string | null;
  coverLetterId: string | null;
  status: AppStatus;
  appliedAt: string | null;
  notes: string | null;
  contactName: string | null;
  contactEmail: string | null;
  salaryRange: string | null;
  nextDeadline: string | null;
  createdAt: string;
  updatedAt: string;
  job: { id: string; title: string; company: string; location: string | null; matchScore: number | null };
  resume?: { id: string; name: string } | null;
}

interface Stats {
  total: number;
  applied: number;
  interviews: number;
  offers: number;
  rejected: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  avgAtsScore: number | null;
  weeklyActivity: { week: string; count: number }[];
  resumeCount: number;
}

interface ApplicationState {
  applications: Application[];
  stats: Stats | null;
  isLoading: boolean;

  fetchApplications: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createApplication: (data: any) => Promise<Application>;
  updateStatus: (appId: string, status: AppStatus) => Promise<void>;
  updateApplication: (appId: string, data: any) => Promise<void>;
  deleteApplication: (appId: string) => Promise<void>;
}

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  applications: [],
  stats: null,
  isLoading: false,

  fetchApplications: async () => {
    set({ isLoading: true });
    try {
      const apps = await api.get<Application[]>('/api/applications');
      set({ applications: apps });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await api.get<Stats>('/api/applications/stats');
      set({ stats });
    } catch { /* ignore */ }
  },

  createApplication: async (data) => {
    const app = await api.post<Application>('/api/applications', data);
    set((s) => ({ applications: [app, ...s.applications] }));
    return app;
  },

  updateStatus: async (appId, status) => {
    const updated = await api.patch<Application>(`/api/applications/${appId}/status`, { status });
    set((s) => ({
      applications: s.applications.map((a) => a.id === appId ? { ...a, ...updated } : a),
    }));
  },

  updateApplication: async (appId, data) => {
    const updated = await api.put<Application>(`/api/applications/${appId}`, data);
    set((s) => ({
      applications: s.applications.map((a) => a.id === appId ? { ...a, ...updated } : a),
    }));
  },

  deleteApplication: async (appId) => {
    await api.delete(`/api/applications/${appId}`);
    set((s) => ({ applications: s.applications.filter((a) => a.id !== appId) }));
  },
}));
