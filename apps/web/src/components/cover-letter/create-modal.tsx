'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { X, FileText, Briefcase, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateCoverLetterModal({ isOpen, onClose, onCreated }: CreateModalProps) {
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jdText, setJdText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [tone, setTone] = useState('formal');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const resumesData = await api.get<any[]>('/api/resumes');
      setResumes(resumesData);
      if (resumesData.length > 0) setSelectedResumeId(resumesData[0].id);
    } catch (error) {
      toast.error('Failed to load resumes');
    }
  };

  const handleGenerate = async () => {
    if (!selectedResumeId || !jdText.trim()) {
      toast.error('Please select a resume and paste a job description');
      return;
    }

    setIsGenerating(true);
    try {
      await api.post('/api/cover-letters/generate', {
        resumeId: selectedResumeId,
        jdText: jdText.trim(),
        jobTitle: jobTitle.trim(),
        tone
      });
      toast.success('Cover letter generated successfully!');
      onCreated();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate cover letter');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[var(--gradient-2)]" />
            <h2 className="font-display font-medium">Create Custom Cover Letter</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-surface)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Resume Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1.5">
              <FileText size={14} /> Base Resume
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--gradient-1)] transition-colors"
            >
              <option value="" disabled>Select a resume</option>
              {resumes.map(r => (
                <option key={r.id} value={r.id}>{r.name} {r.isTailored ? '(Tailored)' : ''}</option>
              ))}
            </select>
          </div>

          {/* Job Details */}
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1.5">
                <Briefcase size={14} /> Job Title (Optional)
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Software Engineer at Google"
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--gradient-1)] transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--text-muted)]">
                Job Description
              </label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the job description here..."
                rows={5}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--gradient-1)] transition-colors resize-none"
              />
            </div>
          </div>

          {/* Tone Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--text-muted)]">Tone of Voice</label>
            <div className="grid grid-cols-3 gap-2">
              {['formal', 'conversational', 'storytelling'].map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                    tone === t 
                      ? 'bg-[var(--gradient-2)]/10 text-[var(--gradient-2)] border border-[var(--gradient-2)]/30' 
                      : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-transparent hover:border-[var(--border-strong)]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-[var(--bg-surface)] transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !selectedResumeId || !jdText.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isGenerating ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
            ) : (
              <><Sparkles size={16} /> Generate Cover Letter</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
