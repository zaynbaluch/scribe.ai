'use client';

import { FileText, MoreVertical, Copy, Trash2, Clock } from 'lucide-react';

interface ResumeCardProps {
  id: string;
  name: string;
  templateId: string;
  atsScore: number | null;
  updatedAt: string;
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

const templateColors: Record<string, string> = {
  'modern-01': '#7C3AED',
  'classic-02': '#1a1a2e',
  'compact-03': '#7C3AED',
  'minimal-04': '#71717A',
  'bold-05': '#7C3AED',
};

const templateNames: Record<string, string> = {
  'modern-01': 'Modern Clean',
  'classic-02': 'Classic Pro',
  'compact-03': 'Compact',
  'minimal-04': 'Minimalist',
  'bold-05': 'Bold',
};

export default function ResumeCard({ id, name, templateId, atsScore, updatedAt, onOpen, onDuplicate, onDelete }: ResumeCardProps) {
  const accentColor = templateColors[templateId] || '#7C3AED';
  const templateName = templateNames[templateId] || templateId;
  const timeAgo = getTimeAgo(updatedAt);

  return (
    <div
      onClick={() => onOpen(id)}
      className="group relative rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-transparent)] backdrop-blur-md cursor-pointer transition-all duration-200 hover:border-[var(--border-focus)] hover:bg-[var(--bg-elevated)] hover:-translate-y-0.5"
    >
      {/* Template preview strip */}
      <div className="h-32 rounded-t-xl bg-[var(--bg-surface)] border-b border-[var(--grid-line)] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 11px, ${accentColor} 11px, ${accentColor} 12px), repeating-linear-gradient(90deg, transparent, transparent 11px, ${accentColor} 11px, ${accentColor} 12px)`,
        }} />
        <div className="flex flex-col items-center gap-1">
          <div className="w-14 h-1 rounded-full" style={{ backgroundColor: accentColor }} />
          <div className="w-10 h-0.5 rounded-full bg-[var(--text-muted)] opacity-30" />
          <div className="mt-2 space-y-1">
            <div className="w-20 h-0.5 rounded-full bg-[var(--text-muted)] opacity-20" />
            <div className="w-16 h-0.5 rounded-full bg-[var(--text-muted)] opacity-15" />
            <div className="w-18 h-0.5 rounded-full bg-[var(--text-muted)] opacity-10" />
          </div>
        </div>

        {/* ATS Badge */}
        {atsScore !== null && atsScore !== undefined && (
          <div className={`absolute top-2 right-2 text-xs font-mono font-medium px-1.5 py-0.5 rounded-md border ${
            atsScore >= 80 ? 'text-[var(--success)] border-[var(--success)]/30 bg-[var(--success)]/10'
              : atsScore >= 60 ? 'text-[var(--warning)] border-[var(--warning)]/30 bg-[var(--warning)]/10'
              : 'text-[var(--danger)] border-[var(--danger)]/30 bg-[var(--danger)]/10'
          }`}>
            ATS {atsScore}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-sm truncate">{name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-mono px-1.5 py-0.5 rounded border border-[var(--border-subtle)] text-[var(--text-muted)]" style={{ borderColor: `${accentColor}30` }}>
            {templateName}
          </span>
          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
            <Clock size={10} /> {timeAgo}
          </span>
        </div>
      </div>

      {/* Context menu */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); onDuplicate(id); }}
          className="p-1.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors" title="Duplicate">
          <Copy size={12} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(id); }}
          className="p-1.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors" title="Delete">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
