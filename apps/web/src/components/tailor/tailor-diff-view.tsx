'use client';

import { Check, X, Pencil } from 'lucide-react';

interface TailorSuggestion {
  section: string;
  type: string;
  experienceTitle?: string;
  company?: string;
  original: string;
  tailored: string;
  changed: boolean;
  accepted?: boolean;
}

interface TailorDiffViewProps {
  suggestions: TailorSuggestion[];
  onAccept: (index: number) => void;
  onReject: (index: number) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onApply: () => void;
  isLoading?: boolean;
}

export default function TailorDiffView({ suggestions, onAccept, onReject, onAcceptAll, onRejectAll, onApply, isLoading }: TailorDiffViewProps) {
  const changed = suggestions.filter((s) => s.changed);
  const accepted = changed.filter((s) => s.accepted === true).length;
  const rejected = changed.filter((s) => s.accepted === false).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl tracking-tight">Tailored Resume</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {changed.length} suggestions · {accepted} accepted · {rejected} rejected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onAcceptAll}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--success)]/30 text-[var(--success)] bg-[var(--success)]/5 hover:bg-[var(--success)]/10 transition-colors">
            Accept All
          </button>
          <button onClick={onRejectAll}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--danger)]/30 text-[var(--danger)] bg-[var(--danger)]/5 hover:bg-[var(--danger)]/10 transition-colors">
            Reject All
          </button>
        </div>
      </div>

      {/* Diff Items */}
      <div className="space-y-3">
        {suggestions.map((s, i) => {
          if (!s.changed) return null;

          const isAccepted = s.accepted === true;
          const isRejected = s.accepted === false;

          return (
            <div key={i}
              className={`rounded-xl border transition-all ${
                isAccepted ? 'border-[var(--success)]/30 bg-[var(--success)]/3'
                  : isRejected ? 'border-[var(--danger)]/20 bg-[var(--danger)]/3 opacity-60'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
              }`}
            >
              {/* Header */}
              <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    s.section === 'experience' ? 'bg-blue-500/10 text-blue-500' :
                    s.section === 'projects' ? 'bg-purple-500/10 text-purple-500' :
                    'bg-amber-500/10 text-amber-500'
                  }`}>
                    {s.section}
                  </span>
                  <span className="text-[10px] font-medium text-[var(--text-primary)]">
                    {s.experienceTitle || (s as any).projectName || (s.type === 'summary' ? 'Professional Summary' : '')}
                    {s.company ? ` at ${s.company}` : ''}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-muted)] italic">
                  {s.type}
                </span>
              </div>

              {/* Side by side */}
              <div className="grid grid-cols-2 gap-0 divide-x divide-[var(--grid-line)]">
                {/* Original */}
                <div className="px-4 py-3">
                  <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider block mb-1">Original</span>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">{s.original}</p>
                </div>

                {/* Tailored */}
                <div className="px-4 py-3 border-l-2" style={{ borderLeftColor: isAccepted ? 'var(--success)' : isRejected ? 'var(--danger)' : 'var(--gradient-2)' }}>
                  <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider block mb-1">Tailored</span>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed">{s.tailored}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 px-4 py-2 border-t border-[var(--grid-line)]">
                <button onClick={() => onAccept(i)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
                    isAccepted
                      ? 'bg-[var(--success)] text-white'
                      : 'text-[var(--success)] hover:bg-[var(--success)]/10'
                  }`}>
                  <Check size={11} /> Accept
                </button>
                <button onClick={() => onReject(i)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
                    isRejected
                      ? 'bg-[var(--danger)] text-white'
                      : 'text-[var(--danger)] hover:bg-[var(--danger)]/10'
                  }`}>
                  <X size={11} /> Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Apply Action */}
      <div className="mt-8 flex justify-end">
        <button 
          onClick={onApply}
          disabled={accepted === 0 || isLoading}
          className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : <Check size={16} />}
          Apply {accepted} Changes to Resume
        </button>
      </div>
    </div>
  );
}
