'use client';

import { useState } from 'react';
import { X, Calendar, User, DollarSign, FileText, Mail, Trash2 } from 'lucide-react';
import { type AppStatus } from '@/stores/application-store';

interface Application {
  id: string;
  status: AppStatus;
  appliedAt: string | null;
  notes: string | null;
  contactName: string | null;
  contactEmail: string | null;
  salaryRange: string | null;
  nextDeadline: string | null;
  job: { id: string; title: string; company: string; location: string | null; url: string | null; matchScore: number | null };
  resume?: { id: string; name: string } | null;
  [key: string]: any;
}

interface ApplicationDetailProps {
  app: Application;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: any) => void;
  onDelete: () => void;
}

export default function ApplicationDetail({ app, isOpen, onClose, onUpdate, onDelete }: ApplicationDetailProps) {
  const [notes, setNotes] = useState(app.notes || '');
  const [contactName, setContactName] = useState(app.contactName || '');
  const [contactEmail, setContactEmail] = useState(app.contactEmail || '');
  const [salaryRange, setSalaryRange] = useState(app.salaryRange || '');
  const [nextDeadline, setNextDeadline] = useState(app.nextDeadline?.split('T')[0] || '');

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdate({
      notes: notes || null,
      contactName: contactName || null,
      contactEmail: contactEmail || null,
      salaryRange: salaryRange || null,
      nextDeadline: nextDeadline ? new Date(nextDeadline).toISOString() : null,
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[440px] max-w-full z-50 bg-[var(--bg-primary)] border-l border-[var(--grid-line-strong)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--grid-line-strong)]">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-lg tracking-tight truncate">{app.job.title}</h2>
              <p className="text-sm text-[var(--text-muted)]">{app.job.company}{app.job.location ? ` · ${app.job.location}` : ''}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]">
              <X size={18} />
            </button>
          </div>

          {/* Status + Match */}
          <div className="flex items-center gap-2 mt-3">
            <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md uppercase tracking-wider ${
              app.status === 'offer' ? 'text-[var(--success)] bg-[var(--success)]/10'
                : app.status === 'rejected' ? 'text-[var(--danger)] bg-[var(--danger)]/10'
                : 'text-[var(--gradient-2)] bg-[var(--gradient-2)]/10'
            }`}>
              {app.status}
            </span>
            {app.job.matchScore && (
              <span className="text-[10px] font-mono text-[var(--text-muted)]">Match: {app.job.matchScore}%</span>
            )}
            {app.appliedAt && (
              <span className="text-[10px] text-[var(--text-muted)] ml-auto">
                Applied {new Date(app.appliedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Notes */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              rows={4} placeholder="Add notes about this application..."
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs resize-none focus:outline-none focus:border-[var(--border-focus)]" />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1.5 flex items-center gap-1"><User size={10} /> Contact</label>
              <input value={contactName} onChange={(e) => setContactName(e.target.value)}
                placeholder="Recruiter name" className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--border-focus)]" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1.5 flex items-center gap-1"><Mail size={10} /> Email</label>
              <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                placeholder="recruiter@co.com" className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--border-focus)]" />
            </div>
          </div>

          {/* Salary & Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1.5 flex items-center gap-1"><DollarSign size={10} /> Salary</label>
              <input value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="$80k-$120k" className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--border-focus)]" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1.5 flex items-center gap-1"><Calendar size={10} /> Deadline</label>
              <input type="date" value={nextDeadline} onChange={(e) => setNextDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--border-focus)]" />
            </div>
          </div>

          {/* Linked Resume */}
          {app.resume && (
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1.5 flex items-center gap-1"><FileText size={10} /> Linked Resume</label>
              <div className="px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs">
                {app.resume.name}
              </div>
            </div>
          )}

          {/* Job URL */}
          {app.job.url && (
            <a href={app.job.url} target="_blank" rel="noopener noreferrer"
              className="text-xs text-[var(--gradient-2)] hover:underline">
              View Original Posting →
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--grid-line-strong)] flex items-center justify-between">
          <button onClick={onDelete}
            className="flex items-center gap-1.5 text-xs text-[var(--danger)] hover:bg-[var(--danger)]/10 px-2.5 py-1.5 rounded-lg transition-colors">
            <Trash2 size={12} /> Delete
          </button>
          <button onClick={handleSave}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white hover:opacity-90 transition-opacity">
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}
