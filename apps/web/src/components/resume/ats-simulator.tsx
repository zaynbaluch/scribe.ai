'use client';

import { useState, useEffect } from 'react';
import { X, Shield, AlertTriangle, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { api } from '@/lib/api-client';

interface AtsIssue {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  fix: string;
  autoFixable: boolean;
}

interface AtsCheck {
  name: string;
  score: number;
  maxScore: number;
}

interface AtsReport {
  score: number;
  checks: AtsCheck[];
  issues: AtsIssue[];
  summary: { critical: number; warnings: number; passed: number };
}

interface AtsSimulatorProps {
  resumeId: string;
  isOpen: boolean;
  onClose: () => void;
  onScoreUpdate?: (score: number) => void;
}

export default function AtsSimulator({ resumeId, isOpen, onClose, onScoreUpdate }: AtsSimulatorProps) {
  const [report, setReport] = useState<AtsReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plainText, setPlainText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'issues' | 'preview'>('issues');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && !report) {
      runAtsCheck();
    }
  }, [isOpen]);

  const runAtsCheck = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<any>(`/api/resumes/${resumeId}/ats-score`);
      setReport(data);
      if (onScoreUpdate) onScoreUpdate(data.score);

      // Fetch plain text preview
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('scribe_access_token') : null;
        const txtRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/resumes/${resumeId}/export/txt`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        if (txtRes.ok) {
          const txt = await txtRes.text();
          setPlainText(txt);
        }
      } catch {
        setPlainText('(Could not load plain text preview)');
      }
    } catch (err: any) {
      setError(err.message || 'ATS check failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const scoreColor = report
    ? report.score >= 80 ? 'var(--success)' : report.score >= 60 ? 'var(--warning)' : 'var(--danger)'
    : 'var(--text-muted)';

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  // Group issues by category
  const issuesByCategory: Record<string, AtsIssue[]> = {};
  if (report) {
    for (const issue of report.issues) {
      if (!issuesByCategory[issue.category]) issuesByCategory[issue.category] = [];
      issuesByCategory[issue.category].push(issue);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[560px] max-w-full z-50 bg-[var(--bg-surface)] border-l border-[var(--grid-line-strong)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--grid-line-strong)]">
          <div className="flex items-center gap-2.5">
            <Shield size={18} className="text-[var(--gradient-2)]" />
            <h2 className="font-display text-lg tracking-tight">ATS Simulator</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-3 border-[var(--gradient-2)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[var(--text-muted)]">Running ATS check...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
            <AlertCircle size={32} className="text-[var(--danger)]" />
            <p className="text-sm text-[var(--danger)]">{error}</p>
            <button onClick={runAtsCheck} className="text-xs text-[var(--gradient-2)] hover:underline">Retry</button>
          </div>
        )}

        {/* Report */}
        {report && !isLoading && (
          <>
            {/* Score Header */}
            <div className="px-5 py-5 border-b border-[var(--grid-line)] flex items-center gap-5">
              {/* Circular Score */}
              <ScoreGauge score={report.score} color={scoreColor} />
              <div>
                <p className="text-sm font-medium">
                  {report.score >= 80 ? 'Great ATS compatibility!' : report.score >= 60 ? 'Needs some improvements' : 'Significant issues found'}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono">
                  {report.summary.critical > 0 && (
                    <span className="flex items-center gap-1 text-[var(--danger)]">
                      <AlertCircle size={10} /> {report.summary.critical} critical
                    </span>
                  )}
                  {report.summary.warnings > 0 && (
                    <span className="flex items-center gap-1 text-[var(--warning)]">
                      <AlertTriangle size={10} /> {report.summary.warnings} warnings
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[var(--success)]">
                    <CheckCircle2 size={10} /> {report.checks.length - report.summary.critical} passing
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--grid-line)]">
              <button onClick={() => setActiveTab('issues')}
                className={`flex-1 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === 'issues'
                    ? 'border-[var(--gradient-2)] text-[var(--text-primary)]'
                    : 'border-transparent text-[var(--text-muted)]'
                }`}>
                Issues & Checks
              </button>
              <button onClick={() => setActiveTab('preview')}
                className={`flex-1 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'border-[var(--gradient-2)] text-[var(--text-primary)]'
                    : 'border-transparent text-[var(--text-muted)]'
                }`}>
                <FileText size={12} /> What ATS Sees
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'issues' && (
                <div className="p-4 space-y-3">
                  {/* Check Bars */}
                  {report.checks.map((check, i) => (
                    <div key={i} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium">{check.name}</span>
                        <span className="text-[10px] font-mono" style={{
                          color: check.score >= check.maxScore * 0.8 ? 'var(--success)'
                            : check.score >= check.maxScore * 0.5 ? 'var(--warning)' : 'var(--danger)'
                        }}>
                          {check.score}/{check.maxScore}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{
                          width: `${(check.score / check.maxScore) * 100}%`,
                          backgroundColor: check.score >= check.maxScore * 0.8 ? 'var(--success)'
                            : check.score >= check.maxScore * 0.5 ? 'var(--warning)' : 'var(--danger)',
                        }} />
                      </div>
                    </div>
                  ))}

                  {/* Issue Categories */}
                  {report.issues.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-2">Issues to Fix</h4>
                      {Object.entries(issuesByCategory).map(([cat, catIssues]) => (
                        <div key={cat} className="mb-2">
                          <button onClick={() => toggleCategory(cat)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] transition-colors text-left">
                            <span className="text-xs font-medium">{cat}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-[var(--text-muted)]">{catIssues.length}</span>
                              {expandedCategories.has(cat) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </div>
                          </button>
                          {expandedCategories.has(cat) && (
                            <div className="mt-1 space-y-1.5 pl-2">
                              {catIssues.map((issue, j) => (
                                <div key={j} className="flex gap-2 px-3 py-2 rounded-lg border border-[var(--border-subtle)]"
                                  style={{ borderLeftWidth: '3px', borderLeftColor: issue.severity === 'critical' ? 'var(--danger)' : issue.severity === 'warning' ? 'var(--warning)' : 'var(--text-muted)' }}>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs">{issue.message}</p>
                                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">💡 {issue.fix}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {report.issues.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle2 size={32} className="text-[var(--success)] mx-auto mb-2" />
                      <p className="text-sm font-medium text-[var(--success)]">All checks passed!</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">Your resume is well-optimized for ATS.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'preview' && (
                <div className="p-4">
                  <p className="text-[10px] text-[var(--text-muted)] mb-3">
                    This is how an ATS reads your resume — stripped of all formatting, images, and styling.
                  </p>
                  <pre className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-mono whitespace-pre-wrap leading-relaxed text-[var(--text-secondary)] max-h-[60vh] overflow-y-auto">
                    {plainText || '(Loading...)'}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[var(--grid-line-strong)] flex items-center justify-between">
              <button onClick={runAtsCheck}
                className="text-xs text-[var(--gradient-2)] hover:underline">
                Re-run Check
              </button>
              <button onClick={onClose}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-[var(--gradient-1)] to-[var(--gradient-2)] text-white hover:opacity-90 transition-opacity">
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function ScoreGauge({ score, color }: { score: number; color: string }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--bg-elevated)" strokeWidth="6" />
        <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[8px] uppercase tracking-wider text-[var(--text-muted)]">ATS</span>
      </div>
    </div>
  );
}
