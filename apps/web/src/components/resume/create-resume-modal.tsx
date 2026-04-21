'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useResumeStore } from '@/stores/resume-store';

interface CreateResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}

export default function CreateResumeModal({ isOpen, onClose, onCreated }: CreateResumeModalProps) {
  const { templates, fetchTemplates, createResume } = useResumeStore();
  const [name, setName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('modern-01');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => { if (isOpen && templates.length === 0) fetchTemplates(); }, [isOpen]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsCreating(true);
    try {
      const resume = await createResume({ name: name.trim(), templateId: selectedTemplate });
      onCreated(resume.id);
      onClose();
      setName('');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  const templateColors: Record<string, string> = {
    'modern-01': '#7C3AED', 'classic-02': '#1a1a2e', 'compact-03': '#7C3AED',
    'minimal-04': '#71717A', 'bold-05': '#7C3AED',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg tracking-tight">Create New Resume</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Name input */}
        <div className="mb-5">
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Resume Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Backend Engineer v1"
            autoFocus
            className="w-full px-3 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--gradient-2)]/15 transition-all" />
        </div>

        {/* Template picker */}
        <div className="mb-6">
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Choose Template</label>
          <div className="grid grid-cols-5 gap-2">
            {(templates.length > 0 ? templates : [
              { id: 'modern-01', name: 'Modern', category: 'modern', description: '', isPremium: false },
              { id: 'classic-02', name: 'Classic', category: 'classic', description: '', isPremium: false },
              { id: 'compact-03', name: 'Compact', category: 'compact', description: '', isPremium: false },
              { id: 'minimal-04', name: 'Minimal', category: 'minimal', description: '', isPremium: false },
              { id: 'bold-05', name: 'Bold', category: 'bold', description: '', isPremium: false },
            ]).map((t) => (
              <button key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                  selectedTemplate === t.id
                    ? 'border-[var(--gradient-2)] bg-[var(--gradient-2)]/5 ring-1 ring-[var(--gradient-2)]/20'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-focus)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                <div className="w-full h-12 rounded bg-[var(--bg-elevated)] flex items-center justify-center">
                  <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: templateColors[t.id] || '#7C3AED' }} />
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-medium">{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Create button */}
        <button onClick={handleCreate} disabled={!name.trim() || isCreating}
          className="w-full py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
          {isCreating ? 'Creating...' : 'Create Resume'}
        </button>
      </div>
    </div>
  );
}
