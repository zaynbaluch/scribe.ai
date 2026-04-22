'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, SortDesc } from 'lucide-react';
import { useResumeStore } from '@/stores/resume-store';
import ResumeCard from '@/components/resume/resume-card';
import CreateResumeModal from '@/components/resume/create-resume-modal';
import { toast } from 'sonner';

export default function ResumesPage() {
  const router = useRouter();
  const { resumes, isLoading, fetchResumes, duplicateResume, deleteResume } = useResumeStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [sort, setSort] = useState<'updatedAt' | 'name' | 'atsScore'>('updatedAt');

  useEffect(() => { fetchResumes(); }, [fetchResumes]);

  const sorted = [...resumes].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'atsScore') return (b.atsScore || 0) - (a.atsScore || 0);
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateResume(id);
      toast.success('Resume duplicated');
    } catch { toast.error('Failed to duplicate'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resume? This cannot be undone.')) return;
    try {
      await deleteResume(id);
      toast.success('Resume deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const baseResumes = sorted.filter(r => !r.isTailored);
  const tailoredResumes = sorted.filter(r => r.isTailored);

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl tracking-tight">Your Resumes</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{resumes.length} resume{resumes.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="relative">
            <select value={sort} onChange={(e) => setSort(e.target.value as any)}
              className="appearance-none pl-3 pr-7 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)] focus:outline-none cursor-pointer">
              <option value="updatedAt">Last Edited</option>
              <option value="name">Name</option>
              <option value="atsScore">ATS Score</option>
            </select>
            <SortDesc size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>

          <button onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white hover:opacity-90 transition-opacity">
            <Plus size={16} />
            New Resume
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 rounded-xl bg-[var(--bg-elevated)] animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4">
            <Plus size={24} className="text-[var(--text-muted)]" />
          </div>
          <h3 className="font-semibold mb-1">No resumes yet</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">Create your first resume from your profile data.</p>
          <button onClick={() => setCreateOpen(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white hover:opacity-90 transition-opacity">
            Create Resume
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Base Resumes Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Base Resumes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {baseResumes.map((r) => (
                <ResumeCard
                  key={r.id}
                  id={r.id}
                  name={r.name}
                  templateId={r.templateId}
                  atsScore={r.atsScore}
                  updatedAt={r.updatedAt}
                  onOpen={(id) => router.push(`/resumes/${id}`)}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              ))}

              {/* Create card */}
              <button onClick={() => setCreateOpen(true)}
                className="flex flex-col items-center justify-center h-52 rounded-xl border-2 border-dashed border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-focus)] hover:bg-[var(--bg-elevated)]/30 transition-all">
                <Plus size={24} className="mb-2" />
                <span className="text-sm">New Base Resume</span>
              </button>
            </div>
          </div>

          {/* Tailored Resumes Section */}
          {tailoredResumes.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 text-[var(--text-primary)] flex items-center gap-2">
                Tailored Resumes
                <span className="text-xs font-normal text-[var(--text-muted)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded-full">
                  AI Generated
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tailoredResumes.map((r) => (
                  <ResumeCard
                    key={r.id}
                    id={r.id}
                    name={r.name}
                    templateId={r.templateId}
                    atsScore={r.atsScore}
                    updatedAt={r.updatedAt}
                    onOpen={(id) => router.push(`/resumes/${id}`)}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <CreateResumeModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreated={(id) => router.push(`/resumes/${id}`)} />
    </div>
  );
}
