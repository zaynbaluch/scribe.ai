'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useTailorStore } from '@/stores/tailor-store';
import { useResumeStore } from '@/stores/resume-store';
import JobInputForm from '@/components/tailor/job-input-form';
import MatchScoreDisplay from '@/components/tailor/match-score-display';
import TailorDiffView from '@/components/tailor/tailor-diff-view';
import { toast } from 'sonner';

export default function TailorPage() {
  const router = useRouter();
  const { resumes, fetchResumes } = useResumeStore();
  const {
    step, matchResult, suggestions, isLoading, error, jobId, parsedKeywords,
    setResumeId, analyzeJob, tailorResume, acceptSuggestion, rejectSuggestion,
    acceptAll, rejectAll, applyToResume, reset,
  } = useTailorStore();

  const [selectedResumeId, setSelectedResumeId] = useState('');

  useEffect(() => { fetchResumes(); }, [fetchResumes]);
  useEffect(() => {
    const base = resumes.filter(r => !r.isTailored);
    if (base.length > 0 && !selectedResumeId) {
      setSelectedResumeId(base[0].id);
      setResumeId(base[0].id);
    }
  }, [resumes]);
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleAnalyze = (input: { text?: string; url?: string }) => {
    if (!selectedResumeId) {
      toast.error('Select a resume first');
      return;
    }
    analyzeJob(selectedResumeId, input);
  };

  const handleTailor = () => {
    if (!selectedResumeId || !jobId) return;
    tailorResume(selectedResumeId, jobId);
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {step !== 'input' && (
          <button onClick={reset}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors">
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-[var(--gradient-2)]" />
          <h1 className="font-display text-2xl tracking-tight">AI Tailoring</h1>
        </div>

        {/* Resume selector */}
        {step === 'input' && resumes.filter(r => !r.isTailored).length > 0 && (
          <div className="ml-auto">
            <select value={selectedResumeId}
              onChange={(e) => { setSelectedResumeId(e.target.value); setResumeId(e.target.value); }}
              className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs focus:outline-none">
              {resumes.filter(r => !r.isTailored).map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Steps */}
      {(step === 'input') && (
        <JobInputForm onSubmit={handleAnalyze} isLoading={isLoading} />
      )}

      {(step === 'matching') && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-3 border-[var(--gradient-2)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-[var(--text-muted)]">Analyzing job description...</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Extracting keywords and computing match score</p>
        </div>
      )}

      {(step === 'results') && matchResult && (
        <MatchScoreDisplay
          score={matchResult.score}
          strong={matchResult.strong}
          partial={matchResult.partial}
          gaps={matchResult.gaps}
          jobTitle={parsedKeywords?.title}
          onTailor={handleTailor}
          isLoading={isLoading}
        />
      )}

      {(step === 'tailoring') && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-3 border-[var(--gradient-2)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-[var(--text-muted)]">Tailoring your resume...</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Rewriting bullets and optimizing for keywords</p>
        </div>
      )}

      {(step === 'diff') && (
        <TailorDiffView
          suggestions={suggestions}
          onAccept={acceptSuggestion}
          onReject={rejectSuggestion}
          onAcceptAll={acceptAll}
          onRejectAll={rejectAll}
          onApply={applyToResume}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
